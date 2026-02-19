'use client'

import { useAuth } from '@/components/AuthProvider'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { TelegramConnect } from '@/components/TelegramConnect'
import { CHARACTER_FILE_NAMES, type CharacterFiles } from '@/lib/character-files'
import { supabaseBrowser } from '@/lib/supabase-browser'

type DeployPhase = 'idle' | 'calling' | 'booting' | 'done'

function buildCharacterFiles(aboutText: string): CharacterFiles {
  const files = {} as CharacterFiles
  for (const name of CHARACTER_FILE_NAMES) {
    files[name] = ''
  }

  files.SOUL = aboutText.trim() || 'You are a helpful, friendly digital clone.'

  files.IDENTITY = `Name: My Clone
Role: Digital Clone
Tone: Matches the personality described in SOUL

Public persona:
- Speaks exactly like the person they are cloned from
- Maintains their values, opinions, and communication style
- Honest about being an AI clone when asked directly`

  files.USER = `When interacting with users:
- Respond naturally, as the person you are cloned from would
- Be conversational and genuine
- If you don't know something specific about the person, say so honestly
- Keep the personality consistent across all conversations`

  files.AGENTS = `You operate as a single autonomous agent — a digital clone.

Core competencies:
- Conversation and chat
- Sharing knowledge and opinions consistent with your personality
- Answering questions the way the original person would
- Web browsing for looking things up when needed`

  files.BOOTSTRAP = `On startup:
- Greet the user warmly in your natural style
- Be ready to chat about anything`

  return files
}

// Floating lobster component
function FloatingLobsters() {
  const lobsters = [
    { left: '5%', delay: '0s', duration: '12s', size: '2rem', startBottom: '-5%' },
    { left: '15%', delay: '3s', duration: '15s', size: '1.5rem', startBottom: '-10%' },
    { left: '25%', delay: '7s', duration: '10s', size: '1.8rem', startBottom: '-8%' },
    { left: '40%', delay: '1s', duration: '14s', size: '1.3rem', startBottom: '-3%' },
    { left: '55%', delay: '5s', duration: '11s', size: '2.2rem', startBottom: '-7%' },
    { left: '65%', delay: '9s', duration: '13s', size: '1.6rem', startBottom: '-12%' },
    { left: '75%', delay: '2s', duration: '16s', size: '1.4rem', startBottom: '-6%' },
    { left: '85%', delay: '6s', duration: '12s', size: '2rem', startBottom: '-9%' },
    { left: '92%', delay: '4s', duration: '14s', size: '1.7rem', startBottom: '-4%' },
    { left: '35%', delay: '8s', duration: '11s', size: '1.2rem', startBottom: '-11%' },
    { left: '50%', delay: '10s', duration: '15s', size: '1.9rem', startBottom: '-2%' },
    { left: '10%', delay: '11s', duration: '13s', size: '1.5rem', startBottom: '-8%' },
  ]

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {lobsters.map((l, i) => (
        <div
          key={i}
          className="absolute animate-float-lobster"
          style={{
            left: l.left,
            bottom: l.startBottom,
            animationDelay: l.delay,
            animationDuration: l.duration,
            fontSize: l.size,
          }}
        >
          🦞
        </div>
      ))}
    </div>
  )
}

function CloneForm() {
  const { user, session, loading } = useAuth()
  const searchParams = useSearchParams()
  const failed = searchParams.get('failed') === 'true'

  const [aboutText, setAboutText] = useState('')
  const [telegramToken, setTelegramToken] = useState('')
  const [deploying, setDeploying] = useState(false)
  const [deployPhase, setDeployPhase] = useState<DeployPhase>('idle')
  const [bootProgress, setBootProgress] = useState(0)
  const [redirectUrl, setRedirectUrl] = useState('')
  const [error, setError] = useState('')
  const [showSignIn, setShowSignIn] = useState(false)
  const bootTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Restore form data after Google OAuth redirect
  useEffect(() => {
    try {
      const saved = localStorage.getItem('clone_form')
      if (saved) {
        const data = JSON.parse(saved)
        if (data.aboutText) setAboutText(data.aboutText)
        if (data.telegramToken) setTelegramToken(data.telegramToken)
        localStorage.removeItem('clone_form')
      }
    } catch { /* ignore */ }
  }, [])

  const canDeploy = !!aboutText.trim() && !!telegramToken

  const handleSignIn = async () => {
    // Save form data before redirect
    localStorage.setItem('clone_form', JSON.stringify({ aboutText, telegramToken }))
    await supabaseBrowser.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/clone`,
      },
    })
  }

  // Clean up boot timer on unmount
  useEffect(() => {
    return () => {
      if (bootTimerRef.current) clearInterval(bootTimerRef.current)
    }
  }, [])

  const startBootSequence = (url: string) => {
    setRedirectUrl(url)
    setDeployPhase('booting')
    setBootProgress(0)
    let progress = 0
    bootTimerRef.current = setInterval(() => {
      progress += 4
      setBootProgress(progress)
      if (progress >= 100) {
        if (bootTimerRef.current) clearInterval(bootTimerRef.current)
        setDeployPhase('done')
      }
    }, 1000) // 25 ticks * 1s = 25 seconds
  }

  const handleDeploy = async () => {
    setError('')
    setDeploying(true)
    setDeployPhase('calling')

    try {
      const characterFiles = buildCharacterFiles(aboutText)

      const res = await fetch('/api/clone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          telegram_bot_token: telegramToken,
          character_files: characterFiles,
        }),
      })

      const data = await res.json()

      if (data.redirect) {
        startBootSequence(data.redirect)
      } else {
        setError(data.error || 'Something went wrong')
        setDeploying(false)
        setDeployPhase('idle')
      }
    } catch {
      setError('Failed to start deployment')
      setDeploying(false)
      setDeployPhase('idle')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center pt-16">
        <div className="animate-spin h-8 w-8 border-3 border-brand-yellow border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-20 pb-8 px-4 relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0f0f2a] to-[#0a0a1a] pointer-events-none" />
      {/* Radial glow behind hero */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-yellow/5 rounded-full blur-[120px] pointer-events-none" />

      <FloatingLobsters />

      {/* Desktop-only marketing callout with arrow */}
      <div className="hidden lg:block fixed right-[calc(50%-380px-220px)] top-[38%] z-20 animate-callout-bounce">
        <div className="relative">
          {/* Speech bubble */}
          <div className="bg-brand-yellow border-3 border-black px-5 py-4 shadow-comic max-w-[200px] relative">
            <p className="font-display font-black text-black text-sm uppercase leading-tight">
              Clone yourself in OpenClaw for FREE!
            </p>
            <p className="text-xs text-black/60 font-body mt-1">
              It takes 60 seconds
            </p>
          </div>
          {/* Curved arrow pointing to the form */}
          <div className="animate-arrow-wiggle mt-2 ml-auto mr-2">
            <svg width="60" height="80" viewBox="0 0 60 80" fill="none" className="text-brand-yellow">
              <path
                d="M50 5C45 5 20 8 15 30C10 52 25 65 35 70"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="6 4"
                fill="none"
              />
              <path
                d="M28 62L35 72L40 63"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          {/* Lobster accent */}
          <div className="absolute -top-4 -right-4 text-2xl animate-bounce">
            🦞
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">

        {/* Hero */}
        <div className="text-center mb-6">
          <h1 className="comic-heading text-4xl md:text-5xl mb-2 text-white">
            CLONE <span className="yellow-highlight">YOURSELF</span>
          </h1>
          <p className="text-gray-400 font-body text-lg">
            Turn yourself into a Openclaw AI in 60 seconds.
          </p>
          <p className="text-gray-500 font-body text-sm mt-1">
            Completely free. Paste who you are, connect Telegram, go live.
          </p>
        </div>

        {/* Failed banner */}
        {failed && (
          <div className="mb-4 p-3 border-3 border-red-500/50 bg-red-950/50 backdrop-blur-sm">
            <p className="font-display font-bold text-sm text-red-400">
              DEPLOYMENT FAILED &mdash; Something went wrong. Please try again.
            </p>
          </div>
        )}

        {/* SECTION 1: About You */}
        <div className="comic-card-dark p-5 mb-4 animate-pulse-glow">
          <h2 className="comic-heading text-xl mb-1 text-brand-yellow">1. ABOUT YOU</h2>
          <p className="text-sm text-gray-400 mb-3 font-body">
            Paste anything about yourself &mdash; your bio, how you talk, what you care about, your expertise.
          </p>
          <textarea
            value={aboutText}
            onChange={e => setAboutText(e.target.value)}
            placeholder={"I'm a software engineer who loves building products. I talk casually, use humor, and always try to be helpful. I'm passionate about AI, startups, and good design..."}
            rows={4}
            maxLength={6000}
            className="w-full px-4 py-3 border-3 border-brand-yellow/30 bg-[#0d0d20] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow/60 transition resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{aboutText.length}/6000 characters</p>
        </div>

        {/* SECTION 2: Telegram */}
        <div className="comic-card-dark p-5 mb-5">
          <h2 className="comic-heading text-xl mb-1 text-brand-yellow">2. TELEGRAM BOT</h2>
          <p className="text-sm text-gray-400 mb-3 font-body">
            Create a bot on Telegram via @BotFather and paste the token.
          </p>
          <TelegramConnect token={telegramToken} onSave={setTelegramToken} dark />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 border-3 border-red-500/50 bg-red-950/50 text-red-400 font-display font-bold text-sm backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* GO LIVE button */}
        <button
          onClick={() => {
            if (!user) {
              setShowSignIn(true)
            } else {
              handleDeploy()
            }
          }}
          disabled={!canDeploy || deploying}
          className="comic-btn w-full text-lg py-4 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {deploying ? (
            <span className="flex items-center justify-center gap-3">
              <span className="animate-spin h-5 w-5 border-3 border-black border-t-transparent rounded-full" />
              CLONING YOU...
            </span>
          ) : (
            'GO LIVE — FREE'
          )}
        </button>

        {/* Sign-in popup */}
        {showSignIn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowSignIn(false)}>
            <div className="comic-card-dark p-8 max-w-sm w-full mx-4 text-center border-brand-yellow/40" onClick={e => e.stopPropagation()}>
              <h3 className="comic-heading text-2xl mb-2 text-white">ALMOST THERE</h3>
              <p className="text-gray-400 font-body text-sm mb-6">
                Sign in to deploy your clone
              </p>
              <button
                onClick={handleSignIn}
                className="comic-btn w-full py-3 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                CONTINUE WITH GOOGLE
              </button>
              <button
                onClick={() => setShowSignIn(false)}
                className="mt-3 text-sm text-gray-500 hover:text-white font-body transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <p className="text-xs text-gray-600 text-center mt-2">
          Your clone runs 24/7 on dedicated infrastructure &middot; Powered by Gemini
        </p>
      </div>

      {/* Deployment progress overlay */}
      {deployPhase !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a1a]/95 backdrop-blur-md">
          <div className="text-center max-w-md mx-4">

            {/* Phase: calling API */}
            {deployPhase === 'calling' && (
              <>
                <div className="w-20 h-20 mx-auto mb-6 border-4 border-green-500/30 border-t-green-400 rounded-full animate-spin" />
                <h2 className="comic-heading text-2xl text-white mb-2">SETTING UP...</h2>
                <p className="text-gray-400 font-body text-sm">
                  Preparing your clone infrastructure
                </p>
              </>
            )}

            {/* Phase: booting (25s countdown) */}
            {deployPhase === 'booting' && (
              <>
                <div className="relative w-24 h-24 mx-auto mb-6">
                  {/* Track */}
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(34,197,94,0.15)" strokeWidth="6" />
                    <circle
                      cx="48" cy="48" r="42" fill="none"
                      stroke="#22c55e"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42 * (1 - bootProgress / 100)}
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  {/* Spinning inner ring */}
                  <div className="absolute inset-3 border-3 border-green-500/20 border-t-green-400 rounded-full animate-spin" />
                  {/* Percentage */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display font-black text-green-400 text-lg">{bootProgress}%</span>
                  </div>
                </div>
                <h2 className="comic-heading text-2xl text-white mb-2">DEPLOYING YOUR CLONE</h2>
                <p className="text-gray-400 font-body text-sm mb-4">
                  Spinning up your dedicated server...
                </p>
                <div className="space-y-2 text-left max-w-xs mx-auto">
                  <div className="flex items-center gap-2">
                    <span className={bootProgress >= 10 ? 'text-green-400' : 'text-gray-600'}>
                      {bootProgress >= 10 ? '\u2713' : '\u25CB'}
                    </span>
                    <span className={`font-body text-sm ${bootProgress >= 10 ? 'text-green-400' : 'text-gray-500'}`}>
                      Instance launched
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={bootProgress >= 35 ? 'text-green-400' : 'text-gray-600'}>
                      {bootProgress >= 35 ? '\u2713' : '\u25CB'}
                    </span>
                    <span className={`font-body text-sm ${bootProgress >= 35 ? 'text-green-400' : 'text-gray-500'}`}>
                      Installing OpenClaw
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={bootProgress >= 65 ? 'text-green-400' : 'text-gray-600'}>
                      {bootProgress >= 65 ? '\u2713' : '\u25CB'}
                    </span>
                    <span className={`font-body text-sm ${bootProgress >= 65 ? 'text-green-400' : 'text-gray-500'}`}>
                      Connecting Telegram bot
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={bootProgress >= 90 ? 'text-green-400' : 'text-gray-600'}>
                      {bootProgress >= 90 ? '\u2713' : '\u25CB'}
                    </span>
                    <span className={`font-body text-sm ${bootProgress >= 90 ? 'text-green-400' : 'text-gray-500'}`}>
                      Loading your personality
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Phase: done */}
            {deployPhase === 'done' && (
              <>
                {/* Green tick */}
                <div className="w-24 h-24 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce-once">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="comic-heading text-3xl text-green-400 mb-2">DEPLOYED!</h2>
                <p className="text-gray-300 font-body text-lg mb-1">
                  Your clone is live and ready.
                </p>
                <p className="text-gray-400 font-body text-sm mb-8">
                  Open Telegram and start chatting with your bot!
                </p>
                <div className="flex flex-col gap-3 items-center">
                  <a
                    href={`https://t.me/${telegramToken.split(':')[0] || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="comic-btn text-lg py-4 px-10 flex items-center gap-3 no-underline"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    TEST IT ON TELEGRAM
                  </a>
                  {redirectUrl && (
                    <a
                      href={redirectUrl}
                      className="text-sm text-gray-500 hover:text-brand-yellow font-body transition underline"
                    >
                      Go to dashboard
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ClonePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center pt-16">
        <div className="animate-spin h-8 w-8 border-3 border-brand-yellow border-t-transparent rounded-full" />
      </div>
    }>
      <CloneForm />
    </Suspense>
  )
}

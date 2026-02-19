'use client'

import { useAuth } from '@/components/AuthProvider'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { TelegramConnect } from '@/components/TelegramConnect'
import { CHARACTER_FILE_NAMES, type CharacterFiles } from '@/lib/character-files'
import { supabaseBrowser } from '@/lib/supabase-browser'

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

function CloneForm() {
  const { user, session, loading } = useAuth()
  const searchParams = useSearchParams()
  const failed = searchParams.get('failed') === 'true'

  const [aboutText, setAboutText] = useState('')
  const [telegramToken, setTelegramToken] = useState('')
  const [deploying, setDeploying] = useState(false)
  const [error, setError] = useState('')
  const [showSignIn, setShowSignIn] = useState(false)

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

  const handleDeploy = async () => {
    setError('')
    setDeploying(true)

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
        window.location.href = data.redirect
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch {
      setError('Failed to start deployment')
    } finally {
      setDeploying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-16">
        <div className="animate-spin h-8 w-8 border-3 border-brand-yellow border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-20 pb-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-6">
          <h1 className="comic-heading text-4xl md:text-5xl mb-2">
            CLONE <span className="yellow-highlight">YOURSELF</span>
          </h1>
          <p className="text-brand-gray-medium font-body text-lg">
            Turn yourself into a Telegram AI in 60 seconds.
          </p>
          <p className="text-brand-gray-light font-body text-sm mt-1">
            Completely free. Paste who you are, connect Telegram, go live.
          </p>
        </div>

        {/* Failed banner */}
        {failed && (
          <div className="mb-4 p-3 border-3 border-black bg-red-50">
            <p className="font-display font-bold text-sm text-red-700">
              DEPLOYMENT FAILED &mdash; Something went wrong. Please try again.
            </p>
          </div>
        )}

        {/* SECTION 1: About You */}
        <div className="comic-card p-5 mb-4">
          <h2 className="comic-heading text-xl mb-1">1. ABOUT YOU</h2>
          <p className="text-sm text-brand-gray-medium mb-3 font-body">
            Paste anything about yourself &mdash; your bio, how you talk, what you care about, your expertise.
          </p>
          <textarea
            value={aboutText}
            onChange={e => setAboutText(e.target.value)}
            placeholder={"I'm a software engineer who loves building products. I talk casually, use humor, and always try to be helpful. I'm passionate about AI, startups, and good design..."}
            rows={4}
            maxLength={6000}
            className="w-full px-4 py-3 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow transition resize-none"
          />
          <p className="text-xs text-brand-gray-medium mt-1">{aboutText.length}/6000 characters</p>
        </div>

        {/* SECTION 2: Telegram */}
        <div className="comic-card p-5 mb-5">
          <h2 className="comic-heading text-xl mb-1">2. TELEGRAM BOT</h2>
          <p className="text-sm text-brand-gray-medium mb-3 font-body">
            Create a bot on Telegram via @BotFather and paste the token.
          </p>
          <TelegramConnect token={telegramToken} onSave={setTelegramToken} />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 border-3 border-red-500 bg-red-50 text-red-700 font-display font-bold text-sm">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowSignIn(false)}>
            <div className="comic-card p-8 max-w-sm w-full mx-4 text-center" onClick={e => e.stopPropagation()}>
              <h3 className="comic-heading text-2xl mb-2">ALMOST THERE</h3>
              <p className="text-brand-gray-medium font-body text-sm mb-6">
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
                className="mt-3 text-sm text-brand-gray-medium hover:text-black font-body"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <p className="text-xs text-brand-gray-medium text-center mt-2">
          Your clone runs 24/7 on dedicated infrastructure &middot; Powered by Gemini
        </p>
      </div>
    </div>
  )
}

export default function ClonePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center pt-16">
        <div className="animate-spin h-8 w-8 border-3 border-brand-yellow border-t-transparent rounded-full" />
      </div>
    }>
      <CloneForm />
    </Suspense>
  )
}

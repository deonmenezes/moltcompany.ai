'use client'

import { useAuth } from '@/components/AuthProvider'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { TelegramConnect } from '@/components/TelegramConnect'
import { CHARACTER_FILE_NAMES, type CharacterFiles } from '@/lib/character-files'

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

  const canDeploy = !!aboutText.trim() && !!telegramToken

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-16">
        <div className="animate-spin h-8 w-8 border-3 border-brand-yellow border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-16">
        <div className="text-center">
          <h2 className="comic-heading text-3xl mb-4">SIGN IN TO CLONE</h2>
          <p className="text-brand-gray-medium mb-6">You need an account to clone yourself</p>
          <Link href="/login" className="comic-btn inline-block no-underline">SIGN IN</Link>
        </div>
      </div>
    )
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
          <div className="mb-6 p-4 border-3 border-red-500 bg-red-50 text-red-700 font-display font-bold text-sm">
            {error}
          </div>
        )}

        {/* GO LIVE button */}
        <button
          onClick={handleDeploy}
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

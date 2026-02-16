'use client'

import { useAuth } from '@/components/AuthProvider'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'

export default function PublishCompanionPage() {
  const { user, session, loading } = useAuth()
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [iconUrl, setIconUrl] = useState('')
  const [characterFile, setCharacterFile] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const captchaRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  const renderCaptcha = useCallback(() => {
    if (captchaRef.current && (window as any).turnstile && !widgetIdRef.current) {
      widgetIdRef.current = (window as any).turnstile.render(captchaRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
        callback: (token: string) => setCaptchaToken(token),
        'expired-callback': () => setCaptchaToken(''),
        theme: 'light',
      })
    }
  }, [])

  useEffect(() => {
    // If turnstile script already loaded
    if ((window as any).turnstile) renderCaptcha()
  }, [renderCaptcha])

  const isPhoneUser = !!user?.phone

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
          <h2 className="comic-heading text-3xl mb-4">SIGN IN TO PUBLISH</h2>
          <p className="text-brand-gray-medium mb-6">You need a phone-verified account to publish companions</p>
          <Link href="/login" className="comic-btn inline-block">SIGN IN</Link>
        </div>
      </div>
    )
  }

  if (!isPhoneUser) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="comic-card p-12">
            <div className="text-5xl mb-4">&#128241;</div>
            <h1 className="comic-heading text-3xl mb-4">PHONE VERIFICATION REQUIRED</h1>
            <p className="text-brand-gray-medium mb-6">
              To publish community companions, you need to sign in with a verified phone number.
              This helps keep the community safe and prevents spam.
            </p>
            <Link href="/login" className="comic-btn inline-block">SIGN IN WITH PHONE</Link>
          </div>
        </div>
      </div>
    )
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      setError('Please upload a .md or .txt file')
      return
    }
    if (file.size > 50000) {
      setError('File too large. Max 50KB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCharacterFile(ev.target?.result as string || '')
      setError('')
    }
    reader.readAsText(file)
  }

  const handleSubmit = async () => {
    setError('')
    if (!name.trim()) { setError('Companion name is required'); return }
    if (!characterFile.trim()) { setError('Character file content is required'); return }
    if (!captchaToken) { setError('Please complete the CAPTCHA verification'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          icon_url: iconUrl.trim() || null,
          character_file: characterFile,
          captcha_token: captchaToken,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to publish')
        return
      }
      router.push('/companions?filter=community')
    } catch {
      setError('Failed to publish companion')
    } finally {
      setSubmitting(false)
      // Reset captcha for retry
      setCaptchaToken('')
      if (widgetIdRef.current && (window as any).turnstile) {
        (window as any).turnstile.reset(widgetIdRef.current)
      }
    }
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Breadcrumb */}
        <div className="text-sm text-brand-gray-medium mb-6 font-display">
          <Link href="/companions" className="hover:text-black transition">All Companions</Link>
          <span className="mx-2">/</span>
          <span className="text-black font-bold">Publish</span>
        </div>

        <h1 className="comic-heading text-3xl mb-2">PUBLISH AI COMPANION</h1>
        <p className="text-brand-gray-medium mb-8">Share your custom AI companion with the community. Max 3 per user.</p>

        {/* Step 1: Icon */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-purple-500 border-3 border-black flex items-center justify-center font-display font-black text-sm text-white">1</div>
            <h2 className="comic-heading text-lg">Companion Icon</h2>
          </div>
          <div className="flex items-center gap-4">
            {iconUrl ? (
              <img src={iconUrl} alt="Icon preview" className="w-16 h-16 rounded-full avatar-comic object-cover bg-brand-gray" />
            ) : (
              <div className="w-16 h-16 rounded-full avatar-comic bg-purple-100 flex items-center justify-center">
                <span className="font-display font-black text-xl text-purple-700">{name ? name.charAt(0).toUpperCase() : '?'}</span>
              </div>
            )}
            <div className="flex-1">
              <input
                type="text"
                value={iconUrl}
                onChange={e => setIconUrl(e.target.value)}
                placeholder="Paste image URL (optional)"
                className="w-full px-4 py-3 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
              <p className="text-xs text-brand-gray-medium mt-1">Paste a direct link to an image, or leave empty for a letter icon</p>
            </div>
          </div>
        </section>

        {/* Step 2: Name */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-purple-500 border-3 border-black flex items-center justify-center font-display font-black text-sm text-white">2</div>
            <h2 className="comic-heading text-lg">Companion Name</h2>
          </div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. MAX, LUNA, ATLAS..."
            maxLength={60}
            className="w-full px-4 py-3 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition font-display font-bold uppercase"
          />
          <p className="text-xs text-brand-gray-medium mt-1">{name.length}/60 characters</p>
        </section>

        {/* Step 3: Description */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-purple-500 border-3 border-black flex items-center justify-center font-display font-black text-sm text-white">3</div>
            <h2 className="comic-heading text-lg">Description</h2>
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What does this companion do? What makes it special?"
            maxLength={300}
            rows={3}
            className="w-full px-4 py-3 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
          />
          <p className="text-xs text-brand-gray-medium mt-1">{description.length}/300 characters</p>
        </section>

        {/* Step 4: Character File */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-purple-500 border-3 border-black flex items-center justify-center font-display font-black text-sm text-white">4</div>
            <h2 className="comic-heading text-lg">Character File (MD)</h2>
          </div>
          <p className="text-sm text-brand-gray-medium mb-3">
            Upload a .md file or paste your character definition below. This defines the companion&apos;s personality, behavior, and capabilities.
          </p>
          <div className="mb-3">
            <label className="comic-btn-outline text-sm inline-block cursor-pointer">
              UPLOAD .MD FILE
              <input type="file" accept=".md,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
          <textarea
            value={characterFile}
            onChange={e => setCharacterFile(e.target.value)}
            placeholder={`# SOUL\nYou are [NAME], a [ROLE] — describe personality, values, and behavior...\n\n# IDENTITY\nName: [NAME]\nRole: [ROLE]\nTone: [TONE]\n\n# USER\nHow to interact with users...`}
            rows={12}
            maxLength={10000}
            className="w-full px-4 py-3 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none font-mono text-sm"
          />
          <p className="text-xs text-brand-gray-medium mt-1">{characterFile.length}/10000 characters</p>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 border-3 border-red-500 bg-red-50 text-red-700 font-display font-bold text-sm">
            {error}
          </div>
        )}

        {/* CAPTCHA */}
        <div className="mb-6 flex justify-center">
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            onLoad={renderCaptcha}
          />
          <div ref={captchaRef} />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !name.trim() || !characterFile.trim() || !captchaToken}
          className="comic-btn w-full text-lg py-4 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {submitting ? 'PUBLISHING...' : 'PUBLISH COMPANION'}
        </button>
        <p className="text-xs text-brand-gray-medium text-center mt-3">
          Your companion will be visible to all users in the Community section
        </p>
      </div>
    </div>
  )
}

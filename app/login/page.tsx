'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { PhoneInput } from '@/components/PhoneInput'

type AuthStep = 'choose' | 'phone-enter' | 'phone-verify'

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithPhone, verifyPhoneOtp } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState<AuthStep>('choose')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  // Redirect if already logged in
  if (!loading && user) {
    router.push('/deploy')
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-16">
        <div className="animate-spin h-8 w-8 border-3 border-brand-yellow border-t-transparent rounded-full" />
      </div>
    )
  }

  const handleSendOtp = async () => {
    setError(null)
    if (!phone || phone.length < 8) {
      setError('Enter a valid phone number with country code (e.g. +1234567890)')
      return
    }
    setSending(true)
    const { error } = await signInWithPhone(phone)
    setSending(false)
    if (error) {
      setError(error)
    } else {
      setStep('phone-verify')
    }
  }

  const handleVerifyOtp = async () => {
    setError(null)
    if (!otp || otp.length < 6) {
      setError('Enter the 6-digit code sent to your phone')
      return
    }
    setSending(true)
    const { error } = await verifyPhoneOtp(phone, otp)
    setSending(false)
    if (error) {
      setError(error)
    }
    // On success, onAuthStateChange in AuthProvider handles redirect
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center pt-16 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="comic-heading text-4xl md:text-5xl mb-3">SIGN IN</h1>
          <p className="text-brand-gray-medium font-body">
            Choose how you want to sign in to your account
          </p>
        </div>

        {/* Auth Card */}
        <div className="comic-card p-8">
          {step === 'choose' && (
            <div className="space-y-4">
              {/* Google OAuth */}
              <button
                onClick={() => signInWithGoogle()}
                className="w-full flex items-center justify-center gap-3 bg-white border-3 border-black px-6 py-4 font-display font-bold uppercase text-sm shadow-comic-sm hover:shadow-comic hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-0.5 bg-black"></div>
                <span className="font-display font-bold text-sm text-brand-gray-medium">OR</span>
                <div className="flex-1 h-0.5 bg-black"></div>
              </div>

              {/* Phone OTP */}
              <button
                onClick={() => setStep('phone-enter')}
                className="w-full flex items-center justify-center gap-3 bg-white border-3 border-black px-6 py-4 font-display font-bold uppercase text-sm shadow-comic-sm hover:shadow-comic hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                  <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
                Continue with Phone Number
              </button>
            </div>
          )}

          {step === 'phone-enter' && (
            <div className="space-y-4">
              <button
                onClick={() => { setStep('choose'); setError(null) }}
                className="text-sm font-display font-bold text-brand-gray-medium hover:text-black transition cursor-pointer"
              >
                &larr; BACK
              </button>

              <h2 className="comic-heading text-xl">ENTER PHONE NUMBER</h2>
              <p className="text-sm text-brand-gray-medium font-body">
                We&apos;ll send a 6-digit verification code via SMS
              </p>

              <PhoneInput value={phone} onChange={setPhone} autoFocus />

              {error && (
                <p className="text-red-600 text-sm font-body font-medium">{error}</p>
              )}

              <button
                onClick={handleSendOtp}
                disabled={sending}
                className="comic-btn w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'SENDING...' : 'SEND CODE'}
              </button>
            </div>
          )}

          {step === 'phone-verify' && (
            <div className="space-y-4">
              <button
                onClick={() => { setStep('phone-enter'); setOtp(''); setError(null) }}
                className="text-sm font-display font-bold text-brand-gray-medium hover:text-black transition cursor-pointer"
              >
                &larr; BACK
              </button>

              <h2 className="comic-heading text-xl">VERIFY CODE</h2>
              <p className="text-sm text-brand-gray-medium font-body">
                Enter the 6-digit code sent to <strong className="text-black">{phone}</strong>
              </p>

              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full border-3 border-black px-4 py-3 font-body text-2xl text-center tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                autoFocus
              />

              {error && (
                <p className="text-red-600 text-sm font-body font-medium">{error}</p>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={sending}
                className="comic-btn w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'VERIFYING...' : 'VERIFY & SIGN IN'}
              </button>

              <button
                onClick={handleSendOtp}
                disabled={sending}
                className="w-full text-center text-sm font-display font-bold text-brand-gray-medium hover:text-black transition cursor-pointer"
              >
                RESEND CODE
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-brand-gray-medium mt-6 font-body">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>

        <div className="text-center mt-4">
          <Link href="/" className="text-sm font-display font-bold text-brand-gray-medium hover:text-black transition">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

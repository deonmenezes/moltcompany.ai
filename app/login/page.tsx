'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const router = useRouter()

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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center pt-16 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="comic-heading text-4xl md:text-5xl mb-3">SIGN IN</h1>
          <p className="text-brand-gray-medium font-body">
            Sign in with your Google account to get started
          </p>
        </div>

        {/* Auth Card */}
        <div className="comic-card p-8">
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

          <p className="text-center text-xs text-brand-gray-medium mt-4 font-body">
            Your Google account is used to verify your identity. We never post on your behalf.
          </p>
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

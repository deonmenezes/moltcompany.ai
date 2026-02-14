'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export function Navbar() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  return (
    <nav className="fixed top-0 w-full z-50 bg-dark-bg/80 backdrop-blur-md border-b border-dark-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
          OpenClaw
        </Link>
        <div className="flex items-center gap-4">
          {loading ? null : user ? (
            <>
              <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition">
                Dashboard
              </Link>
              <div className="flex items-center gap-2">
                {user.user_metadata?.avatar_url && (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                )}
                <span className="text-sm text-gray-300">{user.email}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-500 hover:text-gray-300 transition"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple text-sm font-medium hover:opacity-90 transition"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

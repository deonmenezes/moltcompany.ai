'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export function Navbar() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  return (
    <nav className="fixed top-0 w-full z-50 bg-white border-b-3 border-black">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-black text-2xl text-black uppercase tracking-tight">
          OPENCLAW
        </Link>
        <div className="flex items-center gap-4">
          {loading ? null : user ? (
            <>
              <Link href="/dashboard" className="font-display text-sm font-bold uppercase text-black hover:text-brand-gray-medium transition">
                Dashboard
              </Link>
              <div className="flex items-center gap-2">
                {user.user_metadata?.avatar_url && (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full avatar-comic" />
                )}
                <span className="text-sm font-medium text-black hidden sm:inline">{user.email}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="text-sm font-medium text-brand-gray-medium hover:text-black transition"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="comic-btn text-sm py-2 px-6"
            >
              SIGN IN
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

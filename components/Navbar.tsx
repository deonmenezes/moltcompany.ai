'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export function Navbar() {
  const { user, loading, signOut } = useAuth()

  return (
    <nav className="fixed top-0 w-full z-50 bg-white border-b-3 border-black">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-black text-2xl text-black uppercase tracking-tight">
          MOLTCOMPANY<span className="text-brand-yellow">.AI</span>
        </Link>
        <div className="flex items-center gap-4">
          {loading ? null : user ? (
            <>
              <Link href="/console" className="font-display text-sm font-bold uppercase text-black hover:text-brand-gray-medium transition hidden sm:inline">
                Console
              </Link>
              <Link href="/community" className="font-display text-sm font-bold uppercase text-black hover:text-brand-gray-medium transition hidden sm:inline">
                Community
              </Link>
              <Link href="/create" className="comic-btn text-sm py-1.5 px-4 no-underline hidden sm:inline-block">
                + CREATE
              </Link>
              <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full avatar-comic" />
                ) : (
                  <div className="w-8 h-8 rounded-full avatar-comic bg-brand-yellow flex items-center justify-center">
                    <span className="font-display font-black text-xs">{(user.email || user.phone || '?').charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm font-medium text-brand-gray-medium hover:text-black transition"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/community" className="font-display text-sm font-bold uppercase text-black hover:text-brand-gray-medium transition hidden sm:inline">
                Community
              </Link>
              <Link
                href="/login"
                className="comic-btn text-sm py-2 px-6 no-underline"
              >
                SIGN IN
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

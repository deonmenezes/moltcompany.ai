'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function Navbar() {
  const { user, loading, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement>(null)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Close on outside click
  useEffect(() => {
    if (!mobileOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [mobileOpen])

  // Prevent scroll when menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const isActive = (path: string) => pathname === path

  return (
    <nav className="fixed top-0 w-full z-50 bg-white border-b-3 border-black">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-black text-2xl text-black uppercase tracking-tight">
          MOLTCOMPANY<span className="text-brand-yellow">.AI</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          {loading ? null : user ? (
            <>
              <Link href="/console" className={`font-display text-sm font-bold uppercase transition ${isActive('/console') ? 'text-brand-yellow' : 'text-black hover:text-brand-gray-medium'}`}>
                Console
              </Link>
              <Link href="/community" className={`font-display text-sm font-bold uppercase transition ${isActive('/community') ? 'text-brand-yellow' : 'text-black hover:text-brand-gray-medium'}`}>
                Community
              </Link>
              <Link href="/companions" className={`font-display text-sm font-bold uppercase transition ${isActive('/companions') ? 'text-brand-yellow' : 'text-black hover:text-brand-gray-medium'}`}>
                Explore
              </Link>
              <Link href="/create" className="comic-btn text-sm py-1.5 px-4 no-underline">
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
              <Link href="/community" className={`font-display text-sm font-bold uppercase transition ${isActive('/community') ? 'text-brand-yellow' : 'text-black hover:text-brand-gray-medium'}`}>
                Community
              </Link>
              <Link href="/companions" className={`font-display text-sm font-bold uppercase transition ${isActive('/companions') ? 'text-brand-yellow' : 'text-black hover:text-brand-gray-medium'}`}>
                Explore
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

        {/* Mobile hamburger button */}
        <button
          className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 border-3 border-black bg-white hover:bg-brand-yellow transition"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-black transition-all duration-200 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-black transition-all duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-black transition-all duration-200 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 top-16 bg-black/30 z-40 md:hidden" />
      )}

      {/* Mobile slide-out menu */}
      <div
        ref={menuRef}
        className={`fixed top-16 right-0 bottom-0 w-72 bg-white border-l-3 border-black z-50 transform transition-transform duration-200 md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 space-y-1 overflow-y-auto h-full">
          {user ? (
            <>
              {/* User info */}
              <div className="flex items-center gap-3 pb-4 mb-4 border-b-2 border-black/10">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-10 h-10 rounded-full avatar-comic" />
                ) : (
                  <div className="w-10 h-10 rounded-full avatar-comic bg-brand-yellow flex items-center justify-center">
                    <span className="font-display font-black text-sm">{(user.email || user.phone || '?').charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-display font-bold text-sm truncate">{user.user_metadata?.full_name || user.email || user.phone}</p>
                  <p className="text-xs text-brand-gray-medium truncate">{user.email || user.phone}</p>
                </div>
              </div>

              <MobileNavLink href="/console" label="Console" active={isActive('/console')} icon="grid" />
              <MobileNavLink href="/community" label="Community" active={isActive('/community')} icon="users" />
              <MobileNavLink href="/companions" label="Explore" active={isActive('/companions')} icon="compass" />
              <MobileNavLink href="/create" label="Create Companion" active={isActive('/create')} icon="plus" />
              <MobileNavLink href="/profile" label="Profile" active={isActive('/profile')} icon="user" />

              <div className="pt-4 mt-4 border-t-2 border-black/10">
                <button
                  onClick={() => { signOut(); setMobileOpen(false) }}
                  className="w-full text-left px-4 py-3 font-display font-bold text-sm uppercase text-red-500 hover:bg-red-50 transition"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <MobileNavLink href="/community" label="Community" active={isActive('/community')} icon="users" />
              <MobileNavLink href="/companions" label="Explore" active={isActive('/companions')} icon="compass" />
              <div className="pt-4 mt-4 border-t-2 border-black/10">
                <Link href="/login" className="comic-btn block text-center w-full text-sm" onClick={() => setMobileOpen(false)}>
                  SIGN IN
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function MobileNavLink({ href, label, active, icon }: { href: string; label: string; active: boolean; icon: string }) {
  const icons: Record<string, JSX.Element> = {
    grid: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    compass: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
    plus: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 font-display font-bold text-sm uppercase transition ${
        active ? 'bg-brand-yellow text-black' : 'text-black hover:bg-gray-50'
      }`}
    >
      {icons[icon]}
      {label}
    </Link>
  )
}

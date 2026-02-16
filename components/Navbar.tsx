'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

export function Navbar() {
  const { user, loading, signOut } = useAuth()
  const pathname = usePathname()
  const [helpOpen, setHelpOpen] = useState(false)
  const helpRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => pathname === path

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) {
        setHelpOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Bottom tab items for logged-in users
  const authTabs = [
    { href: '/console', label: 'Console', icon: 'grid' },
    { href: '/companions', label: 'Explore', icon: 'compass' },
    { href: '/create', label: 'Create', icon: 'plus' },
    { href: '/community', label: 'Community', icon: 'users' },
    { href: '/sell', label: 'Sell', icon: 'sell' },
  ]

  // Bottom tab items for logged-out users
  const guestTabs = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/companions', label: 'Explore', icon: 'compass' },
    { href: '/community', label: 'Community', icon: 'users' },
    { href: '/sell', label: 'Sell', icon: 'sell' },
    { href: '/login', label: 'Sign In', icon: 'login' },
  ]

  const tabs = user ? authTabs : guestTabs

  const navLinkClass = (path: string) =>
    `font-display text-sm font-bold uppercase transition flex items-center gap-1.5 ${isActive(path) ? 'text-brand-yellow' : 'text-black hover:text-brand-gray-medium'}`

  return (
    <>
      {/* Top bar */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b-3 border-black">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-black text-2xl text-black uppercase tracking-tight">
            MOLTCOMPANY<span className="text-brand-yellow">.AI</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5">
            {loading ? null : user ? (
              <>
                <Link href="/console" className={navLinkClass('/console')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                  Console
                </Link>
                <Link href="/community" className={navLinkClass('/community')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Community
                </Link>
                <Link href="/companions" className={navLinkClass('/companions')}>
                  Explore
                </Link>
                <Link href="/tutorials" className={navLinkClass('/tutorials')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                  Tutorials
                </Link>
                <Link href="/sell" className={navLinkClass('/sell')}>
                  Sell
                </Link>

                {/* Help dropdown (Docs + Support) */}
                <div className="relative" ref={helpRef}>
                  <button
                    onClick={() => setHelpOpen(!helpOpen)}
                    className={`font-display text-sm font-bold uppercase transition flex items-center gap-1 ${
                      isActive('/docs') || isActive('/support') ? 'text-brand-yellow' : 'text-black hover:text-brand-gray-medium'
                    }`}
                  >
                    Help
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {helpOpen && (
                    <div className="absolute top-full right-0 mt-2 w-40 bg-white border-3 border-black shadow-comic-sm z-50">
                      <Link
                        href="/docs"
                        onClick={() => setHelpOpen(false)}
                        className={`block px-4 py-2.5 font-display text-sm font-bold uppercase transition border-b-2 border-gray-100 ${isActive('/docs') ? 'text-brand-yellow' : 'text-black hover:bg-gray-50'}`}
                      >
                        Docs
                      </Link>
                      <Link
                        href="/support"
                        onClick={() => setHelpOpen(false)}
                        className={`block px-4 py-2.5 font-display text-sm font-bold uppercase transition ${isActive('/support') ? 'text-brand-yellow' : 'text-black hover:bg-gray-50'}`}
                      >
                        Support
                      </Link>
                    </div>
                  )}
                </div>

                <Link href="/company-package" className="font-display text-sm font-black uppercase bg-brand-yellow border-2 border-black px-3 py-1 hover:shadow-comic-sm transition no-underline">
                  Offer
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
                <a
                  href="https://github.com/deonmenezes/moltcompany.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:text-brand-yellow transition"
                  aria-label="Star on GitHub"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                </a>
                <button
                  onClick={() => signOut()}
                  className="text-sm font-medium text-brand-gray-medium hover:text-black transition"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/community" className={navLinkClass('/community')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Community
                </Link>
                <Link href="/companions" className={navLinkClass('/companions')}>
                  Explore
                </Link>
                <Link href="/tutorials" className={navLinkClass('/tutorials')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                  Tutorials
                </Link>
                <Link href="/sell" className={navLinkClass('/sell')}>
                  Sell
                </Link>

                {/* Help dropdown (Docs + Support) */}
                <div className="relative" ref={helpRef}>
                  <button
                    onClick={() => setHelpOpen(!helpOpen)}
                    className={`font-display text-sm font-bold uppercase transition flex items-center gap-1 ${
                      isActive('/docs') || isActive('/support') ? 'text-brand-yellow' : 'text-black hover:text-brand-gray-medium'
                    }`}
                  >
                    Help
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {helpOpen && (
                    <div className="absolute top-full right-0 mt-2 w-40 bg-white border-3 border-black shadow-comic-sm z-50">
                      <Link
                        href="/docs"
                        onClick={() => setHelpOpen(false)}
                        className={`block px-4 py-2.5 font-display text-sm font-bold uppercase transition border-b-2 border-gray-100 ${isActive('/docs') ? 'text-brand-yellow' : 'text-black hover:bg-gray-50'}`}
                      >
                        Docs
                      </Link>
                      <Link
                        href="/support"
                        onClick={() => setHelpOpen(false)}
                        className={`block px-4 py-2.5 font-display text-sm font-bold uppercase transition ${isActive('/support') ? 'text-brand-yellow' : 'text-black hover:bg-gray-50'}`}
                      >
                        Support
                      </Link>
                    </div>
                  )}
                </div>

                <Link href="/company-package" className="font-display text-sm font-black uppercase bg-brand-yellow border-2 border-black px-3 py-1 hover:shadow-comic-sm transition no-underline">
                  Offer
                </Link>
                <a
                  href="https://github.com/deonmenezes/moltcompany.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:text-brand-yellow transition"
                  aria-label="Star on GitHub"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                </a>
                <Link
                  href="/login"
                  className="comic-btn text-sm py-2 px-6 no-underline"
                >
                  SIGN IN
                </Link>
              </>
            )}
          </div>

          {/* Mobile: GitHub star + support & sign out shortcuts in top bar */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href="https://github.com/deonmenezes/moltcompany.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-black hover:text-brand-yellow transition"
              aria-label="Star on GitHub"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
            {!loading && user ? (
              <>
                <Link href="/support" className={`p-2 transition ${isActive('/support') ? 'text-brand-yellow' : 'text-black'}`} aria-label="Support">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-brand-gray-medium hover:text-black transition"
                  aria-label="Sign out"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </button>
              </>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      {!loading && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-3 border-black md:hidden safe-bottom">
          <div className="flex items-stretch">
            {tabs.map((tab) => {
              const active = isActive(tab.href)
              const isCreate = tab.icon === 'plus'

              if (isCreate) {
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className="flex-1 flex flex-col items-center justify-center py-1.5 -mt-4"
                  >
                    <div className="w-12 h-12 bg-brand-yellow border-3 border-black rounded-full flex items-center justify-center shadow-comic-sm">
                      <TabIcon name={tab.icon} active={false} />
                    </div>
                    <span className="text-[10px] font-display font-bold uppercase mt-0.5">
                      {tab.label}
                    </span>
                  </Link>
                )
              }

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex-1 flex flex-col items-center justify-center py-2 transition-colors ${
                    active ? 'text-brand-yellow' : 'text-black'
                  }`}
                >
                  <TabIcon name={tab.icon} active={active} />
                  <span className={`text-[10px] font-display font-bold uppercase mt-1 ${active ? 'text-brand-yellow' : ''}`}>
                    {tab.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? 'currentColor' : 'currentColor'
  const sw = active ? '2.5' : '2'
  const size = 22

  const icons: Record<string, JSX.Element> = {
    home: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    grid: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    compass: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    help: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    sell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="6" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="18"/></svg>,
    login: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>,
  }

  return icons[name] || null
}

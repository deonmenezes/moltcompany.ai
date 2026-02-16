'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { usePathname } from 'next/navigation'

export function Navbar() {
  const { user, loading, signOut } = useAuth()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  // Bottom tab items for logged-in users
  const authTabs = [
    { href: '/console', label: 'Console', icon: 'grid' },
    { href: '/companions', label: 'Explore', icon: 'compass' },
    { href: '/create', label: 'Create', icon: 'plus' },
    { href: '/community', label: 'Community', icon: 'users' },
    { href: '/profile', label: 'Profile', icon: 'user' },
  ]

  // Bottom tab items for logged-out users
  const guestTabs = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/companions', label: 'Explore', icon: 'compass' },
    { href: '/community', label: 'Community', icon: 'users' },
    { href: '/support', label: 'Support', icon: 'help' },
    { href: '/login', label: 'Sign In', icon: 'login' },
  ]

  const tabs = user ? authTabs : guestTabs

  return (
    <>
      {/* Top bar */}
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
                <Link href="/support" className={`font-display text-sm font-bold uppercase transition ${isActive('/support') ? 'text-brand-yellow' : 'text-black hover:text-brand-gray-medium'}`}>
                  Support
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
                <Link href="/support" className={`font-display text-sm font-bold uppercase transition ${isActive('/support') ? 'text-brand-yellow' : 'text-black hover:text-brand-gray-medium'}`}>
                  Support
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

          {/* Mobile: support & sign out shortcuts in top bar */}
          <div className="flex md:hidden items-center gap-2">
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
    login: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>,
  }

  return icons[name] || null
}

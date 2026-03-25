'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'
import { PumpBotCard } from '@/components/PumpBotCard'
import { bots as officialBots } from '@/lib/bots'
import type { UnifiedBot } from '@/app/api/bots/route'

const SORT_OPTIONS = [
  { id: 'trending', label: 'Trending' },
  { id: 'newest', label: 'Newest' },
  { id: 'most_liked', label: 'Most Liked' },
  { id: 'most_deployed', label: 'Most Deployed' },
] as const

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'operations', label: 'Operations' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'creative', label: 'Creative' },
  { id: 'business', label: 'Business' },
  { id: 'developer', label: 'Developer' },
  { id: 'education', label: 'Education' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'finance', label: 'Finance' },
] as const

const PAGE_SIZE = 30

export default function LandingPage() {
  const { session, loading: authLoading } = useAuth()
  const router = useRouter()

  const [bots, setBots] = useState<UnifiedBot[]>([])
  const [trendingBots, setTrendingBots] = useState<UnifiedBot[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('trending')
  const [category, setCategory] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [likedBotIds, setLikedBotIds] = useState<Set<string>>(new Set())
  const [likingId, setLikingId] = useState<string | null>(null)
  const fetchRef = useRef(0)

  // Fetch bots
  const fetchBots = useCallback(async (newOffset = 0, append = false) => {
    const id = ++fetchRef.current
    if (!append) setLoading(true)

    try {
      const params = new URLSearchParams({
        sort,
        category,
        limit: String(PAGE_SIZE),
        offset: String(newOffset),
      })
      if (search) params.set('q', search)

      const res = await fetch(`/api/bots?${params}`)
      const data = await res.json()

      if (id !== fetchRef.current) return // stale

      if (append) {
        setBots(prev => [...prev, ...data.bots])
      } else {
        setBots(data.bots)
      }
      setTotal(data.total)
      setOffset(newOffset)
    } catch {
      // ignore
    } finally {
      if (id === fetchRef.current) setLoading(false)
    }
  }, [sort, category, search])

  // Fetch trending for strip (always top 10 by likes)
  const fetchTrending = useCallback(async () => {
    try {
      const res = await fetch('/api/bots?sort=most_liked&limit=10')
      const data = await res.json()
      setTrendingBots(data.bots || [])
    } catch {
      // ignore
    }
  }, [])

  // Fetch user's liked bots
  const fetchLiked = useCallback(async () => {
    if (!session?.access_token) return
    try {
      const res = await fetch('/api/bots/liked', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      setLikedBotIds(new Set(data.likedBotIds || []))
    } catch {
      // ignore
    }
  }, [session?.access_token])

  // Initial fetch
  useEffect(() => {
    fetchBots(0)
    fetchTrending()
  }, [fetchBots, fetchTrending])

  // Fetch likes when auth ready
  useEffect(() => {
    if (!authLoading && session) {
      fetchLiked()
    }
  }, [authLoading, session, fetchLiked])

  // Reset offset on filter change
  useEffect(() => {
    setOffset(0)
  }, [sort, category, search])

  // Handle like
  const handleLike = async (botId: string) => {
    if (!session) {
      router.push('/login')
      return
    }
    setLikingId(botId)

    const wasLiked = likedBotIds.has(botId)

    // Optimistic update
    setLikedBotIds(prev => {
      const next = new Set(prev)
      wasLiked ? next.delete(botId) : next.add(botId)
      return next
    })
    const updateCount = (delta: number) => {
      setBots(prev => prev.map(b =>
        b.id === botId ? { ...b, likeCount: Math.max(0, b.likeCount + delta) } : b
      ))
      setTrendingBots(prev => prev.map(b =>
        b.id === botId ? { ...b, likeCount: Math.max(0, b.likeCount + delta) } : b
      ))
    }
    updateCount(wasLiked ? -1 : 1)

    try {
      const res = await fetch('/api/bots/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ bot_id: botId }),
      })
      const data = await res.json()
      // Reconcile with server
      setBots(prev => prev.map(b =>
        b.id === botId ? { ...b, likeCount: data.likeCount } : b
      ))
      setTrendingBots(prev => prev.map(b =>
        b.id === botId ? { ...b, likeCount: data.likeCount } : b
      ))
    } catch {
      // Revert
      setLikedBotIds(prev => {
        const next = new Set(prev)
        wasLiked ? next.add(botId) : next.delete(botId)
        return next
      })
      updateCount(wasLiked ? 1 : -1)
    } finally {
      setLikingId(null)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput.trim())
  }

  const hasMore = offset + PAGE_SIZE < total

  return (
    <div className="min-h-screen bg-white pt-16">

      {/* HERO WITH MARQUEE */}
      <section className="relative pt-10 pb-8 px-4 border-b-3 border-black overflow-hidden">
        {/* Bot avatar marquee background */}
        <div className="absolute inset-0 -z-10 flex flex-col justify-center gap-6 opacity-[0.07]">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...officialBots, ...officialBots, ...officialBots, ...officialBots].map((bot, i) => (
              <div key={i} className="mx-4 shrink-0 flex items-center gap-3">
                <Image src={bot.avatar} alt="" width={64} height={64} className="rounded-full" />
                <span className="font-display font-black text-3xl uppercase">{bot.characterName}</span>
                <span className="font-display font-bold text-xl uppercase text-brand-gray-medium">{bot.characterRole}</span>
              </div>
            ))}
          </div>
          <div className="flex animate-marquee-reverse whitespace-nowrap">
            {[...officialBots.slice().reverse(), ...officialBots.slice().reverse(), ...officialBots.slice().reverse(), ...officialBots.slice().reverse()].map((bot, i) => (
              <div key={i} className="mx-4 shrink-0 flex items-center gap-3">
                <Image src={bot.avatar} alt="" width={64} height={64} className="rounded-full" />
                <span className="font-display font-black text-3xl uppercase">{bot.characterName}</span>
                <span className="font-display font-bold text-xl uppercase text-brand-gray-medium">{bot.characterRole}</span>
              </div>
            ))}
          </div>
          <div className="flex animate-marquee whitespace-nowrap" style={{ animationDuration: '30s' }}>
            {[...officialBots, ...officialBots, ...officialBots, ...officialBots].map((bot, i) => (
              <div key={i} className="mx-4 shrink-0 flex items-center gap-3">
                <Image src={bot.avatar} alt="" width={64} height={64} className="rounded-full" />
                <span className="font-display font-black text-3xl uppercase">{bot.characterName}</span>
                <span className="font-display font-bold text-xl uppercase text-brand-gray-medium">{bot.characterRole}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="comic-heading text-4xl md:text-6xl mb-4 leading-[0.95]">
            WORLD&apos;S FIRST{' '}
            <span className="yellow-highlight">OPENCLAW MARKETPLACE</span>
          </h1>
          <p className="text-lg text-brand-gray-dark mb-6 max-w-2xl mx-auto font-body">
            Pick a companion. Connect Telegram/Whatsapp. Deploy. Your AI employee works 24/7.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/companions" className="comic-btn text-base inline-block">
              HIRE YOUR COMPANION
            </Link>
            <Link href="/create" className="comic-btn-outline text-base inline-block">
              CREATE YOUR OWN AGENT
            </Link>
          </div>
        </div>
      </section>

      {/* TRENDING STRIP */}
      {trendingBots.length > 0 && (
        <section className="bg-brand-yellow border-b-3 border-black py-3 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <span className="shrink-0 font-display font-black text-sm uppercase tracking-wide">
                HOT NOW
              </span>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                {trendingBots.map(bot => (
                  <Link
                    key={bot.id}
                    href={bot.href}
                    className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white border-3 border-black shadow-comic-sm hover:shadow-comic hover:-translate-y-0.5 transition-all duration-150 no-underline text-black"
                  >
                    {bot.avatar ? (
                      bot.isOfficial ? (
                        <Image
                          src={bot.avatar}
                          alt={bot.name}
                          width={24}
                          height={24}
                          className="rounded-full border-2 border-black"
                        />
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={bot.avatar}
                          alt={bot.name}
                          className="w-6 h-6 rounded-full border-2 border-black object-cover"
                        />
                      )
                    ) : (
                      <div
                        className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-bold"
                        style={{ backgroundColor: `${bot.color}40` }}
                      >
                        {bot.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-display font-bold text-xs uppercase truncate max-w-[80px]">
                      {bot.name}
                    </span>
                    <span className="flex items-center gap-0.5 text-red-500 text-xs font-bold">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      {bot.likeCount}
                    </span>
                    {bot.isOfficial && (
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full border border-green-700" title="Official" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SEARCH + FILTERS */}
      <section className="border-b-3 border-black">
        <div className="max-w-6xl mx-auto px-4 py-4 space-y-3">

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-medium" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search bots..."
                className="w-full pl-10 pr-4 py-2.5 border-3 border-black font-display text-sm placeholder-brand-gray-light focus:outline-none focus:ring-2 focus:ring-brand-yellow transition"
              />
            </div>
            <button type="submit" className="comic-btn text-sm px-5">
              SEARCH
            </button>
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setSearchInput('') }}
                className="comic-btn-outline text-sm px-4"
              >
                CLEAR
              </button>
            )}
          </form>

          {/* Sort tabs */}
          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSort(opt.id)}
                className={`px-4 py-1.5 border-3 border-black font-display font-bold text-xs uppercase transition-all duration-150 ${
                  sort === opt.id
                    ? 'bg-black text-white shadow-none translate-y-0.5'
                    : 'bg-white text-black shadow-comic-sm hover:shadow-comic hover:-translate-y-0.5'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1 border-2 border-black font-display font-bold text-[11px] uppercase transition-all duration-150 ${
                  category === cat.id
                    ? 'bg-brand-yellow text-black shadow-none'
                    : 'bg-white text-brand-gray-dark hover:bg-brand-yellow/30'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* BOT GRID */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-display font-bold text-sm text-brand-gray-medium uppercase">
            {loading ? 'Loading...' : `${total} companion${total !== 1 ? 's' : ''}`}
          </span>
          {search && (
            <span className="font-display text-sm text-brand-gray-medium">
              Results for &quot;{search}&quot;
            </span>
          )}
        </div>

        {loading && bots.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-3 border-brand-yellow border-t-transparent rounded-full" />
          </div>
        ) : bots.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">&#128533;</div>
            <h3 className="comic-heading text-xl mb-2">NO BOTS FOUND</h3>
            <p className="text-brand-gray-medium font-body">Try a different search or filter.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots.map(bot => (
                <PumpBotCard
                  key={bot.id}
                  bot={bot}
                  isLiked={likedBotIds.has(bot.id)}
                  onLike={handleLike}
                  likingId={likingId}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => fetchBots(offset + PAGE_SIZE, true)}
                  className="comic-btn-outline text-sm px-8 py-3"
                  disabled={loading}
                >
                  {loading ? 'LOADING...' : 'LOAD MORE'}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 bg-white border-t-3 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <span className="font-display font-black text-xl uppercase">MOLTCOMPANY<span className="text-brand-yellow">.AI</span></span>
              <p className="text-sm text-brand-gray-medium mt-2 font-body">AI companions, fully managed.</p>
              <div className="flex gap-3 mt-4">
                <a href="https://www.linkedin.com/company/111713673" target="_blank" rel="noopener noreferrer" className="w-9 h-9 border-2 border-black flex items-center justify-center hover:bg-brand-yellow transition" title="LinkedIn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://x.com/ai_socialdao" target="_blank" rel="noopener noreferrer" className="w-9 h-9 border-2 border-black flex items-center justify-center hover:bg-brand-yellow transition" title="X (Twitter)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm uppercase mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-brand-gray-medium">
                <li><Link href="/companions" className="hover:text-black transition">All Companions</Link></li>
                <li><Link href="/deploy" className="hover:text-black transition">Hire Companion</Link></li>
                <li><Link href="/company-package" className="hover:text-black transition text-brand-yellow font-bold">Full Company - $300/mo</Link></li>
                <li><Link href="/console" className="hover:text-black transition">Console</Link></li>
                <li><Link href="/create" className="hover:text-black transition">Create Companion</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm uppercase mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-brand-gray-medium">
                <li><Link href="/docs" className="hover:text-black transition">Documentation</Link></li>
                <li>
                  <a href="mailto:company@virelity.com" className="hover:text-black transition flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    company@virelity.com
                  </a>
                </li>
                <li>
                  <a href="tel:+971566433640" className="hover:text-black transition flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    +971 56 643 3640
                  </a>
                </li>
                <li className="pt-2">
                  <a href="https://www.linkedin.com/company/111713673" target="_blank" rel="noopener noreferrer" className="hover:text-black transition">LinkedIn</a>
                  {' '}&middot;{' '}
                  <a href="https://x.com/ai_socialdao" target="_blank" rel="noopener noreferrer" className="hover:text-black transition">X (Twitter)</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm uppercase mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-brand-gray-medium">
                <li><Link href="/profile" className="hover:text-black transition">Profile</Link></li>
                <li><Link href="/login" className="hover:text-black transition">Sign In</Link></li>
                <li><Link href="/support" className="hover:text-black transition">Support</Link></li>
                <li><Link href="/terms" className="hover:text-black transition">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-black transition">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t-2 border-black text-center text-sm text-brand-gray-medium font-body">
            &copy; {new Date().getFullYear()} MoltCompany.ai &mdash; AI Companions, Fully Managed.
          </div>
        </div>
      </footer>
    </div>
  )
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

type CommunityBot = {
  id: number
  name: string
  bot_name: string
  description: string
  icon_url: string | null
  author_name: string
  role?: string
  color?: string
  category?: string
  tags?: string[]
  upvotes: number
  downvotes: number
  view_count?: number
  deploy_count?: number
  fork_count?: number
  created_at: string
}

type SortMode = 'newest' | 'top' | 'trending' | 'most_deployed' | 'most_viewed'

const CATEGORIES = [
  { id: '', label: 'All', icon: '&#128300;' },
  { id: 'productivity', label: 'Productivity', icon: '&#9889;' },
  { id: 'creative', label: 'Creative', icon: '&#127912;' },
  { id: 'business', label: 'Business', icon: '&#128188;' },
  { id: 'education', label: 'Education', icon: '&#128218;' },
  { id: 'entertainment', label: 'Entertainment', icon: '&#127918;' },
  { id: 'developer', label: 'Developer', icon: '&#128187;' },
  { id: 'health', label: 'Health', icon: '&#128154;' },
  { id: 'social', label: 'Social', icon: '&#128172;' },
  { id: 'finance', label: 'Finance', icon: '&#128176;' },
]

const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: 'newest', label: 'Newest' },
  { id: 'top', label: 'Top Rated' },
  { id: 'trending', label: 'Trending' },
  { id: 'most_deployed', label: 'Most Hired' },
  { id: 'most_viewed', label: 'Most Viewed' },
]

function CommunityContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [bots, setBots] = useState<CommunityBot[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [sort, setSort] = useState<SortMode>((searchParams.get('sort') as SortMode) || 'newest')
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [page, setPage] = useState(0)
  const pageSize = 24

  const fetchBots = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('sort', sort)
    if (search) params.set('q', search)
    if (category) params.set('category', category)
    params.set('limit', String(pageSize))
    params.set('offset', String(page * pageSize))

    try {
      const res = await fetch(`/api/community?${params}`)
      const data = await res.json()
      setBots(data.bots || [])
      setTotal(data.total || 0)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [sort, search, category, page])

  useEffect(() => {
    fetchBots()
  }, [fetchBots])

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams()
    if (sort !== 'newest') params.set('sort', sort)
    if (search) params.set('q', search)
    if (category) params.set('category', category)
    const qs = params.toString()
    router.replace(`/community${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [sort, search, category, router])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(0)
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="comic-heading text-3xl md:text-4xl">COMMUNITY</h1>
            <p className="text-sm text-brand-gray-medium mt-1">
              Discover and deploy AI companions created by the community
            </p>
          </div>
          <div className="flex gap-2">
            {user && (
              <Link href="/create" className="comic-btn text-sm py-2 px-5 whitespace-nowrap">
                + PUBLISH
              </Link>
            )}
          </div>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search companions by name, role, or description..."
                className="w-full px-4 py-3 pl-11 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow transition"
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <button type="submit" className="comic-btn text-sm py-2 px-6">
              SEARCH
            </button>
          </div>
          {search && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-brand-gray-medium">
                {total} result{total !== 1 ? 's' : ''} for &quot;{search}&quot;
              </span>
              <button
                onClick={() => { setSearch(''); setSearchInput(''); setPage(0) }}
                className="text-xs font-display font-bold text-red-500 hover:text-red-700 uppercase"
              >
                Clear
              </button>
            </div>
          )}
        </form>

        {/* Categories */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setCategory(cat.id); setPage(0) }}
                className={`flex items-center gap-1.5 px-4 py-2 border-3 border-black font-display font-bold text-xs uppercase whitespace-nowrap transition-all duration-200 ${
                  category === cat.id
                    ? 'bg-brand-yellow shadow-comic-sm'
                    : 'bg-white hover:bg-gray-50 hover:-translate-y-0.5'
                }`}
              >
                <span dangerouslySetInnerHTML={{ __html: cat.icon }} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort + stats bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-black/10">
          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => { setSort(option.id); setPage(0) }}
                className={`px-3 py-1.5 border-2 border-black font-display font-bold text-xs uppercase transition-all duration-200 ${
                  sort === option.id
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-brand-gray-medium font-display">
            {total} companion{total !== 1 ? 's' : ''} total
          </span>
        </div>

        {/* Bot grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin h-8 w-8 border-3 border-brand-yellow border-t-transparent rounded-full" />
          </div>
        ) : bots.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots.map(bot => (
                <CommunityCard key={bot.id} bot={bot} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="comic-btn-outline text-xs py-2 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  &larr; PREV
                </button>
                <span className="text-sm font-display font-bold px-4">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="comic-btn-outline text-xs py-2 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  NEXT &rarr;
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="comic-card p-12 text-center">
            <div className="text-5xl mb-4">&#129302;</div>
            <h3 className="comic-heading text-xl mb-3">
              {search ? 'NO RESULTS FOUND' : 'NO COMPANIONS YET'}
            </h3>
            <p className="text-brand-gray-medium mb-6 max-w-md mx-auto">
              {search
                ? `No companions match "${search}". Try a different search or browse all companions.`
                : 'Be the first to create and publish an AI companion for the community!'
              }
            </p>
            {search ? (
              <button onClick={() => { setSearch(''); setSearchInput(''); setCategory('') }} className="comic-btn inline-block">
                CLEAR FILTERS
              </button>
            ) : user ? (
              <Link href="/create" className="comic-btn inline-block">
                CREATE YOUR COMPANION
              </Link>
            ) : (
              <Link href="/login" className="comic-btn inline-block">
                SIGN IN TO CREATE
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CommunityCard({ bot }: { bot: CommunityBot }) {
  const displayName = bot.name || bot.bot_name || 'Unnamed'
  const botColor = bot.color || '#8B5CF6'
  const score = (bot.upvotes || 0) - (bot.downvotes || 0)

  return (
    <div className="comic-card-hover flex flex-col">
      <div className="h-2" style={{ backgroundColor: botColor }} />
      <Link
        href={`/companions/community/${bot.id}`}
        className="p-6 pb-2 flex flex-col items-center text-center hover:bg-gray-50/50 transition"
      >
        {bot.icon_url ? (
          <img
            src={bot.icon_url}
            alt={displayName}
            className="w-20 h-20 rounded-full avatar-comic bg-brand-gray mb-3 object-cover"
          />
        ) : (
          <div
            className="w-20 h-20 rounded-full avatar-comic flex items-center justify-center mb-3"
            style={{ backgroundColor: `${botColor}30`, borderColor: botColor }}
          >
            <span className="font-display font-black text-2xl text-black">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <h3 className="comic-heading text-xl">{displayName.toUpperCase()}</h3>
        {bot.role && (
          <span
            className="inline-block mt-1 px-3 py-0.5 text-xs font-display font-bold uppercase border-2 border-black text-white"
            style={{ backgroundColor: botColor }}
          >
            {bot.role}
          </span>
        )}
        {bot.category && bot.category !== 'other' && (
          <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-display font-bold uppercase bg-gray-100 border border-gray-300 text-gray-600">
            {bot.category}
          </span>
        )}
        <span className="text-[10px] text-brand-gray-medium font-display mt-2">
          by {bot.author_name}
        </span>
        <div className="w-full mt-4">
          <div className="border-t-2 border-dashed border-brand-gray-medium" />
          <p className="font-body text-sm text-brand-gray-dark text-center mt-3 line-clamp-2">
            {bot.description || 'A community-created AI companion'}
          </p>
        </div>
      </Link>
      <div className="p-6 pt-4 mt-auto">
        {/* Stats row */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className={`flex items-center gap-1 text-sm font-bold ${score >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {score >= 0 ? '&#9650;' : '&#9660;'} {Math.abs(score)}
          </span>
          {(bot.view_count || 0) > 0 && (
            <span className="flex items-center gap-1 text-xs text-brand-gray-medium">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {bot.view_count}
            </span>
          )}
          {(bot.deploy_count || 0) > 0 && (
            <span className="flex items-center gap-1 text-xs text-brand-gray-medium">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              {bot.deploy_count}
            </span>
          )}
        </div>
        {/* Tags */}
        {bot.tags && bot.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center mb-3">
            {bot.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 text-[10px] font-display font-bold bg-gray-100 border border-gray-200 text-gray-500 uppercase">
                {tag}
              </span>
            ))}
          </div>
        )}
        <Link
          href={`/companions/community/${bot.id}`}
          className="comic-btn-outline block text-center w-full text-sm"
        >
          VIEW DETAILS
        </Link>
      </div>
    </div>
  )
}

export default function CommunityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center pt-16">
        <div className="animate-spin h-8 w-8 border-3 border-brand-yellow border-t-transparent rounded-full" />
      </div>
    }>
      <CommunityContent />
    </Suspense>
  )
}

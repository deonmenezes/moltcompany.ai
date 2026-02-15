'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

type CommunityBot = {
  id: number
  name: string
  bot_name: string
  description: string
  icon_url: string | null
  author_name: string
  role?: string
  color?: string
  upvotes: number
  downvotes: number
  created_at: string
}

type SortMode = 'newest' | 'top'

export default function CommunityPage() {
  const { user } = useAuth()
  const [bots, setBots] = useState<CommunityBot[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<SortMode>('newest')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/community?sort=${sort}`)
      .then(r => r.json())
      .then(data => setBots(data.bots || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [sort])

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="comic-heading text-3xl">COMMUNITY</h1>
            <p className="text-sm text-brand-gray-medium mt-1">
              Discover AI companions created by the community
            </p>
          </div>
          {user && (
            <Link href="/create" className="comic-btn text-sm py-2 px-5 whitespace-nowrap">
              PUBLISH YOUR COMPANION
            </Link>
          )}
        </div>

        {/* Sort tabs */}
        <div className="flex gap-2 mb-8 pb-4 border-b-2 border-black/10">
          {([
            { id: 'newest' as SortMode, label: 'Newest' },
            { id: 'top' as SortMode, label: 'Top Rated' },
          ]).map(option => (
            <button
              key={option.id}
              onClick={() => setSort(option.id)}
              className={`px-4 py-2 border-3 border-black font-display font-bold text-xs uppercase transition-all duration-200 ${
                sort === option.id
                  ? 'bg-brand-yellow shadow-comic-sm'
                  : 'bg-white hover:bg-gray-50 hover:-translate-y-0.5'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Bot grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin h-8 w-8 border-3 border-brand-yellow border-t-transparent rounded-full" />
          </div>
        ) : bots.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map(bot => (
              <CommunityCard key={bot.id} bot={bot} />
            ))}
          </div>
        ) : (
          <div className="comic-card p-12 text-center">
            <div className="text-5xl mb-4">&#129302;</div>
            <h3 className="comic-heading text-xl mb-3">NO COMPANIONS YET</h3>
            <p className="text-brand-gray-medium mb-6 max-w-md mx-auto">
              Be the first to create and publish an AI companion for the community!
            </p>
            {user ? (
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
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="flex items-center gap-1 text-sm font-bold text-green-600">
            &#9650; {bot.upvotes || 0}
          </span>
          <span className="flex items-center gap-1 text-sm font-bold text-red-500">
            &#9660; {bot.downvotes || 0}
          </span>
        </div>
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

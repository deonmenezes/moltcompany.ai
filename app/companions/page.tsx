'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { bots, categories } from '@/lib/bots'

type CommunityBot = {
  id: number
  name: string
  bot_name: string
  description: string
  icon_url: string | null
  author_name: string
  upvotes: number
  downvotes: number
  created_at: string
}

type Filter = 'all' | 'verified' | 'community' | string

export default function CompanionsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [communityBots, setCommunityBots] = useState<CommunityBot[]>([])
  const [loadingCommunity, setLoadingCommunity] = useState(true)

  useEffect(() => {
    fetch('/api/community')
      .then(r => r.json())
      .then(data => setCommunityBots(data.bots || []))
      .catch(() => {})
      .finally(() => setLoadingCommunity(false))
  }, [])

  // Filter logic
  const filteredOfficial = bots.filter(b => {
    if (filter === 'community') return false
    if (filter === 'all' || filter === 'verified') return true
    return b.category === filter
  })

  const showCommunity = filter === 'all' || filter === 'community'

  const filterOptions: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'verified', label: 'Verified' },
    { id: 'community', label: 'Community' },
    ...categories.filter(c => c.id !== 'all').map(c => ({ id: c.id as Filter, label: c.label })),
  ]

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="comic-heading text-3xl">ALL AI COMPANIONS</h1>
            <p className="text-sm text-brand-gray-medium mt-1">Browse verified and community-created AI companions</p>
          </div>
          <Link href="/community/publish" className="comic-btn text-sm py-2 px-5 whitespace-nowrap">
            PUBLISH COMPANION
          </Link>
        </div>

        {/* Amazon-style filter bar */}
        <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b-2 border-black/10">
          {filterOptions.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 border-3 border-black font-display font-bold text-xs uppercase transition-all duration-200 ${
                filter === f.id
                  ? 'bg-brand-yellow shadow-comic-sm'
                  : 'bg-white hover:bg-gray-50 hover:-translate-y-0.5'
              }`}
            >
              {f.label}
              {f.id === 'verified' && (
                <span className="ml-1 text-[10px] bg-green-500 text-white px-1.5 py-0.5 -mr-1 font-bold">&#10003;</span>
              )}
            </button>
          ))}
        </div>

        {/* Verified / Official Companions */}
        {filteredOfficial.length > 0 && (
          <section className="mb-12">
            {filter !== 'verified' && filter !== 'all' && filter !== 'community' ? null : (
              <div className="flex items-center gap-2 mb-6">
                <h2 className="comic-heading text-xl">
                  {filter === 'verified' ? 'VERIFIED COMPANIONS' : filter === 'community' ? '' : 'VERIFIED COMPANIONS'}
                </h2>
                <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-display font-bold uppercase border border-green-700">
                  Official
                </span>
              </div>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOfficial.map(bot => (
                <OfficialCard key={bot.id} bot={bot} />
              ))}
            </div>
          </section>
        )}

        {/* Community Companions */}
        {showCommunity && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <h2 className="comic-heading text-xl">COMMUNITY COMPANIONS</h2>
              <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-display font-bold uppercase border border-purple-700">
                User-Created
              </span>
            </div>
            {loadingCommunity ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-3 border-brand-yellow border-t-transparent rounded-full" />
              </div>
            ) : communityBots.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {communityBots.map(bot => (
                  <CommunityCard key={bot.id} bot={bot} />
                ))}
              </div>
            ) : (
              <div className="comic-card p-8 text-center">
                <p className="text-brand-gray-medium mb-4">No community companions yet. Be the first to publish one!</p>
                <Link href="/community/publish" className="comic-btn-outline text-sm inline-block">
                  PUBLISH YOUR COMPANION
                </Link>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

function OfficialCard({ bot }: { bot: typeof bots[number] }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="comic-card-hover flex flex-col">
      <div className="h-2" style={{ backgroundColor: bot.color }} />
      <Link href={`/companion/${bot.id}`} className="p-6 pb-2 flex flex-col items-center text-center hover:bg-gray-50/50 transition">
        {!bot.avatar || imgError ? (
          <div
            className="w-20 h-20 rounded-full avatar-comic flex items-center justify-center mb-3"
            style={{ backgroundColor: `${bot.color}30`, borderColor: bot.color }}
          >
            <span className="font-display font-black text-2xl text-black">
              {bot.characterName.charAt(0)}
            </span>
          </div>
        ) : (
          <Image
            src={bot.avatar}
            alt={bot.characterName}
            width={80}
            height={80}
            className="avatar-comic rounded-full bg-brand-gray mb-3"
            onError={() => setImgError(true)}
          />
        )}
        <div className="flex items-center gap-1.5 mb-1">
          <h3 className="comic-heading text-2xl">{bot.characterName}</h3>
          <span className="text-green-500 text-sm" title="Verified">&#10003;</span>
        </div>
        <span
          className="inline-block mt-1 px-3 py-0.5 text-xs font-display font-bold uppercase border-2 border-black"
          style={{ backgroundColor: bot.color, color: bot.color === '#FFD600' ? '#000' : '#fff' }}
        >
          {bot.characterRole}
        </span>
        <div className="w-full mt-4">
          <div className="border-t-2 border-dashed border-brand-gray-medium" />
          <p className="font-body text-sm text-brand-gray-dark text-center mt-3">
            {bot.tagline}
          </p>
        </div>
      </Link>
      <div className="p-6 pt-4 mt-auto">
        <div className="flex items-baseline justify-center gap-2 mb-4">
          <span className="comic-heading text-3xl">$40</span>
          <span className="text-brand-gray-medium font-medium text-sm">/month</span>
        </div>
        <div className="flex gap-2">
          <Link href={`/companion/${bot.id}`} className="comic-btn-outline block text-center flex-1 text-sm">
            VIEW DETAILS
          </Link>
          <Link href={`/deploy?model=${bot.id}`} className="comic-btn block text-center flex-1 text-sm">
            HIRE
          </Link>
        </div>
      </div>
    </div>
  )
}

function CommunityCard({ bot }: { bot: CommunityBot }) {
  return (
    <div className="comic-card-hover flex flex-col">
      <div className="h-2 bg-purple-500" />
      <Link href={`/companions/community/${bot.id}`} className="p-6 pb-2 flex flex-col items-center text-center hover:bg-gray-50/50 transition">
        {bot.icon_url ? (
          <img
            src={bot.icon_url}
            alt={bot.name || bot.bot_name}
            className="w-20 h-20 rounded-full avatar-comic bg-brand-gray mb-3 object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full avatar-comic flex items-center justify-center mb-3 bg-purple-100 border-purple-500">
            <span className="font-display font-black text-2xl text-purple-700">
              {(bot.name || bot.bot_name || '?').charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <h3 className="comic-heading text-xl">{bot.name || bot.bot_name}</h3>
        <span className="text-[10px] text-brand-gray-medium font-display mt-1">
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

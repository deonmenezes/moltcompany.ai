'use client'

import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type CommunityBot = {
  id: number
  name: string
  bot_name: string
  description: string
  icon_url: string | null
  character_file: string | null
  soul_md: string | null
  author_name: string
  author_email: string
  upvotes: number
  downvotes: number
  created_at: string
}

export default function CommunityBotDetailPage() {
  const params = useParams()
  const botId = Number(params.id)
  const { user, session } = useAuth()

  const [bot, setBot] = useState<CommunityBot | null>(null)
  const [loading, setLoading] = useState(true)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const [voting, setVoting] = useState(false)

  useEffect(() => {
    if (!botId) return
    fetch(`/api/community?sort=newest`)
      .then(r => r.json())
      .then(data => {
        const found = (data.bots || []).find((b: CommunityBot) => b.id === botId)
        setBot(found || null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [botId])

  const handleVote = async (type: 'up' | 'down') => {
    if (!session?.access_token || voting) return
    setVoting(true)
    try {
      const res = await fetch('/api/community/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ bot_id: botId, vote_type: type }),
      })
      const data = await res.json()
      setUserVote(data.voted)
      // Refresh bot data
      const refreshRes = await fetch(`/api/community?sort=newest`)
      const refreshData = await refreshRes.json()
      const updated = (refreshData.bots || []).find((b: CommunityBot) => b.id === botId)
      if (updated) setBot(updated)
    } catch {
      // ignore
    } finally {
      setVoting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-16">
        <div className="animate-spin h-8 w-8 border-3 border-brand-yellow border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!bot) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="comic-heading text-3xl mb-4">COMPANION NOT FOUND</h1>
          <Link href="/companions" className="comic-btn inline-block">BROWSE COMPANIONS</Link>
        </div>
      </div>
    )
  }

  const displayName = bot.name || bot.bot_name || 'Unnamed'
  const characterContent = bot.character_file || bot.soul_md || ''

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <div className="text-sm text-brand-gray-medium mb-6 font-display">
          <Link href="/companions" className="hover:text-black transition">All Companions</Link>
          <span className="mx-2">/</span>
          <Link href="/companions?filter=community" className="hover:text-black transition">Community</Link>
          <span className="mx-2">/</span>
          <span className="text-black font-bold">{displayName}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-10 mb-16">

          {/* Left: Icon + voting */}
          <div>
            <div className="comic-card p-8 flex flex-col items-center">
              <div className="h-2 w-full -mt-8 -mx-8 mb-6 bg-purple-500" style={{ marginLeft: '-2rem', marginRight: '-2rem', width: 'calc(100% + 4rem)' }} />
              {bot.icon_url ? (
                <img
                  src={bot.icon_url}
                  alt={displayName}
                  className="w-[180px] h-[180px] rounded-full avatar-comic bg-brand-gray object-cover"
                />
              ) : (
                <div className="w-[180px] h-[180px] rounded-full avatar-comic flex items-center justify-center bg-purple-100" style={{ border: '4px solid black' }}>
                  <span className="font-display font-black text-7xl text-purple-700">{displayName.charAt(0).toUpperCase()}</span>
                </div>
              )}

              {/* Voting */}
              <div className="flex items-center gap-6 mt-6">
                <button
                  onClick={() => handleVote('up')}
                  disabled={!user || voting}
                  className={`flex items-center gap-2 px-4 py-2 border-3 border-black font-display font-bold text-sm transition-all ${
                    userVote === 'up' ? 'bg-green-100 shadow-comic-sm' : 'bg-white hover:bg-green-50'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <span className="text-green-600 text-lg">&#9650;</span>
                  <span>{bot.upvotes || 0}</span>
                </button>
                <button
                  onClick={() => handleVote('down')}
                  disabled={!user || voting}
                  className={`flex items-center gap-2 px-4 py-2 border-3 border-black font-display font-bold text-sm transition-all ${
                    userVote === 'down' ? 'bg-red-100 shadow-comic-sm' : 'bg-white hover:bg-red-50'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <span className="text-red-500 text-lg">&#9660;</span>
                  <span>{bot.downvotes || 0}</span>
                </button>
              </div>
              {!user && (
                <p className="text-xs text-brand-gray-medium mt-2">Sign in to vote</p>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="comic-heading text-4xl">{displayName}</h1>
              <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-display font-bold uppercase border border-purple-700">
                Community
              </span>
            </div>
            <p className="text-sm text-brand-gray-medium font-display mb-4">by {bot.author_name}</p>

            <p className="text-brand-gray-dark font-body text-lg mb-6">
              {bot.description || 'A community-created AI companion.'}
            </p>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="comic-card p-3">
                <div className="text-[10px] font-display font-bold uppercase text-brand-gray-medium">Type</div>
                <div className="text-sm font-bold text-purple-600">Community</div>
              </div>
              <div className="comic-card p-3">
                <div className="text-[10px] font-display font-bold uppercase text-brand-gray-medium">Published</div>
                <div className="text-sm font-bold text-black">{new Date(bot.created_at).toLocaleDateString()}</div>
              </div>
              <div className="comic-card p-3">
                <div className="text-[10px] font-display font-bold uppercase text-brand-gray-medium">Score</div>
                <div className="text-sm font-bold text-black">{(bot.upvotes || 0) - (bot.downvotes || 0)} points</div>
              </div>
              <div className="comic-card p-3">
                <div className="text-[10px] font-display font-bold uppercase text-brand-gray-medium">Channel</div>
                <div className="text-sm font-bold text-black">Telegram</div>
              </div>
            </div>

            {/* CTA */}
            <div className="comic-card p-6" style={{ borderColor: '#8B5CF6' }}>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="comic-heading text-4xl">$40</span>
                <span className="text-brand-gray-medium font-medium">/month</span>
              </div>
              <p className="text-xs text-brand-gray-medium mb-4">Deploy this community companion on your own server. Choose any LLM provider.</p>
              <Link
                href={`/deploy?community=${bot.id}`}
                className="comic-btn block text-center w-full text-lg"
              >
                HIRE {displayName.toUpperCase()}
              </Link>
            </div>
          </div>
        </div>

        {/* Character file preview */}
        {characterContent && (
          <section className="mb-16">
            <div className="border-t-3 border-black pt-10">
              <h2 className="comic-heading text-2xl mb-4">CHARACTER FILE</h2>
              <div className="comic-card p-6">
                <pre className="whitespace-pre-wrap text-sm font-body text-brand-gray-dark max-h-96 overflow-y-auto">
                  {characterContent}
                </pre>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

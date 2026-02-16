'use client'

import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

type Review = {
  id: string
  user_name: string
  user_avatar: string | null
  rating: number
  comment: string
  created_at: string
}

export default function CommunityBotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const botId = Number(params.id)
  const { user, session } = useAuth()

  const [bot, setBot] = useState<CommunityBot | null>(null)
  const [loading, setLoading] = useState(true)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const [voting, setVoting] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'character' | 'reviews'>('overview')
  const [copied, setCopied] = useState(false)
  const [forking, setForking] = useState(false)

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submittingReview, setSubmittingReview] = useState(false)

  // Related bots
  const [relatedBots, setRelatedBots] = useState<CommunityBot[]>([])

  useEffect(() => {
    if (!botId) return
    fetch(`/api/community?sort=newest&limit=200`)
      .then(r => r.json())
      .then(data => {
        const allBots = data.bots || []
        const found = allBots.find((b: CommunityBot) => b.id === botId)
        setBot(found || null)

        // Find related bots (same category or role)
        if (found) {
          const related = allBots
            .filter((b: CommunityBot) =>
              b.id !== botId &&
              (b.category === found.category || b.role === found.role)
            )
            .slice(0, 3)
          setRelatedBots(related)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [botId])

  // Fetch reviews
  useEffect(() => {
    if (!botId) return
    fetch(`/api/reviews?bot_id=${botId}`)
      .then(r => r.json())
      .then(data => {
        setReviews(data.reviews || [])
        setAvgRating(data.averageRating || 0)
        setTotalReviews(data.totalReviews || 0)
      })
      .catch(() => {})
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
      const refreshRes = await fetch(`/api/community?sort=newest&limit=200`)
      const refreshData = await refreshRes.json()
      const updated = (refreshData.bots || []).find((b: CommunityBot) => b.id === botId)
      if (updated) setBot(updated)
    } catch {
      // ignore
    } finally {
      setVoting(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${bot?.name || 'AI Companion'} on MoltCompany.AI`,
          text: bot?.description || 'Check out this AI companion!',
          url,
        })
        return
      } catch {
        // fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFork = async () => {
    if (!session?.access_token || forking) return
    setForking(true)
    try {
      const res = await fetch('/api/community/fork', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ bot_id: botId }),
      })
      const data = await res.json()
      if (data.forked_id) {
        router.push(`/companions/community/${data.forked_id}`)
      } else {
        alert(data.error || 'Failed to fork')
      }
    } catch {
      alert('Failed to fork companion')
    } finally {
      setForking(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!session?.access_token || submittingReview || !reviewText.trim()) return
    setSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          bot_id: botId,
          rating: reviewRating,
          comment: reviewText.trim(),
        }),
      })
      if (res.ok) {
        setReviewText('')
        setReviewRating(5)
        const refreshRes = await fetch(`/api/reviews?bot_id=${botId}`)
        const refreshData = await refreshRes.json()
        setReviews(refreshData.reviews || [])
        setAvgRating(refreshData.averageRating || 0)
        setTotalReviews(refreshData.totalReviews || 0)
      }
    } catch {
      // ignore
    } finally {
      setSubmittingReview(false)
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
          <Link href="/community" className="comic-btn inline-block">BROWSE COMMUNITY</Link>
        </div>
      </div>
    )
  }

  const displayName = bot.name || bot.bot_name || 'Unnamed'
  const characterContent = bot.character_file || bot.soul_md || ''
  const botColor = bot.color || '#8B5CF6'
  const score = (bot.upvotes || 0) - (bot.downvotes || 0)

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <div className="text-sm text-brand-gray-medium mb-6 font-display">
          <Link href="/community" className="hover:text-black transition">Community</Link>
          <span className="mx-2">/</span>
          {bot.category && bot.category !== 'other' && (
            <>
              <Link href={`/community?category=${bot.category}`} className="hover:text-black transition capitalize">
                {bot.category}
              </Link>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-black font-bold">{displayName}</span>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">

          {/* Left sidebar */}
          <div className="md:col-span-1">
            <div className="comic-card p-6 flex flex-col items-center md:sticky md:top-24">
              <div className="h-2 w-full -mt-6 -mx-6 mb-5" style={{ backgroundColor: botColor, marginLeft: 'calc(-1.5rem)', marginRight: 'calc(-1.5rem)', width: 'calc(100% + 3rem)' }} />
              {bot.icon_url ? (
                <img src={bot.icon_url} alt={displayName} className="w-32 h-32 rounded-full avatar-comic bg-brand-gray object-cover" />
              ) : (
                <div className="w-32 h-32 rounded-full avatar-comic flex items-center justify-center" style={{ backgroundColor: `${botColor}20`, border: '4px solid black' }}>
                  <span className="font-display font-black text-5xl" style={{ color: botColor }}>{displayName.charAt(0).toUpperCase()}</span>
                </div>
              )}

              {/* Voting */}
              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={() => handleVote('up')}
                  disabled={!user || voting}
                  className={`flex items-center gap-1.5 px-4 py-2 border-3 border-black font-display font-bold text-sm transition-all ${
                    userVote === 'up' ? 'bg-green-100 shadow-comic-sm' : 'bg-white hover:bg-green-50'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <span className="text-green-600">&#9650;</span>
                  <span>{bot.upvotes || 0}</span>
                </button>
                <button
                  onClick={() => handleVote('down')}
                  disabled={!user || voting}
                  className={`flex items-center gap-1.5 px-4 py-2 border-3 border-black font-display font-bold text-sm transition-all ${
                    userVote === 'down' ? 'bg-red-100 shadow-comic-sm' : 'bg-white hover:bg-red-50'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <span className="text-red-500">&#9660;</span>
                  <span>{bot.downvotes || 0}</span>
                </button>
              </div>
              {!user && <p className="text-xs text-brand-gray-medium mt-2">Sign in to vote</p>}

              {/* Action buttons */}
              <div className="w-full mt-5 space-y-2">
                <button onClick={handleShare} className="comic-btn-outline w-full text-xs py-2 flex items-center justify-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  {copied ? 'LINK COPIED!' : 'SHARE'}
                </button>
                {user && (
                  <button onClick={handleFork} disabled={forking} className="comic-btn-outline w-full text-xs py-2 flex items-center justify-center gap-2 disabled:opacity-50">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"/><path d="M12 12v3"/></svg>
                    {forking ? 'FORKING...' : `FORK (${bot.fork_count || 0})`}
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="w-full mt-5 pt-4 border-t-2 border-black/10 grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-lg font-display font-black">{score}</div>
                  <div className="text-[10px] text-brand-gray-medium font-display font-bold uppercase">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-display font-black">{bot.view_count || 0}</div>
                  <div className="text-[10px] text-brand-gray-medium font-display font-bold uppercase">Views</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-display font-black">{bot.deploy_count || 0}</div>
                  <div className="text-[10px] text-brand-gray-medium font-display font-bold uppercase">Hired</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-display font-black">{bot.fork_count || 0}</div>
                  <div className="text-[10px] text-brand-gray-medium font-display font-bold uppercase">Forks</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right content */}
          <div className="md:col-span-2">
            <div className="flex items-start gap-3 mb-1">
              <h1 className="comic-heading text-3xl md:text-4xl">{displayName}</h1>
              <span className="mt-1 px-2 py-0.5 text-[10px] font-display font-bold uppercase border border-black text-white" style={{ backgroundColor: botColor }}>
                Community
              </span>
            </div>
            <p className="text-sm text-brand-gray-medium font-display mb-1">by {bot.author_name}</p>
            {bot.role && (
              <span className="inline-block px-3 py-0.5 text-xs font-display font-bold uppercase border-2 border-black text-white mb-3" style={{ backgroundColor: botColor }}>
                {bot.role}
              </span>
            )}

            {/* Tags */}
            {bot.tags && bot.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {bot.tags.map(tag => (
                  <Link key={tag} href={`/community?q=${encodeURIComponent(tag)}`} className="px-2.5 py-1 text-[10px] font-display font-bold bg-gray-100 border border-gray-300 text-gray-600 uppercase hover:bg-gray-200 transition">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Rating + date */}
            <div className="flex items-center gap-4 mb-6">
              {totalReviews > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-brand-yellow text-sm">
                    {[1, 2, 3, 4, 5].map(i => (
                      <span key={i}>{i <= Math.round(avgRating) ? '\u2605' : '\u2606'}</span>
                    ))}
                  </span>
                  <span className="text-xs text-brand-gray-medium font-display">
                    {avgRating} ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
              <span className="text-xs text-brand-gray-medium">
                Published {new Date(bot.created_at).toLocaleDateString()}
              </span>
            </div>

            <p className="text-brand-gray-dark font-body text-lg mb-6">
              {bot.description || 'A community-created AI companion.'}
            </p>

            {/* CTA */}
            <div className="comic-card p-6 mb-8" style={{ borderColor: botColor }}>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="comic-heading text-3xl">$40</span>
                <span className="text-brand-gray-medium font-medium">/month</span>
              </div>
              <p className="text-xs text-brand-gray-medium mb-4">Deploy this community companion on your own dedicated server. Choose any LLM provider.</p>
              <Link href={`/deploy?community=${bot.id}`} className="comic-btn block text-center w-full text-lg">
                HIRE {displayName.toUpperCase()}
              </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b-3 border-black">
              {(['overview', 'character', 'reviews'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 font-display font-bold text-sm uppercase transition-all ${
                    activeTab === tab
                      ? 'bg-brand-yellow border-3 border-black border-b-0 -mb-[3px]'
                      : 'bg-white text-brand-gray-medium hover:text-black'
                  }`}
                >
                  {tab === 'reviews' ? `REVIEWS (${totalReviews})` : tab.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="comic-card p-3">
                    <div className="text-[10px] font-display font-bold uppercase text-brand-gray-medium">Type</div>
                    <div className="text-sm font-bold" style={{ color: botColor }}>Community</div>
                  </div>
                  <div className="comic-card p-3">
                    <div className="text-[10px] font-display font-bold uppercase text-brand-gray-medium">Category</div>
                    <div className="text-sm font-bold text-black capitalize">{bot.category || 'Other'}</div>
                  </div>
                  <div className="comic-card p-3">
                    <div className="text-[10px] font-display font-bold uppercase text-brand-gray-medium">Channel</div>
                    <div className="text-sm font-bold text-black">Telegram</div>
                  </div>
                  <div className="comic-card p-3">
                    <div className="text-[10px] font-display font-bold uppercase text-brand-gray-medium">Published</div>
                    <div className="text-sm font-bold text-black">{new Date(bot.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="comic-card p-3">
                    <div className="text-[10px] font-display font-bold uppercase text-brand-gray-medium">Rating</div>
                    <div className="text-sm font-bold text-black">{totalReviews > 0 ? `${avgRating}/5` : 'No ratings'}</div>
                  </div>
                  <div className="comic-card p-3">
                    <div className="text-[10px] font-display font-bold uppercase text-brand-gray-medium">Score</div>
                    <div className="text-sm font-bold text-black">{score} points</div>
                  </div>
                </div>

                {characterContent && (
                  <div>
                    <h3 className="comic-heading text-lg mb-3">CHARACTER PREVIEW</h3>
                    <div className="comic-card p-4">
                      <pre className="whitespace-pre-wrap text-sm font-body text-brand-gray-dark max-h-48 overflow-y-auto">
                        {characterContent.slice(0, 500)}{characterContent.length > 500 ? '...' : ''}
                      </pre>
                      {characterContent.length > 500 && (
                        <button onClick={() => setActiveTab('character')} className="text-xs font-display font-bold text-brand-yellow mt-2 uppercase hover:underline">
                          View full character file &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Character */}
            {activeTab === 'character' && (
              <div>
                <h3 className="comic-heading text-lg mb-3">CHARACTER FILE</h3>
                {characterContent ? (
                  <div className="comic-card p-6">
                    <pre className="whitespace-pre-wrap text-sm font-body text-brand-gray-dark max-h-[600px] overflow-y-auto">
                      {characterContent}
                    </pre>
                  </div>
                ) : (
                  <p className="text-brand-gray-medium">No character file provided.</p>
                )}
              </div>
            )}

            {/* Tab: Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {user ? (
                  <div className="comic-card p-6">
                    <h3 className="comic-heading text-lg mb-4">WRITE A REVIEW</h3>
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setReviewRating(star)} className={`text-2xl transition ${star <= reviewRating ? 'text-brand-yellow' : 'text-gray-300'} hover:text-brand-yellow`}>
                          {star <= reviewRating ? '\u2605' : '\u2606'}
                        </button>
                      ))}
                      <span className="text-sm text-brand-gray-medium ml-2">{reviewRating}/5</span>
                    </div>
                    <textarea
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      placeholder="Share your experience with this companion..."
                      maxLength={500}
                      rows={3}
                      className="w-full px-4 py-3 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow transition resize-none mb-3"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-brand-gray-medium">{reviewText.length}/500</span>
                      <button onClick={handleSubmitReview} disabled={submittingReview || !reviewText.trim()} className="comic-btn text-sm py-2 px-6 disabled:opacity-30">
                        {submittingReview ? 'POSTING...' : 'POST REVIEW'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="comic-card p-6 text-center">
                    <p className="text-brand-gray-medium mb-3">Sign in to leave a review</p>
                    <Link href="/login" className="comic-btn-outline text-sm inline-block">SIGN IN</Link>
                  </div>
                )}

                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map(review => (
                      <div key={review.id} className="comic-card p-5">
                        <div className="flex items-center gap-3 mb-2">
                          {review.user_avatar ? (
                            <img src={review.user_avatar} alt="" className="w-8 h-8 rounded-full border-2 border-black object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-black flex items-center justify-center">
                              <span className="font-display font-black text-xs">{review.user_name.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-display font-bold text-sm">{review.user_name}</p>
                            <span className="text-brand-yellow text-xs">
                              {[1, 2, 3, 4, 5].map(i => (
                                <span key={i}>{i <= review.rating ? '\u2605' : '\u2606'}</span>
                              ))}
                            </span>
                          </div>
                          <span className="text-[10px] text-brand-gray-medium">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-brand-gray-dark font-body">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="comic-card p-8 text-center">
                    <p className="text-brand-gray-medium">No reviews yet. Be the first to review this companion!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related companions */}
        {relatedBots.length > 0 && (
          <section className="border-t-3 border-black pt-10">
            <h2 className="comic-heading text-2xl mb-6">SIMILAR COMPANIONS</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {relatedBots.map(rb => {
                const rbName = rb.name || rb.bot_name || 'Unnamed'
                const rbColor = rb.color || '#8B5CF6'
                return (
                  <Link key={rb.id} href={`/companions/community/${rb.id}`} className="comic-card-hover p-5 flex items-center gap-4">
                    {rb.icon_url ? (
                      <img src={rb.icon_url} alt="" className="w-12 h-12 rounded-full avatar-comic object-cover bg-brand-gray" />
                    ) : (
                      <div className="w-12 h-12 rounded-full avatar-comic flex items-center justify-center" style={{ backgroundColor: `${rbColor}30` }}>
                        <span className="font-display font-black text-lg">{rbName.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display font-bold text-sm uppercase truncate">{rbName}</h4>
                      {rb.role && <p className="text-[10px] text-brand-gray-medium uppercase">{rb.role}</p>}
                      <p className="text-xs text-brand-gray-dark truncate">{rb.description}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

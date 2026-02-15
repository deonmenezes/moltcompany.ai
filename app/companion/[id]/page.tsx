'use client'

import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { bots } from '@/lib/bots'

type Review = {
  id: string
  user_name: string
  user_avatar: string | null
  rating: number
  comment: string
  created_at: string
}

function Stars({ rating, size = 'text-lg' }: { rating: number; size?: string }) {
  return (
    <span className={`${size} text-brand-yellow`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i}>{i <= rating ? '\u2605' : '\u2606'}</span>
      ))}
    </span>
  )
}

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="text-3xl transition-transform hover:scale-110"
        >
          <span className={i <= (hover || value) ? 'text-brand-yellow' : 'text-gray-300'}>
            {'\u2605'}
          </span>
        </button>
      ))}
    </div>
  )
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-display font-bold w-12">{star} star</span>
      <div className="flex-1 h-3 bg-gray-200 border border-black/10">
        <div className="h-full bg-brand-yellow" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-brand-gray-medium w-8 text-right">{count}</span>
    </div>
  )
}

export default function CompanionDetailPage() {
  const params = useParams()
  const botId = params.id as string
  const bot = bots.find(b => b.id === botId)

  const { user, session } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [loading, setLoading] = useState(true)

  // Review form
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?bot_id=${botId}`)
      const data = await res.json()
      setReviews(data.reviews || [])
      setAvgRating(data.averageRating || 0)
      setTotalReviews(data.totalReviews || 0)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (botId) fetchReviews()
  }, [botId])

  const handleSubmitReview = async () => {
    if (!comment.trim() || !session?.access_token) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ bot_id: botId, rating, comment: comment.trim() }),
      })
      if (res.ok) {
        setComment('')
        setRating(5)
        await fetchReviews()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to post review')
      }
    } catch {
      alert('Failed to post review')
    } finally {
      setSubmitting(false)
    }
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

  // Compute rating distribution
  const ratingCounts = [0, 0, 0, 0, 0]
  reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) ratingCounts[r.rating - 1]++ })

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <div className="text-sm text-brand-gray-medium mb-6 font-display">
          <Link href="/companions" className="hover:text-black transition">Companions</Link>
          <span className="mx-2">/</span>
          <span className="text-black font-bold">{bot.characterName}</span>
        </div>

        {/* Product section */}
        <div className="grid md:grid-cols-2 gap-10 mb-16">

          {/* Left: Avatar + quick info */}
          <div>
            <div className="comic-card p-8 flex flex-col items-center">
              <div className="h-2 w-full -mt-8 -mx-8 mb-6" style={{ backgroundColor: bot.color, marginLeft: '-2rem', marginRight: '-2rem', width: 'calc(100% + 4rem)' }} />
              {bot.avatar ? (
                <Image
                  src={bot.avatar}
                  alt={bot.characterName}
                  width={180}
                  height={180}
                  className="rounded-full avatar-comic bg-brand-gray"
                />
              ) : (
                <div
                  className="w-[180px] h-[180px] rounded-full avatar-comic flex items-center justify-center"
                  style={{ backgroundColor: `${bot.color}30`, border: '4px solid black' }}
                >
                  <span className="font-display font-black text-7xl text-black">{bot.characterName.charAt(0)}</span>
                </div>
              )}
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Stars rating={Math.round(avgRating)} />
                  <span className="text-sm font-bold text-black">{avgRating > 0 ? avgRating.toFixed(1) : 'No ratings'}</span>
                </div>
                {totalReviews > 0 && (
                  <p className="text-xs text-brand-gray-medium mt-1">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div>
            <h1 className="comic-heading text-4xl mb-2">{bot.characterName}</h1>
            <span
              className="inline-block px-3 py-1 text-xs font-display font-bold uppercase border-2 border-black mb-4"
              style={{ backgroundColor: `${bot.color}`, color: bot.color === '#FFD600' ? '#000' : '#fff' }}
            >
              {bot.characterRole}
            </span>

            <p className="text-brand-gray-dark font-body text-lg mb-6">{bot.description}</p>

            <div className="comic-card p-4 mb-6">
              <div className="text-xs font-display font-bold uppercase text-brand-gray-medium mb-1">Tagline</div>
              <p className="text-sm text-black font-body italic">&ldquo;{bot.tagline}&rdquo;</p>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="comic-card p-3">
                <div className="text-[10px] font-display font-bold uppercase text-brand-gray-medium">Category</div>
                <div className="text-sm font-bold text-black capitalize">{bot.category}</div>
              </div>
              <div className="comic-card p-3">
                <div className="text-[10px] font-display font-bold uppercase text-brand-gray-medium">Availability</div>
                <div className="text-sm font-bold text-green-600">Available 24/7</div>
              </div>
              <div className="comic-card p-3">
                <div className="text-[10px] font-display font-bold uppercase text-brand-gray-medium">Server</div>
                <div className="text-sm font-bold text-black">Dedicated AWS EC2</div>
              </div>
              <div className="comic-card p-3">
                <div className="text-[10px] font-display font-bold uppercase text-brand-gray-medium">Channel</div>
                <div className="text-sm font-bold text-black">Telegram</div>
              </div>
            </div>

            {/* Price + CTA */}
            <div className="comic-card p-6 border-brand-yellow" style={{ borderColor: bot.color }}>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="comic-heading text-4xl">$40</span>
                <span className="text-brand-gray-medium font-medium">/month</span>
              </div>
              <p className="text-xs text-brand-gray-medium mb-4">Cancel anytime. No lock-in. Choose any LLM provider.</p>
              <Link
                href={`/deploy?model=${bot.id}`}
                className="comic-btn block text-center w-full text-lg"
              >
                HIRE {bot.characterName}
              </Link>
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <section>
          <div className="border-t-3 border-black pt-10">
            <h2 className="comic-heading text-3xl mb-8">REVIEWS &amp; COMMENTS</h2>

            {/* Rating summary */}
            {totalReviews > 0 && (
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="comic-heading text-5xl">{avgRating.toFixed(1)}</div>
                    <Stars rating={Math.round(avgRating)} />
                    <p className="text-xs text-brand-gray-medium mt-1">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {[5, 4, 3, 2, 1].map(star => (
                    <RatingBar key={star} star={star} count={ratingCounts[star - 1]} total={totalReviews} />
                  ))}
                </div>
              </div>
            )}

            {/* Write a review */}
            {user ? (
              <div className="comic-card p-6 mb-8">
                <h3 className="font-display font-bold uppercase mb-4">Write a review</h3>
                <div className="mb-3">
                  <StarSelector value={rating} onChange={setRating} />
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={`What do you think about ${bot.characterName}?`}
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow transition resize-none"
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-brand-gray-medium">{comment.length}/500</span>
                  <button
                    onClick={handleSubmitReview}
                    disabled={!comment.trim() || submitting}
                    className="comic-btn text-sm py-2 px-6 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {submitting ? 'POSTING...' : 'POST REVIEW'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="comic-card p-6 mb-8 text-center">
                <p className="text-brand-gray-medium mb-3">Sign in to leave a review</p>
              </div>
            )}

            {/* Reviews list */}
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-3 border-brand-yellow border-t-transparent rounded-full" />
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="comic-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                      {review.user_avatar ? (
                        <img src={review.user_avatar} alt="" className="w-8 h-8 rounded-full border-2 border-black" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-brand-gray border-2 border-black flex items-center justify-center">
                          <span className="font-display font-bold text-xs">{review.user_name?.charAt(0) || '?'}</span>
                        </div>
                      )}
                      <div>
                        <div className="font-display font-bold text-sm">{review.user_name}</div>
                        <div className="text-[10px] text-brand-gray-medium">
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="ml-auto">
                        <Stars rating={review.rating} size="text-sm" />
                      </div>
                    </div>
                    <p className="text-sm text-brand-gray-dark font-body">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-brand-gray-medium">No reviews yet. Be the first to review {bot.characterName}!</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

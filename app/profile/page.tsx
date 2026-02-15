'use client'

import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type ProfileData = {
  id: string
  email: string | null
  phone: string | null
  name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

type CommunityBot = {
  id: number
  name: string
  bot_name: string
  description: string
  icon_url: string | null
  upvotes: number
  downvotes: number
  status: string
  created_at: string
}

type Review = {
  id: string
  bot_id: string
  rating: number
  comment: string
  created_at: string
}

export default function ProfilePage() {
  const { user, session, loading } = useAuth()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [communityBots, setCommunityBots] = useState<CommunityBot[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [fetching, setFetching] = useState(true)

  // Edit mode
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [editBio, setEditBio] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchProfile = async () => {
    if (!session?.access_token) return
    try {
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      setProfile(data.user || null)
      setCommunityBots(data.communityBots || [])
      setReviews(data.reviews || [])
    } catch {
      // ignore
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (session) fetchProfile()
  }, [session])

  const startEditing = () => {
    setEditName(profile?.name || '')
    setEditAvatar(profile?.avatar_url || user?.user_metadata?.avatar_url || '')
    setEditBio(profile?.bio || '')
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          name: editName.trim(),
          avatar_url: editAvatar.trim(),
          bio: editBio.trim(),
        }),
      })
      if (res.ok) {
        await fetchProfile()
        setEditing(false)
      }
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBot = async (botId: number) => {
    if (!confirm('Delete this companion? This cannot be undone.')) return
    try {
      await fetch('/api/community', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ bot_id: botId }),
      })
      await fetchProfile()
    } catch {
      // ignore
    }
  }

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-16">
        <div className="animate-spin h-8 w-8 border-3 border-brand-yellow border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-16">
        <div className="text-center">
          <h2 className="comic-heading text-2xl mb-4">Sign in to view your profile</h2>
          <Link href="/login" className="comic-btn inline-block">SIGN IN</Link>
        </div>
      </div>
    )
  }

  const displayName = profile?.name || user.user_metadata?.full_name || user.email || user.phone || 'User'
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Profile header */}
        <div className="comic-card p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-24 h-24 rounded-full avatar-comic object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full avatar-comic bg-brand-yellow flex items-center justify-center">
                  <span className="font-display font-black text-3xl">{displayName.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* Info */}
            {editing ? (
              <div className="flex-1 w-full">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-display font-bold uppercase text-brand-gray-medium">Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      maxLength={100}
                      className="w-full px-3 py-2 border-3 border-black text-black focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-display font-bold uppercase text-brand-gray-medium">Avatar URL</label>
                    <input
                      type="text"
                      value={editAvatar}
                      onChange={e => setEditAvatar(e.target.value)}
                      placeholder="Paste image URL"
                      className="w-full px-3 py-2 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-display font-bold uppercase text-brand-gray-medium">Bio</label>
                    <textarea
                      value={editBio}
                      onChange={e => setEditBio(e.target.value)}
                      maxLength={300}
                      rows={2}
                      className="w-full px-3 py-2 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving} className="comic-btn text-sm py-2 px-6">
                      {saving ? 'SAVING...' : 'SAVE'}
                    </button>
                    <button onClick={() => setEditing(false)} className="comic-btn-outline text-sm py-2 px-6">
                      CANCEL
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 text-center sm:text-left">
                <h1 className="comic-heading text-3xl">{displayName}</h1>
                <p className="text-sm text-brand-gray-medium mt-1">{user.email || user.phone}</p>
                {profile?.bio && (
                  <p className="text-sm text-brand-gray-dark font-body mt-2">{profile.bio}</p>
                )}
                <p className="text-xs text-brand-gray-medium mt-2">
                  Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'recently'}
                </p>
                <button onClick={startEditing} className="comic-btn-outline text-sm py-2 px-4 mt-4">
                  EDIT PROFILE
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="comic-card p-4 text-center">
            <div className="comic-heading text-2xl">{communityBots.filter(b => b.status === 'published').length}</div>
            <div className="text-xs font-display font-bold uppercase text-brand-gray-medium">Published</div>
          </div>
          <div className="comic-card p-4 text-center">
            <div className="comic-heading text-2xl">{reviews.length}</div>
            <div className="text-xs font-display font-bold uppercase text-brand-gray-medium">Reviews</div>
          </div>
          <div className="comic-card p-4 text-center">
            <div className="comic-heading text-2xl">{communityBots.reduce((acc, b) => acc + (b.upvotes || 0), 0)}</div>
            <div className="text-xs font-display font-bold uppercase text-brand-gray-medium">Upvotes</div>
          </div>
        </div>

        {/* My Community Companions */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="comic-heading text-xl">MY PUBLISHED COMPANIONS</h2>
            {communityBots.filter(b => b.status === 'published').length < 3 && user.phone && (
              <Link href="/community/publish" className="comic-btn text-sm py-2 px-4">
                PUBLISH NEW
              </Link>
            )}
          </div>
          {communityBots.filter(b => b.status === 'published').length > 0 ? (
            <div className="space-y-4">
              {communityBots.filter(b => b.status === 'published').map(bot => (
                <div key={bot.id} className="comic-card p-5 flex items-center gap-4">
                  {bot.icon_url ? (
                    <img src={bot.icon_url} alt="" className="w-12 h-12 rounded-full avatar-comic object-cover bg-brand-gray" />
                  ) : (
                    <div className="w-12 h-12 rounded-full avatar-comic bg-purple-100 flex items-center justify-center">
                      <span className="font-display font-black text-lg text-purple-700">{(bot.name || bot.bot_name || '?').charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link href={`/companions/community/${bot.id}`} className="font-display font-bold text-black hover:underline">
                      {bot.name || bot.bot_name}
                    </Link>
                    <p className="text-xs text-brand-gray-medium truncate">{bot.description}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-green-600 font-bold">&#9650; {bot.upvotes || 0}</span>
                    <span className="text-red-500 font-bold">&#9660; {bot.downvotes || 0}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteBot(bot.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-display font-bold uppercase"
                  >
                    DELETE
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="comic-card p-6 text-center">
              <p className="text-brand-gray-medium mb-3">You haven&apos;t published any companions yet</p>
              {user.phone ? (
                <Link href="/community/publish" className="comic-btn-outline text-sm inline-block">PUBLISH YOUR FIRST</Link>
              ) : (
                <p className="text-xs text-brand-gray-medium">Sign in with a phone number to publish companions</p>
              )}
            </div>
          )}
        </section>

        {/* My Reviews */}
        <section>
          <h2 className="comic-heading text-xl mb-4">MY REVIEWS</h2>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="comic-card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Link href={`/companion/${review.bot_id}`} className="font-display font-bold text-sm hover:underline">
                      {review.bot_id}
                    </Link>
                    <span className="text-brand-yellow text-sm">
                      {[1, 2, 3, 4, 5].map(i => (
                        <span key={i}>{i <= review.rating ? '\u2605' : '\u2606'}</span>
                      ))}
                    </span>
                  </div>
                  <p className="text-sm text-brand-gray-dark font-body">{review.comment}</p>
                  <p className="text-[10px] text-brand-gray-medium mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="comic-card p-6 text-center">
              <p className="text-brand-gray-medium">No reviews yet. Visit a companion page to leave one!</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

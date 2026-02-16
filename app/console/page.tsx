'use client'

import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'
import { CompanionCard } from '@/components/CompanionCard'
import Link from 'next/link'
import Image from 'next/image'
import { bots } from '@/lib/bots'

export default function ConsolePage() {
  const { user, session, loading } = useAuth()
  const [instances, setInstances] = useState<any[]>([])
  const [subscription, setSubscription] = useState<any>(null)
  const [fetching, setFetching] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchInstances = async () => {
    if (!session?.access_token) return
    try {
      const res = await fetch('/api/instance', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      setInstances(data.instances || [])
      setSubscription(data.subscription || null)
    } catch (err) {
      console.error('Error fetching instances:', err)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (session) fetchInstances()
  }, [session])

  useEffect(() => {
    if (!session) return
    const interval = setInterval(fetchInstances, 15000)
    return () => clearInterval(interval)
  }, [session])

  const handleAction = async (instanceId: string, action: 'start' | 'stop' | 'terminate') => {
    setActionLoading(instanceId)
    try {
      const method = action === 'terminate' ? 'DELETE' : 'PATCH'
      const res = await fetch('/api/instance', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ action, instance_id: instanceId }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || `Failed to ${action} companion`)
      }
      await fetchInstances()
    } catch (err) {
      console.error(`Error ${action}ing companion:`, err)
    } finally {
      setActionLoading(null)
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
          <h2 className="comic-heading text-2xl mb-4">Sign in to view console</h2>
          <Link href="/login" className="comic-btn inline-block">
            SIGN IN
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="comic-heading text-3xl">CONSOLE</h1>
          <Link href="/companions" className="comic-btn text-sm py-2 px-5">
            HIRE NEW COMPANION
          </Link>
        </div>

        {/* Companion grid */}
        {instances.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {instances.map((instance) => (
              <CompanionCard
                key={instance.id}
                instance={instance}
                onAction={handleAction}
                onRefresh={fetchInstances}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        ) : (
          <div>
            <div className="text-center mb-8">
              <h3 className="comic-heading text-xl mb-2">RECOMMENDED FOR YOU</h3>
              <p className="text-brand-gray-medium text-sm">
                Hire your first AI companion to get started. Each one runs 24/7 on its own dedicated server.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots.slice(0, 6).map(bot => (
                <div key={bot.id} className="comic-card-hover flex flex-col">
                  <div className="h-2" style={{ backgroundColor: bot.color }} />
                  <Link href={`/companion/${bot.id}`} className="p-5 pb-2 flex flex-col items-center text-center hover:bg-gray-50/50 transition">
                    <Image
                      src={bot.avatar}
                      alt={bot.characterName}
                      width={64}
                      height={64}
                      className="avatar-comic rounded-full bg-brand-gray mb-3"
                    />
                    <div className="flex items-center gap-1.5 mb-1">
                      <h4 className="comic-heading text-lg">{bot.characterName}</h4>
                      <span className="text-green-500 text-xs" title="Verified">&#10003;</span>
                    </div>
                    <span
                      className="inline-block px-2 py-0.5 text-[10px] font-display font-bold uppercase border-2 border-black"
                      style={{ backgroundColor: bot.color, color: bot.color === '#FFD600' ? '#000' : '#fff' }}
                    >
                      {bot.characterRole}
                    </span>
                    <p className="font-body text-xs text-brand-gray-dark mt-3 line-clamp-2">
                      {bot.tagline}
                    </p>
                  </Link>
                  <div className="p-5 pt-3 mt-auto">
                    <Link href={`/deploy?model=${bot.id}`} className="comic-btn block text-center w-full text-sm">
                      HIRE — $40/MO
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/companions" className="comic-btn-outline inline-block text-sm">
                VIEW ALL COMPANIONS
              </Link>
            </div>
          </div>
        )}

        {/* Subscription info */}
        {subscription && (
          <div className="comic-card p-6 mt-8">
            <h3 className="comic-heading text-lg mb-4">SUBSCRIPTION</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-brand-gray-medium font-display font-bold uppercase mb-1">Status</div>
                <div className="text-sm text-black font-bold capitalize">{subscription.status}</div>
              </div>
              <div>
                <div className="text-xs text-brand-gray-medium font-display font-bold uppercase mb-1">Next renewal</div>
                <div className="text-sm text-black">
                  {subscription.current_period_end
                    ? new Date(subscription.current_period_end).toLocaleDateString()
                    : 'N/A'}
                </div>
              </div>
            </div>
            <button
              onClick={async () => {
                const res = await fetch('/api/billing', {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${session?.access_token}` },
                })
                const data = await res.json()
                if (data.url) window.location.href = data.url
              }}
              className="comic-btn-outline text-sm"
            >
              MANAGE BILLING
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

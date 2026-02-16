'use client'

import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'
import { CompanionCard } from '@/components/CompanionCard'
import Link from 'next/link'

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
          <div className="comic-card p-12 text-center">
            <div className="text-5xl mb-4">&#128188;</div>
            <h3 className="comic-heading text-xl mb-3">NO COMPANIONS YET</h3>
            <p className="text-brand-gray-medium mb-6 max-w-md mx-auto">
              Hire your first AI companion to get started. Each companion runs 24/7 on its own dedicated server.
            </p>
            <Link href="/companions" className="comic-btn inline-block">
              BROWSE COMPANIONS
            </Link>
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

'use client'

import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'
import { InstanceCard } from '@/components/InstanceCard'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, session, loading } = useAuth()
  const [instance, setInstance] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [fetching, setFetching] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchInstance = async () => {
    if (!session?.access_token) return
    try {
      const res = await fetch('/api/instance', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (data.instance && (data.instance.status === 'terminated' || data.instance.status === 'payment_failed')) {
        setInstance(null)
      } else {
        setInstance(data.instance || null)
      }
      setSubscription(data.subscription || null)
    } catch (err) {
      console.error('Error fetching instance:', err)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (session) fetchInstance()
  }, [session])

  useEffect(() => {
    if (!session) return
    const interval = setInterval(fetchInstance, 15000)
    return () => clearInterval(interval)
  }, [session])

  const handleAction = async (action: 'start' | 'stop' | 'terminate') => {
    setActionLoading(true)
    try {
      const method = action === 'terminate' ? 'DELETE' : 'PATCH'
      const body = action === 'terminate' ? undefined : JSON.stringify({ action })
      const res = await fetch('/api/instance', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body,
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || `Failed to ${action} instance`)
      }
      await fetchInstance()
    } catch (err) {
      console.error(`Error ${action}ing instance:`, err)
    } finally {
      setActionLoading(false)
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
          <h2 className="comic-heading text-2xl mb-4">Sign in to view dashboard</h2>
          <Link href="/deploy" className="comic-btn inline-block">
            GO TO DEPLOY
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="comic-heading text-3xl mb-8">DASHBOARD</h1>

        {instance ? (
          <InstanceCard
            instance={instance}
            onAction={handleAction}
            actionLoading={actionLoading}
          />
        ) : (
          <div className="comic-card p-8 text-center">
            <h3 className="comic-heading text-xl mb-4">NO ACTIVE INSTANCE</h3>
            <p className="text-brand-gray-medium mb-6">Deploy your first AI bot to get started</p>
            <Link href="/deploy" className="comic-btn inline-block">
              DEPLOY NOW
            </Link>
          </div>
        )}

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

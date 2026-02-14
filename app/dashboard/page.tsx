'use client'

import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { InstanceCard } from '@/components/InstanceCard'

export default function DashboardPage() {
  const { user, session, loading: authLoading } = useAuth()
  const router = useRouter()
  const [instance, setInstance] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/deploy')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (session) {
      fetchInstance()
      const interval = setInterval(fetchInstance, 15000)
      return () => clearInterval(interval)
    }
  }, [session])

  const fetchInstance = async () => {
    try {
      const res = await fetch('/api/instance', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
      })
      const data = await res.json()
      // Treat terminated/failed instances as no instance so user can redeploy
      const inst = data.instance
      if (inst && (inst.status === 'terminated' || inst.status === 'payment_failed')) {
        setInstance(null)
      } else {
        setInstance(inst)
      }
      setSubscription(data.subscription)
      setStripeCustomerId(data.stripeCustomerId)
    } catch (err) {
      console.error('Failed to fetch instance:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: 'start' | 'stop' | 'terminate') => {
    setActionLoading(true)
    try {
      const res = action === 'terminate'
        ? await fetch('/api/instance', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${session?.access_token}`,
            },
          })
        : await fetch('/api/instance', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ action }),
          })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error || `Failed to ${action} instance`)
        return
      }
      await fetchInstance()
    } catch (err) {
      console.error('Action failed:', err)
      alert(`Failed to ${action} instance. Check console for details.`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleManageBilling = async () => {
    const res = await fetch('/api/billing', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${session?.access_token}` },
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center pt-16">
        <div className="animate-spin h-8 w-8 border-2 border-accent-blue border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {!instance ? (
          <div className="p-8 rounded-2xl bg-dark-card border border-dark-border text-center">
            <h3 className="text-xl font-semibold mb-2">No instance found</h3>
            <p className="text-gray-400 mb-6">Deploy your first OpenClaw instance to get started</p>
            <a
              href="/deploy"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple font-semibold hover:opacity-90 transition"
            >
              Deploy Now
            </a>
          </div>
        ) : (
          <>
            <InstanceCard
              instance={instance}
              onAction={handleAction}
              actionLoading={actionLoading}
            />

            {subscription && (
              <div className="mt-6 p-6 rounded-2xl bg-dark-card border border-dark-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Subscription</h3>
                    <p className="text-sm text-gray-400">
                      Status: <span className={subscription.status === 'active' ? 'text-green-400' : 'text-red-400'}>{subscription.status}</span>
                    </p>
                    {subscription.current_period_end && (
                      <p className="text-sm text-gray-500 mt-1">
                        Renews: {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {stripeCustomerId && (
                    <button
                      onClick={handleManageBilling}
                      className="px-4 py-2 rounded-lg border border-dark-border text-sm text-gray-400 hover:text-white hover:border-gray-500 transition"
                    >
                      Manage Billing
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

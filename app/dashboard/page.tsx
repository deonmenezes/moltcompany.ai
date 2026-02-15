'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/console') }, [router])
  return (
    <div className="min-h-screen bg-white flex items-center justify-center pt-16">
      <div className="animate-spin h-8 w-8 border-3 border-brand-yellow border-t-transparent rounded-full" />
    </div>
  )
}

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { User, Session } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithPhone: (phone: string) => Promise<{ error: string | null }>
  verifyPhoneOtp: (phone: string, token: string) => Promise<{ error: string | null }>
  linkPhone: (phone: string) => Promise<{ error: string | null }>
  verifyPhoneLink: (phone: string, token: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithPhone: async () => ({ error: null }),
  verifyPhoneOtp: async () => ({ error: null }),
  linkPhone: async () => ({ error: null }),
  verifyPhoneLink: async () => ({ error: null }),
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    await supabaseBrowser.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/deploy`,
      },
    })
  }

  const signInWithPhone = async (phone: string) => {
    const { error } = await supabaseBrowser.auth.signInWithOtp({ phone })
    return { error: error?.message ?? null }
  }

  const verifyPhoneOtp = async (phone: string, otp: string) => {
    const { error } = await supabaseBrowser.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    })
    return { error: error?.message ?? null }
  }

  const linkPhone = async (phone: string) => {
    try {
      const token = session?.access_token
      if (!token) return { error: 'Not signed in' }

      const res = await fetch('/api/phone-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'send', phone }),
      })
      const data = await res.json()
      if (!res.ok) return { error: data.error || 'Failed to send code' }
      return { error: null }
    } catch {
      return { error: 'Failed to send verification code' }
    }
  }

  const verifyPhoneLink = async (phone: string, code: string) => {
    try {
      const token = session?.access_token
      if (!token) return { error: 'Not signed in' }

      const res = await fetch('/api/phone-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'check', phone, code }),
      })
      const data = await res.json()
      if (!res.ok) return { error: data.error || 'Invalid code' }

      // Refresh session to get updated phone
      await supabaseBrowser.auth.refreshSession()
      return { error: null }
    } catch {
      return { error: 'Failed to verify code' }
    }
  }

  const signOut = async () => {
    await supabaseBrowser.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signInWithPhone, verifyPhoneOtp, linkPhone, verifyPhoneLink, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

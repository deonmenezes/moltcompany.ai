import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { createCustomerPortalSession } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const authUser = await getUser(req)
    if (!authUser?.email && !authUser?.phone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lookupField = authUser.email ? 'email' : 'phone'
    const lookupValue = (authUser.email || authUser.phone)!

    const { data: user } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq(lookupField, lookupValue)
      .maybeSingle()

    if (!user?.stripe_customer_id) {
      return NextResponse.json({ error: 'No billing account found' }, { status: 404 })
    }

    const portalSession = await createCustomerPortalSession(user.stripe_customer_id)
    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    console.error('Billing portal error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

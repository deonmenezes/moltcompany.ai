import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { sanitizeUrl } from '@/lib/sanitize'

export async function GET(req: NextRequest) {
  try {
    const authUser = await getUser(req)
    if (!authUser?.email && !authUser?.phone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lookupField = authUser.email ? 'email' : 'phone'
    const lookupValue = (authUser.email || authUser.phone)!

    const { data: user } = await supabase
      .from('users')
      .select('id, email, phone, name, avatar_url, bio, created_at')
      .eq(lookupField, lookupValue)
      .maybeSingle()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's community bots
    const { data: communityBots } = await supabase
      .from('community_bots')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Get user's reviews
    const { data: reviews } = await supabase
      .from('companion_reviews')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    return NextResponse.json({
      user,
      communityBots: communityBots || [],
      reviews: reviews || [],
    })
  } catch (err) {
    console.error('Profile fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getUser(req)
    if (!authUser?.email && !authUser?.phone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, avatar_url, bio } = await req.json()

    const lookupField = authUser.email ? 'email' : 'phone'
    const lookupValue = (authUser.email || authUser.phone)!

    const updates: Record<string, string | null> = {}
    if (name !== undefined) updates.name = name?.slice(0, 100) || null
    if (avatar_url !== undefined) updates.avatar_url = sanitizeUrl(avatar_url)
    if (bio !== undefined) updates.bio = bio?.slice(0, 300) || null

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq(lookupField, lookupValue)
      .select('id, email, phone, name, avatar_url, bio')
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ user })
  } catch (err) {
    console.error('Profile error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { rateLimit } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  try {
    const authUser = await getUser(req)
    if (!authUser?.email && !authUser?.phone) {
      return NextResponse.json({ error: 'Sign in to like bots' }, { status: 401 })
    }

    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const { success: rateLimitOk } = rateLimit(`bot-like:${ip}`, { maxRequests: 60, windowMs: 60_000 })
    if (!rateLimitOk) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { bot_id } = await req.json()
    if (!bot_id || typeof bot_id !== 'string') {
      return NextResponse.json({ error: 'bot_id required' }, { status: 400 })
    }

    // Resolve user
    const lookupField = authUser.email ? 'email' : 'phone'
    const lookupValue = (authUser.email || authUser.phone)!

    let { data: user } = await supabase
      .from('users')
      .select('id')
      .eq(lookupField, lookupValue)
      .maybeSingle()

    if (!user) {
      const { data: newUser } = await supabase
        .from('users')
        .insert({
          email: authUser.email || null,
          phone: authUser.phone || null,
          name: authUser.user_metadata?.full_name || null,
        })
        .select('id')
        .single()
      user = newUser
    }

    if (!user) {
      return NextResponse.json({ error: 'Failed to resolve user' }, { status: 500 })
    }

    // Check existing like
    const { data: existing } = await supabase
      .from('bot_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('bot_id', bot_id)
      .maybeSingle()

    if (existing) {
      // Unlike (toggle off)
      await supabase.from('bot_likes').delete().eq('id', existing.id)
    } else {
      // Like (toggle on)
      await supabase.from('bot_likes').insert({ user_id: user.id, bot_id })
    }

    // Get updated count
    const { count } = await supabase
      .from('bot_likes')
      .select('id', { count: 'exact', head: true })
      .eq('bot_id', bot_id)

    return NextResponse.json({
      liked: !existing,
      likeCount: count || 0,
    })
  } catch (err) {
    console.error('Like error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

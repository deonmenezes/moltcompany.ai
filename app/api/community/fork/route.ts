import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { rateLimit } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  try {
    const authUser = await getUser(req)
    if (!authUser?.phone) {
      return NextResponse.json(
        { error: 'Only phone-verified users can fork companions' },
        { status: 403 }
      )
    }

    // Rate limit
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const { success: rateLimitOk } = rateLimit(`fork:${ip}`, { maxRequests: 10, windowMs: 60_000 })
    if (!rateLimitOk) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { bot_id } = await req.json()
    if (!bot_id) {
      return NextResponse.json({ error: 'bot_id required' }, { status: 400 })
    }

    // Get or create user
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

    // Check 3-bot limit
    const { count } = await supabase
      .from('community_bots')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'published')

    if ((count || 0) >= 3) {
      return NextResponse.json({ error: 'You can publish a maximum of 3 companions' }, { status: 400 })
    }

    // Get original bot
    const { data: original } = await supabase
      .from('community_bots')
      .select('*')
      .eq('id', bot_id)
      .eq('status', 'published')
      .single()

    if (!original) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 })
    }

    // Create forked copy
    const { data: forked, error } = await supabase
      .from('community_bots')
      .insert({
        user_id: user.id,
        author_name: authUser.user_metadata?.full_name || authUser.phone || 'Anonymous',
        author_email: authUser.email || authUser.phone || '',
        name: `${original.name} (Fork)`.slice(0, 60),
        bot_name: `${original.bot_name} (Fork)`.slice(0, 60),
        description: original.description,
        icon_url: original.icon_url,
        character_file: original.character_file,
        soul_md: original.soul_md,
        role: original.role,
        color: original.color,
        tools_config: original.tools_config,
        category: original.category || 'other',
        tags: original.tags || [],
        forked_from: original.id,
        upvotes: 0,
        downvotes: 0,
        view_count: 0,
        deploy_count: 0,
        fork_count: 0,
        status: 'published',
      })
      .select('id')
      .single()

    if (error) {
      console.error('Fork error:', error)
      return NextResponse.json({ error: 'Failed to fork companion' }, { status: 500 })
    }

    // Increment fork count on original
    await supabase
      .from('community_bots')
      .update({ fork_count: (original.fork_count || 0) + 1 })
      .eq('id', bot_id)

    return NextResponse.json({ forked_id: forked.id })
  } catch (err) {
    console.error('Fork error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

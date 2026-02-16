import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { sanitizeUrl, rateLimit } from '@/lib/sanitize'

export async function GET(req: NextRequest) {
  const sort = req.nextUrl.searchParams.get('sort') || 'newest'
  const search = req.nextUrl.searchParams.get('q') || ''
  const category = req.nextUrl.searchParams.get('category') || ''
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '100'), 200)
  const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0')

  let query = supabase
    .from('community_bots')
    .select('id, name, bot_name, description, icon_url, author_name, role, color, upvotes, downvotes, character_file, soul_md, created_at, category, tags, view_count, deploy_count, fork_count')
    .eq('status', 'published')

  // Search by name, description, or role
  if (search.trim()) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,role.ilike.%${search}%,bot_name.ilike.%${search}%`)
  }

  // Filter by category
  if (category) {
    query = query.eq('category', category)
  }

  // Sort options
  switch (sort) {
    case 'top':
      query = query.order('upvotes', { ascending: false })
      break
    case 'trending':
      query = query.order('upvotes', { ascending: false }).order('created_at', { ascending: false })
      break
    case 'most_deployed':
      query = query.order('deploy_count', { ascending: false })
      break
    case 'most_viewed':
      query = query.order('view_count', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data: bots } = await query.range(offset, offset + limit - 1)

  // Get total count for pagination
  const { count } = await supabase
    .from('community_bots')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published')

  return NextResponse.json({
    bots: bots || [],
    total: count || 0,
  })
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getUser(req)
    if (!authUser?.email) {
      return NextResponse.json(
        { error: 'Sign in with Google to publish companions' },
        { status: 403 }
      )
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
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Check 3-bot limit
    const { count } = await supabase
      .from('community_bots')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'published')

    if ((count || 0) >= 3) {
      return NextResponse.json(
        { error: 'You can publish a maximum of 3 AI companions' },
        { status: 400 }
      )
    }

    // Rate limit: 5 publishes per minute
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const { success: rateLimitOk } = rateLimit(`community-publish:${ip}`, { maxRequests: 5, windowMs: 60_000 })
    if (!rateLimitOk) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const { name, description, icon_url, character_file, role, color, tools_config, category, tags } = await req.json()

    if (!name?.trim() || !character_file?.trim()) {
      return NextResponse.json(
        { error: 'Name and character file are required' },
        { status: 400 }
      )
    }

    // Validate color format (hex only)
    const safeColor = /^#[0-9A-Fa-f]{6}$/.test(color || '') ? color : null

    // Validate category
    const validCategories = ['productivity', 'creative', 'business', 'education', 'entertainment', 'developer', 'health', 'social', 'finance', 'other']
    const safeCategory = validCategories.includes(category) ? category : 'other'

    // Validate tags (array of strings, max 5)
    const safeTags = Array.isArray(tags)
      ? tags.filter((t: unknown) => typeof t === 'string').slice(0, 5).map((t: string) => t.toLowerCase().trim().slice(0, 30))
      : []

    const { data: bot, error } = await supabase
      .from('community_bots')
      .insert({
        user_id: user.id,
        author_name: authUser.user_metadata?.full_name || authUser.phone || 'Anonymous',
        author_email: authUser.email || authUser.phone || '',
        name: name.trim().slice(0, 60),
        bot_name: name.trim().slice(0, 60),
        description: (description || '').slice(0, 300),
        icon_url: sanitizeUrl(icon_url),
        character_file: character_file.slice(0, 10000),
        soul_md: character_file.slice(0, 10000),
        role: (role || '').slice(0, 60) || null,
        color: safeColor,
        tools_config: tools_config ? JSON.stringify(tools_config) : null,
        category: safeCategory,
        tags: safeTags,
        upvotes: 0,
        downvotes: 0,
        view_count: 0,
        deploy_count: 0,
        fork_count: 0,
        status: 'published',
      })
      .select()
      .single()

    if (error) {
      console.error('Community bot insert error:', error)
      return NextResponse.json({ error: 'Failed to publish companion' }, { status: 500 })
    }

    return NextResponse.json({ bot })
  } catch (err) {
    console.error('Community publish error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = await getUser(req)
    if (!authUser?.email && !authUser?.phone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bot_id } = await req.json()
    if (!bot_id) {
      return NextResponse.json({ error: 'bot_id required' }, { status: 400 })
    }

    const lookupField = authUser.email ? 'email' : 'phone'
    const lookupValue = (authUser.email || authUser.phone)!

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq(lookupField, lookupValue)
      .maybeSingle()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('community_bots')
      .update({ status: 'deleted' })
      .eq('id', bot_id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Community delete error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

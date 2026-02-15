import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const sort = req.nextUrl.searchParams.get('sort') || 'newest'

  let query = supabase
    .from('community_bots')
    .select('*')
    .eq('status', 'published')

  if (sort === 'top') {
    query = query.order('upvotes', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: bots } = await query.limit(100)

  return NextResponse.json({ bots: bots || [] })
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getUser(req)
    if (!authUser?.phone) {
      return NextResponse.json(
        { error: 'Only phone-verified users can publish companions' },
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

    const { name, description, icon_url, character_file, role, color, tools_config } = await req.json()

    if (!name?.trim() || !character_file?.trim()) {
      return NextResponse.json(
        { error: 'Name and character file are required' },
        { status: 400 }
      )
    }

    const { data: bot, error } = await supabase
      .from('community_bots')
      .insert({
        user_id: user.id,
        author_name: authUser.user_metadata?.full_name || authUser.phone || 'Anonymous',
        author_email: authUser.email || authUser.phone || '',
        name: name.trim().slice(0, 60),
        bot_name: name.trim().slice(0, 60),
        description: (description || '').slice(0, 300),
        icon_url: icon_url || null,
        character_file: character_file.slice(0, 10000),
        soul_md: character_file.slice(0, 10000),
        role: (role || '').slice(0, 60) || null,
        color: color || null,
        tools_config: tools_config ? JSON.stringify(tools_config) : null,
        upvotes: 0,
        downvotes: 0,
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

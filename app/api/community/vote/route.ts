import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { rateLimit } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  try {
    const authUser = await getUser(req)
    if (!authUser?.email && !authUser?.phone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit: 60 votes per minute
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const { success: rateLimitOk } = rateLimit(`vote:${ip}`, { maxRequests: 60, windowMs: 60_000 })
    if (!rateLimitOk) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { bot_id, vote_type } = await req.json()

    if (!bot_id || !['up', 'down'].includes(vote_type)) {
      return NextResponse.json({ error: 'bot_id and vote_type (up/down) required' }, { status: 400 })
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

    // Check existing vote
    const { data: existingVote } = await supabase
      .from('community_votes')
      .select('id, vote_type')
      .eq('user_id', user.id)
      .eq('bot_id', bot_id)
      .maybeSingle()

    if (existingVote) {
      if (existingVote.vote_type === vote_type) {
        // Same vote — remove it (toggle off)
        await supabase.from('community_votes').delete().eq('id', existingVote.id)

        // Decrement count
        if (vote_type === 'up') {
          await supabase.rpc('decrement_upvotes', { row_id: bot_id })
        } else {
          await supabase.rpc('decrement_downvotes', { row_id: bot_id })
        }

        // Fallback: direct update if RPC doesn't exist
        const col = vote_type === 'up' ? 'upvotes' : 'downvotes'
        const { data: bot } = await supabase.from('community_bots').select('upvotes, downvotes').eq('id', bot_id).single()
        if (bot) {
          await supabase.from('community_bots').update({ [col]: Math.max(0, ((bot as any)[col] || 0) - 1) }).eq('id', bot_id)
        }

        return NextResponse.json({ voted: null })
      } else {
        // Switching vote
        await supabase.from('community_votes').update({ vote_type }).eq('id', existingVote.id)

        // Update counts
        const { data: bot } = await supabase.from('community_bots').select('upvotes, downvotes').eq('id', bot_id).single()
        if (bot) {
          if (vote_type === 'up') {
            await supabase.from('community_bots').update({
              upvotes: (bot.upvotes || 0) + 1,
              downvotes: Math.max(0, (bot.downvotes || 0) - 1),
            }).eq('id', bot_id)
          } else {
            await supabase.from('community_bots').update({
              downvotes: (bot.downvotes || 0) + 1,
              upvotes: Math.max(0, (bot.upvotes || 0) - 1),
            }).eq('id', bot_id)
          }
        }

        return NextResponse.json({ voted: vote_type })
      }
    } else {
      // New vote
      await supabase.from('community_votes').insert({
        user_id: user.id,
        bot_id,
        vote_type,
      })

      const col = vote_type === 'up' ? 'upvotes' : 'downvotes'
      const { data: bot } = await supabase.from('community_bots').select('upvotes, downvotes').eq('id', bot_id).single()
      if (bot) {
        await supabase.from('community_bots').update({ [col]: ((bot as any)[col] || 0) + 1 }).eq('id', bot_id)
      }

      return NextResponse.json({ voted: vote_type })
    }
  } catch (err) {
    console.error('Vote error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

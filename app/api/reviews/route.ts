import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const botId = req.nextUrl.searchParams.get('bot_id')
  if (!botId) {
    return NextResponse.json({ error: 'bot_id required' }, { status: 400 })
  }

  const { data: reviews } = await supabase
    .from('companion_reviews')
    .select('*')
    .eq('bot_id', botId)
    .order('created_at', { ascending: false })
    .limit(50)

  // Get average rating
  const { data: stats } = await supabase
    .from('companion_reviews')
    .select('rating')
    .eq('bot_id', botId)

  const ratings = stats?.map(r => r.rating) || []
  const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

  return NextResponse.json({
    reviews: reviews || [],
    averageRating: Math.round(avgRating * 10) / 10,
    totalReviews: ratings.length,
  })
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getUser(req)
    if (!authUser?.email && !authUser?.phone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bot_id, rating, comment } = await req.json()

    if (!bot_id || !rating || !comment) {
      return NextResponse.json({ error: 'bot_id, rating, and comment required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 })
    }

    // Get or create user in our users table
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
          google_id: authUser.email ? authUser.id : null,
        })
        .select('id')
        .single()
      user = newUser
    }

    if (!user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    const { data: review, error } = await supabase
      .from('companion_reviews')
      .insert({
        bot_id,
        user_id: user.id,
        user_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Anonymous',
        user_avatar: authUser.user_metadata?.avatar_url || null,
        rating,
        comment: comment.slice(0, 500),
      })
      .select()
      .single()

    if (error) {
      console.error('Review insert error:', error)
      return NextResponse.json({ error: 'Failed to post review' }, { status: 500 })
    }

    return NextResponse.json({ review })
  } catch (err) {
    console.error('Review error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

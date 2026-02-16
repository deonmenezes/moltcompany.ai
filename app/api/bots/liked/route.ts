import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const authUser = await getUser(req)
    if (!authUser?.email && !authUser?.phone) {
      return NextResponse.json({ likedBotIds: [] })
    }

    const lookupField = authUser.email ? 'email' : 'phone'
    const lookupValue = (authUser.email || authUser.phone)!

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq(lookupField, lookupValue)
      .maybeSingle()

    if (!user) {
      return NextResponse.json({ likedBotIds: [] })
    }

    const { data: likes } = await supabase
      .from('bot_likes')
      .select('bot_id')
      .eq('user_id', user.id)

    return NextResponse.json({
      likedBotIds: (likes || []).map(l => l.bot_id),
    })
  } catch (err) {
    console.error('Liked bots error:', err)
    return NextResponse.json({ likedBotIds: [] })
  }
}

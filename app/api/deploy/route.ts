import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { encrypt } from '@/lib/encryption'
import { createCheckoutSession } from '@/lib/stripe'
import { bots } from '@/lib/bots'
import { rateLimit } from '@/lib/sanitize'
import { llmProviders } from '@/lib/providers'

export async function POST(req: NextRequest) {
  try {
    const authUser = await getUser(req)
    if (!authUser?.email && !authUser?.phone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit: 5 deploy attempts per minute
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const { success: rateLimitOk } = rateLimit(`deploy:${ip}`, { maxRequests: 5, windowMs: 60_000 })
    if (!rateLimitOk) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const body = await req.json()
    const { model_provider, model_name, channel, telegram_bot_token, llm_api_key, character_files, bot_id } = body

    if (!model_provider || !model_name || !channel || !telegram_bot_token || !llm_api_key) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate model_provider against allowed providers
    const validProvider = llmProviders.find(p => p.id === model_provider)
    if (!validProvider) {
      return NextResponse.json({ error: 'Invalid model provider' }, { status: 400 })
    }
    const validModel = validProvider.models.find(m => m.id === model_name)
    if (!validModel) {
      return NextResponse.json({ error: 'Invalid model for selected provider' }, { status: 400 })
    }

    // Validate character files size (EC2 user-data has 16KB limit, ~6KB reserved for script)
    if (character_files && typeof character_files === 'object') {
      const totalBytes = Object.values(character_files as Record<string, string>)
        .reduce((sum: number, content) => sum + new TextEncoder().encode(content as string).byteLength, 0)
      if (totalBytes > 8 * 1024) {
        return NextResponse.json({ error: 'Character files exceed 8 KB limit' }, { status: 400 })
      }
    }

    // Get or create user in our users table (support both email and phone users)
    const lookupField = authUser.email ? 'email' : 'phone'
    const lookupValue = authUser.email || authUser.phone!

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

    // Look up companion metadata from bot definitions
    const bot = bots.find(b => b.id === bot_id)

    const gatewayToken = crypto.randomUUID()

    // Insert instance with pending_payment status (NO EC2 launch yet)
    const { data: instance, error: insertError } = await supabase
      .from('instances')
      .insert({
        user_id: user.id,
        status: 'pending_payment',
        model_provider,
        model_name,
        channel,
        telegram_bot_token: encrypt(telegram_bot_token),
        llm_api_key: encrypt(llm_api_key),
        gateway_token: gatewayToken,
        character_files: character_files || null,
        bot_id: bot_id || null,
        companion_name: bot?.characterName || 'Custom Companion',
        companion_role: bot?.characterRole || 'AI Assistant',
        companion_color: bot?.color || '#FFD600',
        companion_avatar: bot?.avatar || null,
      })
      .select('id')
      .single()

    if (insertError || !instance) {
      console.error('Instance insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create instance' }, { status: 500 })
    }

    // Create Stripe checkout session — user pays before EC2 launches
    const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/[^/]*$/, '') || ''
    const session = await createCheckoutSession({
      userId: user.id,
      instanceId: instance.id,
      email: authUser.email || null,
      origin,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Deploy error:', err)
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 })
  }
}

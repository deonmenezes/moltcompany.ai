import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { encrypt } from '@/lib/encryption'
import { launchInstance } from '@/lib/aws'
import { bots } from '@/lib/bots'

export async function POST(req: NextRequest) {
  try {
    const authUser = await getUser(req)
    if (!authUser?.email && !authUser?.phone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { model_provider, model_name, channel, telegram_bot_token, llm_api_key, character_files, bot_id } = body

    if (!model_provider || !model_name || !channel || !telegram_bot_token || !llm_api_key) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

    const { instanceId } = await launchInstance({
      userId: user.id,
      modelProvider: model_provider,
      modelName: model_name,
      apiKey: llm_api_key,
      telegramToken: telegram_bot_token,
      gatewayToken,
      characterFiles: character_files || undefined,
    })

    await supabase.from('instances').insert({
      user_id: user.id,
      ec2_instance_id: instanceId,
      status: 'provisioning',
      model_provider,
      model_name,
      channel,
      telegram_bot_token: encrypt(telegram_bot_token),
      llm_api_key: encrypt(llm_api_key),
      gateway_token: gatewayToken,
      bot_id: bot_id || null,
      companion_name: bot?.characterName || 'Custom Companion',
      companion_role: bot?.characterRole || 'AI Assistant',
      companion_color: bot?.color || '#FFD600',
      companion_avatar: bot?.avatar || null,
    })

    return NextResponse.json({ redirect: '/console' })
  } catch (err) {
    console.error('Deploy error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

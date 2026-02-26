import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { encrypt } from '@/lib/encryption'
import { launchInstance } from '@/lib/aws'
import { rateLimit } from '@/lib/sanitize'

export const maxDuration = 60

// Free clone deployment — uses Gemini 2.0 Flash (simple API key, no Bedrock complexity)
const PLATFORM_MODEL_PROVIDER = 'google'
const PLATFORM_MODEL_NAME = 'google/gemini-2.0-flash'
const MIN_ABOUT_LENGTH = 120
const MAX_CHARACTER_BYTES = 32 * 1024

function getCloneGeminiKey() {
  return (
    process.env.CLONE_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    null
  )
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getUser(req)
    if (!authUser?.email && !authUser?.phone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit: 2 clone attempts per minute
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const { success: rateLimitOk } = rateLimit(`clone:${ip}`, { maxRequests: 2, windowMs: 60_000 })
    if (!rateLimitOk) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const body = await req.json()
    const { telegram_bot_token, about_text, character_files } = body

    const telegramToken = typeof telegram_bot_token === 'string' ? telegram_bot_token.trim() : ''

    if (!about_text || typeof about_text !== 'string' || about_text.trim().length < MIN_ABOUT_LENGTH) {
      return NextResponse.json({ error: `Please write at least ${MIN_ABOUT_LENGTH} characters about yourself.` }, { status: 400 })
    }

    // Gemini API key for clone deployments
    const geminiApiKey = getCloneGeminiKey()
    if (!geminiApiKey) {
      console.error('No Gemini key configured for clone route (checked CLONE_GEMINI_API_KEY, GEMINI_API_KEY, GOOGLE_API_KEY)')
      return NextResponse.json({ error: 'Clone service is temporarily unavailable' }, { status: 503 })
    }

    // Validate character files size
    if (character_files && typeof character_files === 'object') {
      const totalBytes = Object.values(character_files as Record<string, string>)
        .reduce((sum: number, content) => sum + new TextEncoder().encode(content as string).byteLength, 0)
      if (totalBytes > MAX_CHARACTER_BYTES) {
        return NextResponse.json({ error: 'Character files exceed 32 KB limit' }, { status: 400 })
      }
    }

    // Get or create user
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

    // Check if user already has a free clone running
    const { data: existingClones } = await supabase
      .from('instances')
      .select('id')
      .eq('user_id', user.id)
      .eq('bot_id', 'clone')
      .in('status', ['provisioning', 'running'])

    if (existingClones && existingClones.length > 0) {
      return NextResponse.json({ error: 'You already have a free clone running. Check your console.' }, { status: 409 })
    }

    const gatewayToken = crypto.randomUUID()
    const channel = telegramToken ? 'telegram' : 'web'

    // Insert instance — skip pending_payment, go straight to provisioning
    const { data: instance, error: insertError } = await supabase
      .from('instances')
      .insert({
        user_id: user.id,
        status: 'provisioning',
        model_provider: PLATFORM_MODEL_PROVIDER,
        model_name: PLATFORM_MODEL_NAME,
        channel,
        telegram_bot_token: telegramToken ? encrypt(telegramToken) : null,
        llm_api_key: encrypt(geminiApiKey),
        gateway_token: gatewayToken,
        character_files: {
          ...(character_files || {}),
          _raw_about: about_text.trim(),
        },
        bot_id: 'clone',
        companion_name: 'My Clone',
        companion_role: 'Digital Clone',
        companion_color: '#FFD600',
        companion_avatar: null,
      })
      .select('id')
      .single()

    if (insertError || !instance) {
      console.error('Instance insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create instance' }, { status: 500 })
    }

    // Launch EC2 — Gemini uses simple API key, no Bedrock complexity
    try {
      const { instanceId: ec2InstanceId } = await launchInstance({
        userId: user.id,
        modelProvider: PLATFORM_MODEL_PROVIDER,
        modelName: PLATFORM_MODEL_NAME,
        apiKey: geminiApiKey,
        telegramToken,
        gatewayToken,
        characterFiles: character_files || undefined,
        channel,
      })

      await supabase
        .from('instances')
        .update({ ec2_instance_id: ec2InstanceId })
        .eq('id', instance.id)

      return NextResponse.json({ redirect: '/console' })
    } catch (err: any) {
      console.error('EC2 launch failed:', err)
      await supabase
        .from('instances')
        .update({ status: 'failed' })
        .eq('id', instance.id)
      return NextResponse.json({ error: 'Failed to launch your clone. Please try again.' }, { status: 500 })
    }
  } catch (err: any) {
    console.error('Clone error:', err)
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 })
  }
}

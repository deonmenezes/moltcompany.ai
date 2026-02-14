import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
// import { createCheckoutSession } from '@/lib/stripe'
import { encrypt } from '@/lib/encryption'
import { launchInstance } from '@/lib/aws'

export async function POST(req: NextRequest) {
  try {
    const authUser = await getUser(req)
    if (!authUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { model_provider, model_name, channel, telegram_bot_token, llm_api_key } = body

    if (!model_provider || !model_name || !channel || !telegram_bot_token || !llm_api_key) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get or create user in our users table
    let { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', authUser.email)
      .maybeSingle()

    if (!user) {
      const { data: newUser } = await supabase
        .from('users')
        .insert({
          email: authUser.email,
          name: authUser.user_metadata?.full_name || null,
          google_id: authUser.id,
        })
        .select('id')
        .single()
      user = newUser
    }

    if (!user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Check if user already has an active instance
    const { data: existingInstance } = await supabase
      .from('instances')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['provisioning', 'running'])
      .maybeSingle()

    if (existingInstance) {
      return NextResponse.json({ error: 'You already have an active instance' }, { status: 409 })
    }

    const gatewayToken = crypto.randomUUID()

    // Launch EC2 directly (Stripe commented out for testing)
    const { instanceId } = await launchInstance({
      userId: user.id,
      modelProvider: model_provider,
      modelName: model_name,
      apiKey: llm_api_key,
      telegramToken: telegram_bot_token,
      gatewayToken,
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
    })

    // Stripe commented out for testing
    // const checkoutSession = await createCheckoutSession({
    //   userId: user.id,
    //   email: authUser.email,
    //   instanceConfig: {
    //     model_provider,
    //     model_name,
    //     channel,
    //     telegram_bot_token,
    //     llm_api_key,
    //   },
    // })
    // return NextResponse.json({ url: checkoutSession.url })

    return NextResponse.json({ redirect: '/dashboard' })
  } catch (err) {
    console.error('Deploy error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

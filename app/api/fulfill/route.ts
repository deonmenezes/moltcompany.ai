import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'
import { launchInstance } from '@/lib/aws'
import { decrypt } from '@/lib/encryption'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const authUser = await getUser(req)
    if (!authUser?.email && !authUser?.phone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { session_id } = await req.json()
    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }

    // Retrieve the Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id)
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const userId = session.metadata?.userId
    const instanceId = session.metadata?.instanceId
    if (!userId || !instanceId) {
      return NextResponse.json({ error: 'Invalid session metadata' }, { status: 400 })
    }

    // Check if instance is still pending_payment (webhook hasn't processed it yet)
    const { data: instance } = await supabase
      .from('instances')
      .select('*')
      .eq('id', instanceId)
      .eq('user_id', userId)
      .eq('status', 'pending_payment')
      .single()

    if (!instance) {
      // Already processed by webhook — that's fine
      return NextResponse.json({ status: 'already_processed' })
    }

    // Save subscription (same logic as webhook)
    const subscriptionId = session.subscription as string
    if (subscriptionId) {
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_subscription_id: subscriptionId,
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }, { onConflict: 'stripe_subscription_id' })
    }

    // Update user's stripe customer ID
    if (session.customer) {
      await supabase
        .from('users')
        .update({ stripe_customer_id: session.customer as string })
        .eq('id', userId)
    }

    // Launch EC2 instance
    try {
      const { instanceId: ec2InstanceId } = await launchInstance({
        userId,
        modelProvider: instance.model_provider!,
        modelName: instance.model_name!,
        apiKey: decrypt(instance.llm_api_key!),
        telegramToken: decrypt(instance.telegram_bot_token!),
        gatewayToken: instance.gateway_token!,
        characterFiles: instance.character_files || undefined,
      })

      await supabase
        .from('instances')
        .update({
          ec2_instance_id: ec2InstanceId,
          status: 'provisioning',
        })
        .eq('id', instanceId)

      return NextResponse.json({ status: 'launched' })
    } catch (err: any) {
      console.error('EC2 launch failed:', err)
      await supabase
        .from('instances')
        .update({ status: 'failed' })
        .eq('id', instanceId)
      return NextResponse.json({ error: 'EC2 launch failed: ' + (err?.message || 'unknown') }, { status: 500 })
    }
  } catch (err: any) {
    console.error('Fulfill error:', err)
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 })
  }
}

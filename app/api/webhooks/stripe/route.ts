import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import { launchInstance } from '@/lib/aws'
import { decrypt } from '@/lib/encryption'
import Stripe from 'stripe'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      // 🛡️ Ensure the payment was actually successful before proceeding
      if (session.payment_status !== 'paid') {
        console.log('Session not fully paid. Skipping launch.')
        break
      }

      const userId = session.metadata?.userId
      const instanceId = session.metadata?.instanceId

      if (!userId || !instanceId) {
        console.error('Missing metadata in checkout session')
        break
      }

      // Save subscription with upsert to handle retries gracefully
      const subscriptionId = session.subscription as string

      // 🚨 Step 2 — Stop webhook from crashing when subscriptionId is missing
      if (!subscriptionId) {
        console.error('No subscription on checkout session. Skipping subscription upsert + launch.')
        break
      }

      // Pull the real subscription truth from Stripe (period end + status)
      const stripeSub = await stripe.subscriptions.retrieve(subscriptionId)

      await supabase.from('subscriptions').upsert(
        {
          user_id: userId,
          stripe_subscription_id: subscriptionId,
          status: stripeSub.status, // e.g. 'active', 'trialing', 'past_due', etc.
          current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
        },
        { onConflict: 'stripe_subscription_id' }
      )

      // Update user's stripe customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: session.customer as string })
        .eq('id', userId)

      // Atomically transition pending_payment -> provisioning
      const { data: instance, error: updateError } = await supabase
        .from('instances')
        .update({ status: 'provisioning' })
        .eq('id', instanceId)
        .eq('user_id', userId)
        .eq('status', 'pending_payment')
        .select('*')
        .single()

      if (updateError || !instance) {
        console.log('Instance already processed or not pending. Skipping launch.')
        break
      }

      // Helper to avoid crashing on null/undefined tokens
      const safeDecrypt = (value: string | null | undefined) => (value ? decrypt(value) : '')

      // Launch EC2 instance
      try {
        const channel = instance.channel || 'telegram'
        const { instanceId: ec2InstanceId } = await launchInstance({
          userId,
          modelProvider: instance.model_provider!,
          modelName: instance.model_name!,
          apiKey: safeDecrypt(instance.llm_api_key),
          telegramToken: channel === 'telegram' ? safeDecrypt(instance.telegram_bot_token) : '',
          gatewayToken: instance.gateway_token!,
          characterFiles: instance.character_files || undefined,
          channel,
          teamsCredentials: channel === 'teams' && instance.teams_app_id && instance.teams_app_password
            ? {
                appId: safeDecrypt(instance.teams_app_id),
                appPassword: safeDecrypt(instance.teams_app_password),
              }
            : undefined,
          whatsappCredentials: channel === 'whatsapp' && instance.whatsapp_phone_id && instance.whatsapp_access_token
            ? {
                phoneNumberId: instance.whatsapp_phone_id,
                accessToken: safeDecrypt(instance.whatsapp_access_token),
              }
            : undefined,
        })

        await supabase
          .from('instances')
          .update({
            ec2_instance_id: ec2InstanceId,
          })
          .eq('id', instanceId)
      } catch (err) {
        console.error('EC2 launch failed:', err)
        await supabase
          .from('instances')
          .update({ status: 'failed' })
          .eq('id', instanceId)
      }

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscription.id)
        .single()

      if (sub) {
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)

        // Terminate the EC2 instance
        const { data: instance } = await supabase
          .from('instances')
          .select('ec2_instance_id')
          .eq('user_id', sub.user_id)
          .eq('status', 'running')
          .single()

        if (instance?.ec2_instance_id) {
          const { terminateInstance } = await import('@/lib/aws')
          await terminateInstance(instance.ec2_instance_id)
          await supabase
            .from('instances')
            .update({ status: 'terminated' })
            .eq('ec2_instance_id', instance.ec2_instance_id)
        }
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (user) {
        await supabase
          .from('instances')
          .update({ status: 'payment_failed' })
          .eq('user_id', user.id)
          .in('status', ['running', 'provisioning'])
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
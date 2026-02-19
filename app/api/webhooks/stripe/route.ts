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
      const userId = session.metadata?.userId
      const instanceId = session.metadata?.instanceId

      if (!userId || !instanceId) {
        console.error('Missing metadata in checkout session')
        break
      }

      // Save subscription
      const subscriptionId = session.subscription as string
      const isTrial = session.payment_status === 'no_payment_required'
      await supabase.from('subscriptions').insert({
        user_id: userId,
        stripe_subscription_id: subscriptionId,
        status: isTrial ? 'trialing' : 'active',
        current_period_end: new Date(Date.now() + (isTrial ? 3 : 30) * 24 * 60 * 60 * 1000).toISOString(),
      })

      // Update user's stripe customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: session.customer as string })
        .eq('id', userId)

      // Fetch pending instance config from DB
      const { data: instance, error: fetchError } = await supabase
        .from('instances')
        .select('*')
        .eq('id', instanceId)
        .eq('user_id', userId)
        .eq('status', 'pending_payment')
        .single()

      if (fetchError || !instance) {
        console.error('Failed to fetch pending instance:', fetchError)
        break
      }

      // Launch EC2 instance
      try {
        const channel = instance.channel || 'telegram'
        const { instanceId: ec2InstanceId } = await launchInstance({
          userId,
          modelProvider: instance.model_provider!,
          modelName: instance.model_name!,
          apiKey: decrypt(instance.llm_api_key!),
          telegramToken: channel === 'telegram' ? decrypt(instance.telegram_bot_token!) : '',
          gatewayToken: instance.gateway_token!,
          characterFiles: instance.character_files || undefined,
          channel,
          teamsCredentials: channel === 'teams' && instance.teams_app_id && instance.teams_app_password
            ? { appId: decrypt(instance.teams_app_id), appPassword: decrypt(instance.teams_app_password) }
            : undefined,
          whatsappCredentials: channel === 'whatsapp' && instance.whatsapp_phone_id && instance.whatsapp_access_token
            ? { phoneNumberId: instance.whatsapp_phone_id, accessToken: decrypt(instance.whatsapp_access_token) }
            : undefined,
        })

        await supabase
          .from('instances')
          .update({
            ec2_instance_id: ec2InstanceId,
            status: 'provisioning',
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

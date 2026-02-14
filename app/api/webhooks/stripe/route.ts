import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import { launchInstance } from '@/lib/aws'
import { encrypt } from '@/lib/encryption'
import Stripe from 'stripe'

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
      const configStr = session.metadata?.instanceConfig

      if (!userId || !configStr) {
        console.error('Missing metadata in checkout session')
        break
      }

      const config = JSON.parse(configStr)

      // Save subscription
      const subscriptionId = session.subscription as string
      await supabase.from('subscriptions').insert({
        user_id: userId,
        stripe_subscription_id: subscriptionId,
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })

      // Update user's stripe customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: session.customer as string })
        .eq('id', userId)

      // Launch EC2 instance
      try {
        const gatewayToken = crypto.randomUUID()

        const { instanceId } = await launchInstance({
          userId,
          modelProvider: config.model_provider,
          modelName: config.model_name,
          apiKey: config.llm_api_key,
          telegramToken: config.telegram_bot_token,
          gatewayToken,
        })

        // Update the instance record
        await supabase
          .from('instances')
          .update({
            ec2_instance_id: instanceId,
            status: 'provisioning',
            gateway_token: gatewayToken,
          })
          .eq('user_id', userId)
          .eq('status', 'pending_payment')
      } catch (err) {
        console.error('EC2 launch failed:', err)
        await supabase
          .from('instances')
          .update({ status: 'failed' })
          .eq('user_id', userId)
          .eq('status', 'pending_payment')
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

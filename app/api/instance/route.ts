import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { getInstancePublicIp, getInstanceState, stopInstance, startInstance, terminateInstance, launchInstance } from '@/lib/aws'
import { encrypt, decrypt } from '@/lib/encryption'
import { stripe } from '@/lib/stripe'

export const maxDuration = 60

export async function GET(req: NextRequest) {
  try {
    const authUser = await getUser(req)
    if (!authUser?.email && !authUser?.phone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lookupField = authUser.email ? 'email' : 'phone'
    const lookupValue = (authUser.email || authUser.phone)!

    const { data: user } = await supabase
      .from('users')
      .select('id, stripe_customer_id')
      .eq(lookupField, lookupValue)
      .maybeSingle()

    if (!user) {
      return NextResponse.json({ instances: [], subscription: null })
    }

    const { data: instances } = await supabase
      .from('instances')
      .select('*')
      .eq('user_id', user.id)
      .not('status', 'in', '("terminated","payment_failed")')
      .order('created_at', { ascending: false })

    // Sync AWS state for running/provisioning instances
    if (instances?.length) {
      await Promise.allSettled(
        instances
          .filter(i => i.ec2_instance_id && ['running', 'provisioning'].includes(i.status))
          .map(async (instance) => {
            try {
              const [ip, state] = await Promise.all([
                getInstancePublicIp(instance.ec2_instance_id!),
                getInstanceState(instance.ec2_instance_id!),
              ])
              const newStatus = state === 'running' ? 'running' : state === 'stopped' ? 'stopped' : instance.status
              if (ip !== instance.public_ip || newStatus !== instance.status) {
                await supabase
                  .from('instances')
                  .update({ public_ip: ip, status: newStatus, last_health_check: new Date().toISOString() })
                  .eq('id', instance.id)
              }
              instance.public_ip = ip
              instance.status = newStatus
            } catch {
              // AWS call failed, return cached data
            }
          })
      )
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    return NextResponse.json({
      instances: (instances || []).map(i => ({
        ...i,
        telegram_bot_token: undefined,
        llm_api_key: undefined,
      })),
      subscription,
      stripeCustomerId: user.stripe_customer_id,
    })
  } catch (err) {
    console.error('Instance fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getUser(req)
    if (!authUser?.email && !authUser?.phone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, instance_id, new_api_key } = await req.json()

    if (!instance_id) {
      return NextResponse.json({ error: 'instance_id required' }, { status: 400 })
    }

    const lookupField = authUser.email ? 'email' : 'phone'
    const lookupValue = (authUser.email || authUser.phone)!

    const { data: user } = await supabase
      .from('users')
      .select('id, stripe_customer_id')
      .eq(lookupField, lookupValue)
      .maybeSingle()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // For update_key, we need all instance fields to redeploy
    if (action === 'update_key') {
      if (!new_api_key || typeof new_api_key !== 'string' || new_api_key.trim().length < 10) {
        return NextResponse.json({ error: 'Valid API key required' }, { status: 400 })
      }

      const { data: inst } = await supabase
        .from('instances')
        .select('*')
        .eq('id', instance_id)
        .eq('user_id', user.id)
        .in('status', ['running', 'stopped', 'provisioning'])
        .maybeSingle()

      if (!inst) {
        return NextResponse.json({ error: 'No active instance' }, { status: 404 })
      }

      // Terminate old EC2
      if (inst.ec2_instance_id) {
        try { await terminateInstance(inst.ec2_instance_id) } catch { /* continue */ }
      }

      // Launch new EC2 with updated API key
      const { instanceId: newEc2Id } = await launchInstance({
        userId: user.id,
        modelProvider: inst.model_provider,
        modelName: inst.model_name,
        apiKey: new_api_key.trim(),
        telegramToken: decrypt(inst.telegram_bot_token),
        gatewayToken: inst.gateway_token,
        characterFiles: inst.character_files || undefined,
      })

      // Update instance record
      await supabase
        .from('instances')
        .update({
          ec2_instance_id: newEc2Id,
          llm_api_key: encrypt(new_api_key.trim()),
          status: 'provisioning',
          public_ip: null,
        })
        .eq('id', instance_id)

      return NextResponse.json({ success: true })
    }

    // For cancel_subscription
    if (action === 'cancel_subscription') {
      if (!user.stripe_customer_id) {
        return NextResponse.json({ error: 'No billing account found' }, { status: 404 })
      }

      // Find active subscription for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: 'active',
        limit: 10,
      })

      // Cancel all active subscriptions
      for (const sub of subscriptions.data) {
        await stripe.subscriptions.cancel(sub.id)
      }

      // Update subscription status in DB
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('user_id', user.id)
        .eq('status', 'active')

      // Terminate the instance
      const { data: inst } = await supabase
        .from('instances')
        .select('ec2_instance_id')
        .eq('id', instance_id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (inst?.ec2_instance_id) {
        try { await terminateInstance(inst.ec2_instance_id) } catch { /* continue */ }
      }

      await supabase
        .from('instances')
        .update({ status: 'terminated' })
        .eq('id', instance_id)

      return NextResponse.json({ success: true })
    }

    // Retry launch for stuck pending_payment instances
    if (action === 'retry_launch') {
      const { data: inst } = await supabase
        .from('instances')
        .select('*')
        .eq('id', instance_id)
        .eq('user_id', user.id)
        .in('status', ['pending_payment', 'failed'])
        .maybeSingle()

      if (!inst) {
        return NextResponse.json({ error: 'No pending instance found' }, { status: 404 })
      }

      try {
        const { instanceId: ec2InstanceId } = await launchInstance({
          userId: user.id,
          modelProvider: inst.model_provider!,
          modelName: inst.model_name!,
          apiKey: decrypt(inst.llm_api_key!),
          telegramToken: decrypt(inst.telegram_bot_token!),
          gatewayToken: inst.gateway_token!,
          characterFiles: inst.character_files || undefined,
        })

        await supabase
          .from('instances')
          .update({
            ec2_instance_id: ec2InstanceId,
            status: 'provisioning',
          })
          .eq('id', instance_id)

        return NextResponse.json({ success: true })
      } catch (err: any) {
        console.error('Retry launch failed:', err)
        await supabase
          .from('instances')
          .update({ status: 'failed' })
          .eq('id', instance_id)
        return NextResponse.json({ error: 'EC2 launch failed: ' + (err?.message || 'unknown') }, { status: 500 })
      }
    }

    // Standard start/stop actions
    const { data: instance } = await supabase
      .from('instances')
      .select('ec2_instance_id, status')
      .eq('id', instance_id)
      .eq('user_id', user.id)
      .in('status', ['running', 'stopped', 'provisioning'])
      .maybeSingle()

    if (!instance?.ec2_instance_id) {
      return NextResponse.json({ error: 'No active instance' }, { status: 404 })
    }

    if (action === 'stop') {
      await stopInstance(instance.ec2_instance_id)
      await supabase
        .from('instances')
        .update({ status: 'stopped' })
        .eq('id', instance_id)
    } else if (action === 'start') {
      await startInstance(instance.ec2_instance_id)
      await supabase
        .from('instances')
        .update({ status: 'running' })
        .eq('id', instance_id)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Instance action error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = await getUser(req)
    if (!authUser?.email && !authUser?.phone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { instance_id } = await req.json()

    if (!instance_id) {
      return NextResponse.json({ error: 'instance_id required' }, { status: 400 })
    }

    const lookupField = authUser.email ? 'email' : 'phone'
    const lookupValue = (authUser.email || authUser.phone)!

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq(lookupField, lookupValue)
      .maybeSingle()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: instance } = await supabase
      .from('instances')
      .select('ec2_instance_id, id')
      .eq('id', instance_id)
      .eq('user_id', user.id)
      .in('status', ['running', 'stopped', 'provisioning', 'pending_payment', 'failed'])
      .maybeSingle()

    if (!instance) {
      return NextResponse.json({ error: 'No active instance' }, { status: 404 })
    }

    if (instance.ec2_instance_id) {
      try {
        await terminateInstance(instance.ec2_instance_id)
      } catch (err) {
        console.error('EC2 termination error (continuing with DB cleanup):', err)
      }
    }

    await supabase
      .from('instances')
      .update({ status: 'terminated' })
      .eq('id', instance.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Instance termination error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

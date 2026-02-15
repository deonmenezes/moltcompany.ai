import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { getInstancePublicIp, getInstanceState, stopInstance, startInstance, terminateInstance } from '@/lib/aws'

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

    const { action, instance_id } = await req.json()

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
      .in('status', ['running', 'stopped', 'provisioning'])
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

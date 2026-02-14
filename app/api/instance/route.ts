import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { getInstancePublicIp, getInstanceState, stopInstance, startInstance, terminateInstance } from '@/lib/aws'

export async function GET(req: NextRequest) {
  try {
    const authUser = await getUser(req)
    if (!authUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, stripe_customer_id')
      .eq('email', authUser.email)
      .maybeSingle()

    if (!user) {
      return NextResponse.json({ instance: null })
    }

    const { data: instance } = await supabase
      .from('instances')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!instance) {
      return NextResponse.json({ instance: null })
    }

    if (instance.ec2_instance_id) {
      try {
        const [ip, state] = await Promise.all([
          getInstancePublicIp(instance.ec2_instance_id),
          getInstanceState(instance.ec2_instance_id),
        ])

        const newStatus = state === 'running' ? 'running' : state === 'stopped' ? 'stopped' : instance.status

        if (ip !== instance.public_ip || newStatus !== instance.status) {
          await supabase
            .from('instances')
            .update({
              public_ip: ip,
              status: newStatus,
              last_health_check: new Date().toISOString(),
            })
            .eq('id', instance.id)
        }

        instance.public_ip = ip
        instance.status = newStatus
      } catch {
        // AWS call failed, return cached data
      }
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    return NextResponse.json({
      instance: {
        ...instance,
        telegram_bot_token: undefined,
        llm_api_key: undefined,
      },
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
    if (!authUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await req.json()

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', authUser.email)
      .maybeSingle()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: instances } = await supabase
      .from('instances')
      .select('ec2_instance_id, status')
      .eq('user_id', user.id)
      .in('status', ['running', 'stopped', 'provisioning'])
      .order('created_at', { ascending: false })
      .limit(1)

    const instance = instances?.[0]

    if (!instance?.ec2_instance_id) {
      return NextResponse.json({ error: 'No active instance' }, { status: 404 })
    }

    if (action === 'stop') {
      await stopInstance(instance.ec2_instance_id)
      await supabase
        .from('instances')
        .update({ status: 'stopped' })
        .eq('ec2_instance_id', instance.ec2_instance_id)
    } else if (action === 'start') {
      await startInstance(instance.ec2_instance_id)
      await supabase
        .from('instances')
        .update({ status: 'running' })
        .eq('ec2_instance_id', instance.ec2_instance_id)
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
    if (!authUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', authUser.email)
      .maybeSingle()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: instances } = await supabase
      .from('instances')
      .select('ec2_instance_id, id')
      .eq('user_id', user.id)
      .in('status', ['running', 'stopped', 'provisioning'])
      .order('created_at', { ascending: false })
      .limit(1)

    const instance = instances?.[0]

    if (!instance) {
      return NextResponse.json({ error: 'No active instance' }, { status: 404 })
    }

    // Terminate EC2 instance if it exists
    if (instance.ec2_instance_id) {
      try {
        await terminateInstance(instance.ec2_instance_id)
      } catch (err) {
        console.error('EC2 termination error (continuing with DB cleanup):', err)
      }
    }

    // Update status in database
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

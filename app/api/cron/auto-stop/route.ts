import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { stopInstance, getInstanceState } from '@/lib/aws'

export const maxDuration = 60

// Idle threshold in minutes (default: 30)
const IDLE_MINUTES = parseInt(process.env.IDLE_STOP_MINUTES || '30', 10)

export async function GET(req: NextRequest) {
  try {
    // 🔐 Protect cron route with secret
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cutoff = new Date(Date.now() - IDLE_MINUTES * 60 * 1000).toISOString()

    // Find running instances that have been idle past threshold
    const { data: instances, error } = await supabase
      .from('instances')
      .select('id, ec2_instance_id, last_activity_at')
      .eq('status', 'running')
      .not('last_activity_at', 'is', null)
      .lt('last_activity_at', cutoff)

    if (error) {
      console.error('DB query failed:', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    let stoppedCount = 0

    for (const instance of instances || []) {
      if (!instance.ec2_instance_id) continue

      try {
        // Double-check AWS state before stopping
        const state = await getInstanceState(instance.ec2_instance_id)
        if (state !== 'running') continue

        await stopInstance(instance.ec2_instance_id)

        await supabase
          .from('instances')
          .update({ status: 'stopping' })
          .eq('id', instance.id)

        stoppedCount++
      } catch (err) {
        console.error(`Failed stopping instance ${instance.id}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      checked: instances?.length || 0,
      stopped: stoppedCount,
      idleThresholdMinutes: IDLE_MINUTES,
    })
  } catch (err) {
    console.error('Auto-stop cron error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// POST /api/phone-verify — send or check OTP via Twilio Verify WhatsApp
export async function POST(req: NextRequest) {
  try {
    const authUser = await getUser(req)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, phone, code } = await req.json()

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID

    if (!accountSid || !authToken || !serviceSid) {
      return NextResponse.json({ error: 'Phone verification not configured' }, { status: 500 })
    }

    const twilioAuth = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64')

    // --- SEND OTP ---
    if (action === 'send') {
      if (!phone || phone.length < 8) {
        return NextResponse.json({ error: 'Valid phone number required' }, { status: 400 })
      }

      const res = await fetch(
        `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`,
        {
          method: 'POST',
          headers: {
            'Authorization': twilioAuth,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ To: phone, Channel: 'whatsapp' }),
        }
      )

      const data = await res.json()
      if (!res.ok) {
        console.error('Twilio send error:', data)
        return NextResponse.json(
          { error: data.message || 'Failed to send verification code' },
          { status: 400 }
        )
      }

      return NextResponse.json({ success: true })
    }

    // --- CHECK OTP ---
    if (action === 'check') {
      if (!phone || !code) {
        return NextResponse.json({ error: 'Phone and code required' }, { status: 400 })
      }

      const res = await fetch(
        `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`,
        {
          method: 'POST',
          headers: {
            'Authorization': twilioAuth,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ To: phone, Code: code }),
        }
      )

      const data = await res.json()
      if (!res.ok || data.status !== 'approved') {
        return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
      }

      // Update user's phone in Supabase
      const { error } = await supabase.auth.admin.updateUserById(authUser.id, {
        phone,
        phone_confirm: true,
      })

      if (error) {
        console.error('Failed to update user phone:', error)
        return NextResponse.json({ error: 'Verification succeeded but failed to save phone' }, { status: 500 })
      }

      return NextResponse.json({ success: true, verified: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('Phone verify error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

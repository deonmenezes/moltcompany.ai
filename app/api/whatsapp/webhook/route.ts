import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { decrypt } from '@/lib/encryption'

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'moltcompany-whatsapp-verify'
const GRAPH_API_VERSION = 'v21.0'

/**
 * GET /api/whatsapp/webhook
 * Meta webhook verification — responds to the hub.challenge
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    console.log('[WhatsApp] Webhook verified')
    return new Response(challenge || '', { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

/**
 * POST /api/whatsapp/webhook
 * Receives messages from WhatsApp Cloud API, routes to the correct
 * OpenClaw instance, and replies via the WhatsApp API.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // WhatsApp sends a notification object
    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ignored' })
    }

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue

        const value = change.value
        const phoneNumberId = value?.metadata?.phone_number_id
        const messages = value?.messages || []

        if (!phoneNumberId || messages.length === 0) continue

        // Look up the instance by phone_number_id (stored in plaintext for routing)
        const { data: instance } = await supabase
          .from('instances')
          .select('*')
          .eq('whatsapp_phone_id', phoneNumberId)
          .in('status', ['running', 'provisioning'])
          .single()

        if (!instance || !instance.public_ip || !instance.whatsapp_access_token) {
          console.warn(`[WhatsApp] No running instance for phone_number_id: ${phoneNumberId}`)
          continue
        }

        const accessToken = decrypt(instance.whatsapp_access_token)

        for (const msg of messages) {
          // Only handle text messages for now
          if (msg.type !== 'text') continue

          const userPhone = msg.from
          const text = msg.text?.body
          if (!text) continue

          console.log(`[WhatsApp] From ${userPhone} to ${phoneNumberId}: ${text.substring(0, 100)}`)

          // Forward to OpenClaw gateway on EC2
          let replyText: string
          try {
            const gwUrl = `http://${instance.public_ip}:8080/api/v1/chat/completions`
            const gwRes = await fetch(gwUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(instance.gateway_token ? { Authorization: `Bearer ${instance.gateway_token}` } : {}),
              },
              body: JSON.stringify({
                model: 'default',
                messages: [{ role: 'user', content: text }],
                user: userPhone,
                metadata: { source: 'whatsapp', phoneNumberId },
              }),
              signal: AbortSignal.timeout(55_000), // 55s timeout (Vercel max is 60s)
            })

            if (!gwRes.ok) {
              throw new Error(`Gateway returned ${gwRes.status}`)
            }

            const gwData = await gwRes.json()
            replyText = gwData.choices?.[0]?.message?.content || gwData.response || 'No response.'
          } catch (err: any) {
            console.error(`[WhatsApp] Gateway error for ${phoneNumberId}:`, err.message)
            replyText = 'Having trouble connecting. Please try again shortly.'
          }

          // Send reply back via WhatsApp Cloud API
          try {
            const sendUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`
            const sendRes = await fetch(sendUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: userPhone,
                type: 'text',
                text: { body: replyText },
              }),
            })

            if (!sendRes.ok) {
              const errBody = await sendRes.text()
              console.error(`[WhatsApp] Send failed for ${phoneNumberId}:`, sendRes.status, errBody)
            }
          } catch (err: any) {
            console.error(`[WhatsApp] Send error:`, err.message)
          }
        }
      }
    }

    // Always return 200 to Meta (they retry on non-200)
    return NextResponse.json({ status: 'ok' })
  } catch (err: any) {
    console.error('[WhatsApp] Webhook error:', err)
    // Still return 200 to prevent Meta retries on parse errors
    return NextResponse.json({ status: 'error' })
  }
}

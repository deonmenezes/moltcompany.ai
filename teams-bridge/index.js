const {
  CloudAdapter,
  ConfigurationBotFrameworkAuthentication,
  ActivityTypes,
} = require('botbuilder')
const express = require('express')

// --- Configuration via environment variables ---
const PORT = parseInt(process.env.BRIDGE_PORT || '3978', 10)
const OPENCLAW_GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:8080'
const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || ''
const MICROSOFT_APP_ID = process.env.MICROSOFT_APP_ID || ''
const MICROSOFT_APP_PASSWORD = process.env.MICROSOFT_APP_PASSWORD || ''

// Bot Framework auth config
// When no App ID is set, use MultiTenant with empty creds (allows Bot Framework Emulator)
// When App ID is set, use SingleTenant for production Teams
const botFrameworkAuth = new ConfigurationBotFrameworkAuthentication(
  MICROSOFT_APP_ID
    ? {
        MicrosoftAppId: MICROSOFT_APP_ID,
        MicrosoftAppPassword: MICROSOFT_APP_PASSWORD,
        MicrosoftAppType: 'SingleTenant',
      }
    : {}
)

const adapter = new CloudAdapter(botFrameworkAuth)

// Catch-all error handler
adapter.onTurnError = async (context, error) => {
  console.error('[TeamsBot] Unhandled error:', error)
  await context.sendActivity('Sorry, something went wrong. Please try again.')
}

// --- OpenClaw Gateway communication ---

/**
 * Send a message to OpenClaw gateway and get the response.
 * Uses the REST API: POST /api/v1/chat/completions
 */
async function sendToOpenClaw(userMessage, userId, conversationId) {
  const url = `${OPENCLAW_GATEWAY_URL}/api/v1/chat/completions`

  const body = JSON.stringify({
    model: 'default',
    messages: [{ role: 'user', content: userMessage }],
    user: userId,
    metadata: { conversationId, source: 'teams' },
  })

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(OPENCLAW_GATEWAY_TOKEN
        ? { Authorization: `Bearer ${OPENCLAW_GATEWAY_TOKEN}` }
        : {}),
    },
    body,
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`OpenClaw gateway error ${response.status}: ${errText}`)
  }

  const data = await response.json()

  // OpenClaw returns OpenAI-compatible response
  const reply =
    data.choices?.[0]?.message?.content ||
    data.response ||
    'I received your message but have no response.'

  return reply
}

// --- Bot message handler ---

async function onMessage(context) {
  if (context.activity.type !== ActivityTypes.Message) {
    return
  }

  const userMessage = context.activity.text || ''
  const userId = context.activity.from?.id || 'unknown'
  const conversationId = context.activity.conversation?.id || 'unknown'

  if (!userMessage.trim()) {
    return
  }

  console.log(`[TeamsBot] Message from ${userId}: ${userMessage.substring(0, 100)}`)

  // Show typing indicator while waiting for OpenClaw
  await context.sendActivity({ type: ActivityTypes.Typing })

  try {
    const reply = await sendToOpenClaw(userMessage, userId, conversationId)
    await context.sendActivity(reply)
    console.log(`[TeamsBot] Replied to ${userId}: ${reply.substring(0, 100)}`)
  } catch (err) {
    console.error('[TeamsBot] Failed to get response from OpenClaw:', err.message)
    await context.sendActivity(
      'I\'m having trouble connecting to my brain right now. Please try again in a moment.'
    )
  }
}

// --- Express server ---

const app = express()
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'teams-bridge' })
})

app.post('/api/messages', async (req, res) => {
  try {
    await adapter.process(req, res, async (context) => {
      await onMessage(context)
    })
  } catch (err) {
    console.error('[TeamsBot] Request processing error:', err)
    if (!res.headersSent) {
      res.status(500).send('Internal Server Error')
    }
  }
})

app.listen(PORT, () => {
  console.log(`[TeamsBot] Bridge running on port ${PORT}`)
  console.log(`[TeamsBot] OpenClaw gateway: ${OPENCLAW_GATEWAY_URL}`)
  console.log(`[TeamsBot] App ID: ${MICROSOFT_APP_ID || '(none - emulator mode)'}`)
  console.log(`[TeamsBot] POST /api/messages  — Bot Framework messaging endpoint`)
  console.log(`[TeamsBot] GET  /health         — Health check`)
})

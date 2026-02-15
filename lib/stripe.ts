import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function createCheckoutSession({
  userId,
  email,
  instanceConfig,
}: {
  userId: string
  email: string
  instanceConfig: {
    model_provider: string
    model_name: string
    channel: string
    telegram_bot_token: string
    llm_api_key: string
  }
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'OpenClaw AI Bot - Managed Instance',
            description: 'Fully managed AI Telegram bot on dedicated AWS infrastructure',
          },
          unit_amount: 4000,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      instanceConfig: JSON.stringify(instanceConfig),
    },
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/deploy?canceled=true`,
  })

  return session
}

export async function createCustomerPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
  })
  return session
}

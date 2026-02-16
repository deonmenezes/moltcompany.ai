import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function createCheckoutSession({
  userId,
  instanceId,
  email,
  origin,
}: {
  userId: string
  instanceId: string
  email?: string | null
  origin: string
}) {
  const baseUrl = origin || process.env.NEXTAUTH_URL || 'https://moltcompany.ai'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    ...(email ? { customer_email: email } : {}),
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'MoltCompany.ai - Managed AI Companion',
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
      instanceId,
    },
    success_url: `${baseUrl}/console?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/deploy?canceled=true`,
  })

  return session
}

export async function createCustomerPortalSession(customerId: string, origin?: string) {
  const baseUrl = origin || process.env.NEXTAUTH_URL || 'https://moltcompany.ai'

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/console`,
  })
  return session
}

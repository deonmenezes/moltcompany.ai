import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { skills } from '@/lib/skills'

export async function POST(req: NextRequest) {
  try {
    const authUser = await getUser(req)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { skillId } = await req.json()
    const skill = skills.find(s => s.id === skillId)
    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/[^/]*$/, '') || 'https://moltcompany.ai'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: authUser.email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `OpenClaw Skill: ${skill.name}`,
              description: skill.description,
            },
            unit_amount: skill.price * 100,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          userId: authUser.id,
          skillId: skill.id,
          type: 'skill_subscription',
        },
      },
      metadata: {
        userId: authUser.id,
        skillId: skill.id,
        type: 'skill_subscription',
      },
      success_url: `${origin}/skills?subscribed=${skill.id}`,
      cancel_url: `${origin}/skills?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Skill subscribe error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

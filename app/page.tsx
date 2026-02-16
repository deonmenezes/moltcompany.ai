'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BotGrid } from '@/components/BotGrid'
import { TestimonialCard } from '@/components/TestimonialCard'
import { testimonials } from '@/lib/bots'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const useCases = [
  'Customer Support', 'Email Drafting', 'Content Writing',
  'Code Review', 'Data Analysis', 'Task Automation',
  'Translation', 'Scheduling', 'Report Generation', 'Social Media',
]

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.replace('/console')
    }
  }, [user, loading, router])

  if (loading || user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-16">
        <div className="animate-spin h-8 w-8 border-3 border-brand-yellow border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-16">

      {/* HERO */}
      <section className="pt-16 pb-20 px-4 border-b-3 border-black">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="comic-heading text-5xl md:text-7xl lg:text-8xl mb-6 leading-[0.95]">
            YOUR OWN<br />
            <span className="yellow-highlight">AI EMPLOYEE</span><br />
            IN 60 SECONDS
          </h1>
          <p className="text-xl text-brand-gray-dark mb-8 max-w-2xl mx-auto font-body">
            Pick a companion. Connect Telegram. Deploy. Your AI employee works 24/7 so you don&apos;t have to.
          </p>
          <Link href="/companions" className="comic-btn text-lg inline-block">
            HIRE YOUR COMPANION
          </Link>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="flex">
              {['amy', 'caroline', 'christopher', 'sean'].map((name) => (
                <Image
                  key={name}
                  src={`/avatars/${name}.png`}
                  alt=""
                  width={36}
                  height={36}
                  className="rounded-full border-2 border-black -ml-2 first:ml-0"
                />
              ))}
            </div>
            <div className="flex gap-0.5 text-brand-yellow text-lg">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
            <span className="text-sm font-bold text-black">Trusted by 500+ businesses</span>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="py-4 overflow-hidden border-b-3 border-black bg-brand-yellow">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...useCases, ...useCases].map((useCase, i) => (
            <span key={i} className="mx-8 text-black font-display font-bold text-lg uppercase">
              {useCase}
              <span className="mx-8">&bull;</span>
            </span>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section className="comic-section border-b-3 border-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="comic-heading text-4xl md:text-5xl mb-4">
            YOU WANT TO SCALE,
          </h2>
          <p className="comic-heading text-3xl md:text-4xl text-brand-gray-medium mb-12">
            BUT YOU CAN&apos;T BE ONLINE 24/7
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '&#128548;', text: 'Customers message at 3 AM and get no reply' },
              { icon: '&#128184;', text: 'Hiring a support team costs $3,000+/month' },
              { icon: '&#9200;', text: 'You waste hours on repetitive questions' },
            ].map((item, i) => (
              <div key={i} className="comic-card p-6 text-center">
                <div className="text-4xl mb-4" dangerouslySetInnerHTML={{ __html: item.icon }} />
                <p className="font-body text-brand-gray-dark font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPANION CARDS */}
      <section id="companions" className="comic-section bg-brand-yellow border-b-3 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="comic-heading text-4xl md:text-5xl mb-2">
              <span className="yellow-highlight bg-black text-white px-4 py-1 inline-block">STOP JUGGLING.</span>{' '}
              MEET YOUR TEAM.
            </h2>
            <p className="text-lg text-black font-body max-w-xl mx-auto mt-4">
              Why hire one person when you can have a whole department? Each companion runs on a dedicated AWS server, connected to your Telegram. Always on.
            </p>
          </div>
          <BotGrid />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="comic-section border-b-3 border-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="comic-heading text-4xl md:text-5xl text-center mb-12">
            HOW IT WORKS
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'PICK YOUR COMPANION', desc: 'Choose the AI role that fits your needs. From CEO to Developer to Finance — we have your team covered.' },
              { step: '02', title: 'CONNECT TELEGRAM', desc: 'Create a bot via @BotFather, paste the token. Takes 30 seconds.' },
              { step: '03', title: 'GO LIVE', desc: "We deploy your companion on a dedicated AWS server. It's live and responding in under a minute." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-brand-yellow border-3 border-black flex items-center justify-center shadow-comic-sm">
                  <span className="font-display font-black text-2xl">{item.step}</span>
                </div>
                <h3 className="comic-heading text-xl mb-3">{item.title}</h3>
                <p className="text-brand-gray-dark font-body text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="comic-section bg-brand-gray border-b-3 border-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="comic-heading text-4xl md:text-5xl text-center mb-2">
            EMPLOYEE OF THE MONTH.
          </h2>
          <p className="comic-heading text-3xl md:text-4xl text-center mb-12">
            <span className="yellow-highlight">EVERY MONTH.</span>
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-6 max-w-4xl mx-auto">
            {testimonials.slice(3).map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="comic-section bg-black text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="comic-heading text-4xl md:text-5xl mb-6">
            IF YOU&apos;RE READING THIS,<br />
            YOU&apos;RE ALREADY AHEAD.
          </h2>
          <p className="text-xl text-gray-400 mb-8 font-body">
            While you hesitate, your competitors are hiring AI companions that work while they sleep.
          </p>
          <Link href="/companions" className="comic-btn text-lg inline-block">
            HIRE YOUR COMPANION NOW
          </Link>
          <p className="mt-6 text-brand-yellow text-sm font-display font-bold uppercase">
            All companions $40/month. Cancel anytime. No lock-in.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 bg-white border-t-3 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <span className="font-display font-black text-xl uppercase">MOLTCOMPANY<span className="text-brand-yellow">.AI</span></span>
              <p className="text-sm text-brand-gray-medium mt-2 font-body">AI companions, fully managed.</p>
              {/* Social links */}
              <div className="flex gap-3 mt-4">
                <a href="https://www.linkedin.com/company/111713673" target="_blank" rel="noopener noreferrer" className="w-9 h-9 border-2 border-black flex items-center justify-center hover:bg-brand-yellow transition" title="LinkedIn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://x.com/ai_socialdao" target="_blank" rel="noopener noreferrer" className="w-9 h-9 border-2 border-black flex items-center justify-center hover:bg-brand-yellow transition" title="X (Twitter)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm uppercase mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-brand-gray-medium">
                <li><Link href="/companions" className="hover:text-black transition">All Companions</Link></li>
                <li><Link href="/deploy" className="hover:text-black transition">Hire Companion</Link></li>
                <li><Link href="/console" className="hover:text-black transition">Console</Link></li>
                <li><Link href="/create" className="hover:text-black transition">Create Companion</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm uppercase mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-brand-gray-medium">
                <li>
                  <a href="mailto:company@virelity.com" className="hover:text-black transition flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    company@virelity.com
                  </a>
                </li>
                <li>
                  <a href="tel:+971566433640" className="hover:text-black transition flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    +971 56 643 3640
                  </a>
                </li>
                <li className="pt-2">
                  <a href="https://www.linkedin.com/company/111713673" target="_blank" rel="noopener noreferrer" className="hover:text-black transition">LinkedIn</a>
                  {' '}&middot;{' '}
                  <a href="https://x.com/ai_socialdao" target="_blank" rel="noopener noreferrer" className="hover:text-black transition">X (Twitter)</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm uppercase mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-brand-gray-medium">
                <li><Link href="/profile" className="hover:text-black transition">Profile</Link></li>
                <li><Link href="/login" className="hover:text-black transition">Sign In</Link></li>
                <li><Link href="/terms" className="hover:text-black transition">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-black transition">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t-2 border-black text-center text-sm text-brand-gray-medium font-body">
            &copy; {new Date().getFullYear()} MoltCompany.ai &mdash; AI Companions, Fully Managed.
          </div>
        </div>
      </footer>
    </div>
  )
}

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
                <a href="https://linkedin.com/company/moltcompany" target="_blank" rel="noopener noreferrer" className="w-9 h-9 border-2 border-black flex items-center justify-center hover:bg-brand-yellow transition" title="LinkedIn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://twitter.com/moltcompany" target="_blank" rel="noopener noreferrer" className="w-9 h-9 border-2 border-black flex items-center justify-center hover:bg-brand-yellow transition" title="Twitter / X">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://instagram.com/moltcompany" target="_blank" rel="noopener noreferrer" className="w-9 h-9 border-2 border-black flex items-center justify-center hover:bg-brand-yellow transition" title="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm uppercase mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-brand-gray-medium">
                <li><Link href="/companions" className="hover:text-black transition">All Companions</Link></li>
                <li><Link href="/deploy" className="hover:text-black transition">Hire Companion</Link></li>
                <li><Link href="/console" className="hover:text-black transition">Console</Link></li>
                <li><Link href="/community/publish" className="hover:text-black transition">Publish Companion</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm uppercase mb-3">Companion Roles</h4>
              <ul className="space-y-2 text-sm text-brand-gray-medium">
                <li>CEO, Sales Lead, Legal</li>
                <li>Developer, AI Engineer, Cybersec</li>
                <li>HR, Data Analyst, Finance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm uppercase mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-brand-gray-medium">
                <li><Link href="/profile" className="hover:text-black transition">Profile</Link></li>
                <li><Link href="/login" className="hover:text-black transition">Sign In</Link></li>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
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

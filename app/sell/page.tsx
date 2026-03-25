'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

const BENEFITS = [
  {
    icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="6" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="18"/></svg>',
    title: 'Earn Revenue',
    desc: 'Set your own pricing and earn from every deployment of your AI agent.',
  },
  {
    icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    title: 'Reach Users',
    desc: 'Your agent gets discovered by thousands of users in our marketplace.',
  },
  {
    icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    title: 'No Code Needed',
    desc: 'Build with our character editor. Define personality, tools, and behavior visually.',
  },
  {
    icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    title: 'Secure & Trusted',
    desc: 'End-to-end encrypted infrastructure. Your IP stays protected.',
  },
]

const STEPS = [
  { num: '01', title: 'Create Your Agent', desc: 'Use our visual editor to build your AI agent with custom personality, knowledge, and tools.' },
  { num: '02', title: 'Test & Refine', desc: 'Deploy a test instance and iterate until your agent performs exactly how you want.' },
  { num: '03', title: 'Publish to Marketplace', desc: 'Hit publish and your agent goes live in the community for everyone to discover.' },
  { num: '04', title: 'Earn from Deployments', desc: 'Every time someone deploys your agent, you earn. Simple as that.' },
]

export default function SellPage() {
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden border-b-3 border-black">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
          <div className="inline-block bg-brand-yellow border-3 border-black px-4 py-1 mb-6 shadow-comic-sm">
            <span className="font-display font-black text-sm uppercase">New Opportunity</span>
          </div>
          <h1 className="comic-heading text-4xl md:text-6xl lg:text-7xl mb-6">
            SELL YOUR<br />
            <span className="text-brand-yellow">AI AGENTS</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-gray-medium font-body max-w-2xl mx-auto mb-10">
            Build, publish, and monetize AI agents on our marketplace.
            Reach thousands of users and earn from every deployment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#enlist" className="comic-btn text-lg px-10 py-4 no-underline inline-block">
              ENLIST YOUR AI
            </a>
            <Link href="/community" className="comic-btn-outline text-lg px-10 py-4 no-underline inline-block">
              BROWSE MARKETPLACE
            </Link>
          </div>
        </div>
        {/* Comic dots bg */}
        <div className="absolute inset-0 -z-10 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      </section>

      {/* Why Sell */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="comic-heading text-3xl md:text-4xl mb-3">WHY SELL ON MOLTCOMPANY.AI?</h2>
          <p className="text-brand-gray-medium font-body max-w-xl mx-auto">
            We handle the infrastructure. You focus on building great agents.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((b, i) => (
            <div key={i} className="comic-card p-6 text-center hover:-translate-y-1 transition-transform duration-200">
              <div
                className="w-14 h-14 mx-auto mb-4 border-3 border-black bg-brand-yellow flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: b.icon }}
              />
              <h3 className="font-display font-black text-sm uppercase mb-2">{b.title}</h3>
              <p className="text-sm text-brand-gray-medium font-body">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y-3 border-black bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="comic-heading text-3xl md:text-4xl mb-3">HOW IT WORKS</h2>
            <p className="text-brand-gray-medium font-body">Four steps to start earning from your AI agents.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.num} className="relative">
                <div className="comic-card p-6 h-full">
                  <span className="font-display font-black text-4xl text-brand-yellow">{s.num}</span>
                  <h3 className="font-display font-black text-sm uppercase mt-3 mb-2">{s.title}</h3>
                  <p className="text-sm text-brand-gray-medium font-body">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Can Build */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="comic-heading text-3xl md:text-4xl mb-3">WHAT CAN YOU BUILD?</h2>
          <p className="text-brand-gray-medium font-body max-w-xl mx-auto">
            The possibilities are endless. Here are some ideas to get you started.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { emoji: '&#128188;', title: 'Business Assistants', desc: 'Customer support, sales bots, scheduling agents' },
            { emoji: '&#127912;', title: 'Creative Agents', desc: 'Writing helpers, brainstorming partners, content creators' },
            { emoji: '&#128218;', title: 'Education Tutors', desc: 'Math tutors, language teachers, study companions' },
            { emoji: '&#128187;', title: 'Developer Tools', desc: 'Code reviewers, debugging assistants, DevOps helpers' },
            { emoji: '&#127918;', title: 'Entertainment Bots', desc: 'Game masters, storytellers, trivia hosts' },
            { emoji: '&#128154;', title: 'Health & Wellness', desc: 'Fitness coaches, meditation guides, habit trackers' },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 p-4 border-3 border-black bg-white hover:shadow-comic hover:-translate-y-0.5 transition-all duration-150">
              <span className="text-3xl shrink-0" dangerouslySetInnerHTML={{ __html: item.emoji }} />
              <div>
                <h3 className="font-display font-black text-sm uppercase">{item.title}</h3>
                <p className="text-sm text-brand-gray-medium font-body">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Enlist Your AI - Google Form */}
      <section id="enlist" className="border-y-3 border-black bg-brand-yellow">
        <div className="max-w-3xl mx-auto px-4 py-16 md:py-20">
          <div className="text-center mb-8">
            <h2 className="comic-heading text-3xl md:text-5xl mb-4">ENLIST YOUR AI AGENT</h2>
            <p className="font-body text-lg max-w-xl mx-auto">
              Fill out the form below to submit your AI agent to our marketplace. We&apos;ll review it and get back to you within 24 hours.
            </p>
          </div>
          <div className="comic-card bg-white p-2 md:p-4">
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSc_IrTr886g0pRxKdvIKEkGZYC02RChRkwzVAGa4Gryh_JNkg/viewform?embedded=true"
              width="100%"
              height="900"
              frameBorder={0}
              marginHeight={0}
              marginWidth={0}
              className="w-full min-h-[600px]"
              title="Enlist Your AI Agent"
            >
              Loading form&hellip;
            </iframe>
          </div>
        </div>
      </section>

      {/* Collaboration / Contact Section */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-20">
        <div className="comic-card p-8 md:p-12 text-center border-brand-yellow">
          <div className="inline-block bg-black text-white px-4 py-1 mb-6">
            <span className="font-display font-black text-sm uppercase">Enterprise & Partnerships</span>
          </div>
          <h2 className="comic-heading text-3xl md:text-4xl mb-4">
            GOT SOMETHING CRAZY IN MIND?
          </h2>
          <p className="text-lg text-brand-gray-medium font-body max-w-2xl mx-auto mb-8">
            Want to build a custom AI solution, white-label our platform, or collaborate on something unique?
            Our team loves ambitious ideas. Let&apos;s talk.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto mb-8">
            {/* Email */}
            <a
              href="mailto:company@virelity.com"
              className="flex flex-col items-center gap-2 p-4 border-3 border-black hover:shadow-comic hover:-translate-y-0.5 transition-all duration-150 no-underline text-black"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span className="font-display font-bold text-xs uppercase">Email Us</span>
              <span className="text-xs text-brand-gray-medium font-body">company@virelity.com</span>
            </a>

            {/* Phone */}
            <a
              href="tel:+971502141149"
              className="flex flex-col items-center gap-2 p-4 border-3 border-black hover:shadow-comic hover:-translate-y-0.5 transition-all duration-150 no-underline text-black"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span className="font-display font-bold text-xs uppercase">Call Us</span>
              <span className="text-xs text-brand-gray-medium font-body">+971 50 214 1149</span>
            </a>
          </div>

          <p className="text-sm text-brand-gray-medium font-body">
            We respond within 24 hours. Serious inquiries only.
          </p>
        </div>
      </section>
    </div>
  )
}

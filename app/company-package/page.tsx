import Link from 'next/link'
import Image from 'next/image'
import { bots } from '@/lib/bots'

export default function CompanyPackagePage() {
  const bob = bots.find((b) => b.id === 'bob-ceo')!
  const team = bots.filter((b) => b.id !== 'bob-ceo')

  return (
    <div className="min-h-screen bg-brand-yellow pt-16">

      {/* HERO - Meet Bob */}
      <section className="py-16 px-4 border-b-3 border-black bg-white">
        <div className="max-w-5xl mx-auto">
          <span className="inline-block px-4 py-1 bg-brand-yellow border-3 border-black font-display font-black text-sm uppercase mb-6 shadow-comic-sm">
            THE OFFER
          </span>
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <h1 className="comic-heading text-4xl md:text-5xl lg:text-6xl mb-4 leading-[0.95]">
                GET THE ENTIRE<br />
                <span className="yellow-highlight">COMPANY FOR $300/MO</span>
              </h1>
              <p className="text-lg text-brand-gray-dark font-body mb-6 max-w-lg">
                Why hire one companion at $40/month when you can get all 9 for $300? That&apos;s a full AI department &mdash; CEO, Legal, Sales, Engineering, HR, Finance, and more &mdash; working 24/7 on your Telegram.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'All 9 AI companions on dedicated servers',
                  'Save $60/month vs hiring individually',
                  'One subscription, one support team',
                  'Full department coverage from day one',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 border-2 border-black bg-brand-yellow flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span className="font-body font-medium text-brand-gray-dark">{item}</span>
                  </div>
                ))}
              </div>

              <Link href="/support" className="comic-btn text-lg inline-block">
                CONTACT US TO SET IT UP
              </Link>
            </div>

            {/* Bob showcase */}
            <div className="comic-card p-6 text-center max-w-xs w-full">
              <div className="relative inline-block mb-4">
                <Image
                  src={bob.avatar}
                  alt={bob.characterName}
                  width={120}
                  height={120}
                  className="avatar-comic rounded-full bg-brand-gray"
                />
                <div className="absolute -top-2 -right-2 bg-brand-yellow border-2 border-black px-2 py-0.5 font-display font-black text-xs uppercase rotate-6 shadow-comic-sm">
                  LEADS THE TEAM
                </div>
              </div>
              <h3 className="comic-heading text-3xl">{bob.characterName}</h3>
              <span
                className="inline-block mt-1 px-3 py-0.5 text-xs font-display font-bold uppercase border-2 border-black"
                style={{ backgroundColor: bob.color }}
              >
                {bob.characterRole}
              </span>
              <p className="font-body text-sm text-brand-gray-dark mt-3">{bob.tagline}</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING BANNER */}
      <section className="py-6 px-4 bg-black border-b-3 border-black">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <div className="flex items-baseline gap-3">
            <span className="text-brand-gray-medium font-display text-2xl line-through">$360/mo</span>
            <span className="comic-heading text-5xl text-brand-yellow">$300</span>
            <span className="text-white font-display text-lg">/month</span>
          </div>
          <span className="bg-brand-yellow border-2 border-black px-3 py-1 font-display font-black text-sm uppercase">
            SAVE $60 EVERY MONTH
          </span>
        </div>
      </section>

      {/* TEAM GRID */}
      <section className="py-16 px-4 bg-brand-yellow border-b-3 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="comic-heading text-4xl md:text-5xl mb-2">
              <span className="yellow-highlight bg-black text-white px-4 py-1 inline-block">YOUR FULL TEAM.</span>{' '}
              ALL INCLUDED.
            </h2>
            <p className="text-lg text-black font-body max-w-xl mx-auto mt-4">
              8 specialized AI employees + Bob the CEO. Each runs on a dedicated AWS server, connected to your Telegram.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((bot) => (
              <div key={bot.id} className="comic-card flex flex-col">
                <div className="h-2" style={{ backgroundColor: bot.color }} />
                <div className="p-6 flex flex-col items-center text-center">
                  <Image
                    src={bot.avatar}
                    alt={bot.characterName}
                    width={80}
                    height={80}
                    className="avatar-comic rounded-full bg-brand-gray mb-3"
                  />
                  <h3 className="comic-heading text-2xl">{bot.characterName}</h3>
                  <span
                    className="inline-block mt-1 px-3 py-0.5 text-xs font-display font-bold uppercase border-2 border-black"
                    style={{ backgroundColor: bot.color, color: bot.color === '#FFD600' ? '#000' : '#fff' }}
                  >
                    {bot.characterRole}
                  </span>
                  <div className="w-full mt-4">
                    <div className="border-t-2 border-dashed border-brand-gray-medium" />
                    <p className="font-body text-sm text-brand-gray-dark text-center mt-3">
                      {bot.tagline}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-16 px-4 bg-white border-b-3 border-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="comic-heading text-3xl md:text-4xl text-center mb-10">WHAT&apos;S INCLUDED</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '&#127981;', title: '9 Dedicated Servers', desc: 'Each companion runs on its own isolated AWS EC2 instance. No shared resources.' },
              { icon: '&#128274;', title: 'Full Encryption', desc: 'All API keys and tokens encrypted with AES-256-GCM. Your data stays private.' },
              { icon: '&#128172;', title: 'Telegram Integration', desc: 'All 9 companions connected to your Telegram, ready to respond 24/7.' },
            ].map((item, i) => (
              <div key={i} className="comic-card p-6 text-center">
                <div className="text-4xl mb-4" dangerouslySetInnerHTML={{ __html: item.icon }} />
                <h3 className="font-display font-bold text-sm uppercase mb-2">{item.title}</h3>
                <p className="text-sm text-brand-gray-dark font-body">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SUPPORT CTA */}
      <section className="py-16 px-4 bg-black text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="comic-heading text-4xl md:text-5xl mb-4">
            READY TO HIRE YOUR<br />
            <span className="text-brand-yellow">ENTIRE COMPANY?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8 font-body">
            Contact our support team to get the full company package set up. We&apos;ll have all 9 companions deployed and running on your Telegram within the hour.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a href="mailto:company@virelity.com" className="comic-btn text-lg inline-flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              EMAIL US
            </a>
            <a href="tel:+971566433640" className="comic-btn-outline bg-white text-lg inline-flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              CALL US
            </a>
          </div>

          <p className="text-brand-yellow text-sm font-display font-bold uppercase">
            $300/month &bull; All 9 companions &bull; Cancel anytime
          </p>
        </div>
      </section>
    </div>
  )
}

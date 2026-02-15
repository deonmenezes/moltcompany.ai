import Link from 'next/link'
import Image from 'next/image'
import { BotGrid } from '@/components/BotGrid'
import { TestimonialCard } from '@/components/TestimonialCard'
import { testimonials } from '@/lib/bots'

const useCases = [
  'Customer Support', 'Email Drafting', 'Content Writing',
  'Code Review', 'Data Analysis', 'Task Automation',
  'Translation', 'Scheduling', 'Report Generation', 'Social Media',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white pt-16">

      {/* HERO */}
      <section className="pt-16 pb-20 px-4 border-b-3 border-black">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="comic-heading text-5xl md:text-7xl lg:text-8xl mb-6 leading-[0.95]">
            YOUR OWN<br />
            <span className="yellow-highlight">AI TELEGRAM BOT</span><br />
            IN 60 SECONDS
          </h1>
          <p className="text-xl text-brand-gray-dark mb-8 max-w-2xl mx-auto font-body">
            Pick a bot. Connect Telegram. Deploy. Your AI assistant works 24/7 so you don&apos;t have to.
          </p>
          <Link href="#bots" className="comic-btn text-lg inline-block">
            CHOOSE YOUR BOT
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

      {/* BOT CARDS */}
      <section id="bots" className="comic-section bg-brand-yellow border-b-3 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="comic-heading text-4xl md:text-5xl mb-2">
              <span className="yellow-highlight bg-black text-white px-4 py-1 inline-block">STOP JUGGLING.</span>{' '}
              MEET YOUR TEAM.
            </h2>
            <p className="text-lg text-black font-body max-w-xl mx-auto mt-4">
              Why hire one person when you can have a whole department? Each bot runs on a dedicated AWS server, connected to your Telegram. Always on.
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
              { step: '01', title: 'PICK YOUR BOT', desc: 'Choose the AI role that fits your needs. From CEO to Developer to Finance — we have your team covered.' },
              { step: '02', title: 'CONNECT TELEGRAM', desc: 'Create a bot via @BotFather, paste the token. Takes 30 seconds.' },
              { step: '03', title: 'GO LIVE', desc: "We deploy your bot on a dedicated AWS server. It's live and responding in under a minute." },
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
            While you hesitate, your competitors are deploying AI bots that work while they sleep.
          </p>
          <Link href="#bots" className="comic-btn text-lg inline-block">
            DEPLOY YOUR BOT NOW
          </Link>
          <p className="mt-6 text-brand-yellow text-sm font-display font-bold uppercase">
            All bots $40/month. Cancel anytime. No lock-in.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 bg-white border-t-3 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <span className="font-display font-black text-xl uppercase">OPENCLAW</span>
              <p className="text-sm text-brand-gray-medium mt-2 font-body">AI Telegram bots, fully managed.</p>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm uppercase mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-brand-gray-medium">
                <li><Link href="#bots" className="hover:text-black transition">Bots</Link></li>
                <li><Link href="/deploy" className="hover:text-black transition">Deploy</Link></li>
                <li><Link href="/dashboard" className="hover:text-black transition">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm uppercase mb-3">Bot Roles</h4>
              <ul className="space-y-2 text-sm text-brand-gray-medium">
                <li>CEO, Sales Lead, Legal</li>
                <li>Developer, AI Engineer, Cybersec</li>
                <li>HR, Data Analyst, Finance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm uppercase mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-brand-gray-medium">
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t-2 border-black text-center text-sm text-brand-gray-medium font-body">
            OpenClaw Managed Platform. Powered by coollabsio/openclaw.
          </div>
        </div>
      </footer>
    </div>
  )
}

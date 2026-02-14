import Link from 'next/link'

const useCases = [
  'Read & summarize email',
  'Draft replies',
  'Translate messages',
  'Schedule meetings',
  'Answer support tickets',
  'Generate reports',
  'Code review',
  'Data analysis',
  'Content writing',
  'Task automation',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-dark-border bg-dark-card text-sm text-gray-400">
            Powered by coollabsio/openclaw
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight">
            Deploy OpenClaw<br />under 1 minute
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Avoid all technical complexity and one-click deploy your own 24/7 active OpenClaw instance
          </p>
          <Link
            href="/deploy"
            className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-lg font-semibold hover:opacity-90 transition transform hover:scale-105"
          >
            Get Started
          </Link>
          <p className="mt-6 text-orange-400 text-sm font-medium animate-pulse">
            Limited cloud servers — only 12 left
          </p>
        </div>
      </section>

      {/* Marquee */}
      <section className="py-8 overflow-hidden border-y border-dark-border bg-dark-card/30">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...useCases, ...useCases].map((useCase, i) => (
            <span key={i} className="mx-8 text-gray-500 text-lg">
              {useCase}
              <span className="mx-8 text-dark-border">•</span>
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border">
            <div className="text-3xl mb-4">1</div>
            <h3 className="text-lg font-semibold mb-2">Pick Your Model</h3>
            <p className="text-gray-400 text-sm">Choose between Claude, GPT, or Gemini. Use your own API key — no markup.</p>
          </div>
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border">
            <div className="text-3xl mb-4">2</div>
            <h3 className="text-lg font-semibold mb-2">Connect Telegram</h3>
            <p className="text-gray-400 text-sm">Create a bot via @BotFather and paste the token. That's it.</p>
          </div>
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border">
            <div className="text-3xl mb-4">3</div>
            <h3 className="text-lg font-semibold mb-2">Deploy & Go</h3>
            <p className="text-gray-400 text-sm">We handle servers, Docker, and uptime. Your bot goes live in seconds.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
          <div className="p-8 rounded-2xl bg-dark-card border border-dark-border">
            <div className="text-5xl font-bold mb-2">
              $25<span className="text-lg text-gray-400 font-normal">/mo</span>
            </div>
            <p className="text-gray-400 mb-6">Fully managed AWS instance</p>
            <ul className="text-left space-y-3 text-sm text-gray-300 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-accent-blue">&#10003;</span> Dedicated t3.medium server
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-blue">&#10003;</span> 24/7 uptime with auto-restart
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-blue">&#10003;</span> Full OpenClaw Control UI access
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-blue">&#10003;</span> Telegram bot integration
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-blue">&#10003;</span> Your own API keys — no AI markup
              </li>
            </ul>
            <Link
              href="/deploy"
              className="block w-full py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple font-semibold hover:opacity-90 transition text-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-dark-border text-center text-sm text-gray-600">
        OpenClaw Managed Platform
      </footer>
    </div>
  )
}

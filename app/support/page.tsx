import Link from 'next/link'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-sm text-brand-gray-medium mb-6 font-display">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-black font-bold">Support</span>
        </div>

        <h1 className="comic-heading text-3xl md:text-4xl mb-8">CUSTOMER SUPPORT</h1>

        {/* Contact cards */}
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          <a href="mailto:company@virelity.com" className="comic-card p-6 hover:shadow-comic transition-shadow group">
            <div className="w-12 h-12 border-3 border-black bg-brand-yellow flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            <h3 className="font-display font-bold text-lg uppercase mb-1">Email Us</h3>
            <p className="text-brand-yellow font-display font-bold">company@virelity.com</p>
            <p className="text-xs text-brand-gray-medium mt-2">We typically respond within 24 hours</p>
          </a>

          <a href="tel:+971566433640" className="comic-card p-6 hover:shadow-comic transition-shadow group">
            <div className="w-12 h-12 border-3 border-black bg-brand-yellow flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <h3 className="font-display font-bold text-lg uppercase mb-1">Call Us</h3>
            <p className="text-brand-yellow font-display font-bold">+971 56 643 3640</p>
            <p className="text-xs text-brand-gray-medium mt-2">Available Sunday - Thursday, 9AM - 6PM GST</p>
          </a>

          <a href="https://x.com/ai_socialdao" target="_blank" rel="noopener noreferrer" className="comic-card p-6 hover:shadow-comic transition-shadow group">
            <div className="w-12 h-12 border-3 border-black bg-brand-yellow flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </div>
            <h3 className="font-display font-bold text-lg uppercase mb-1">X (Twitter)</h3>
            <p className="text-brand-yellow font-display font-bold">@ai_socialdao</p>
            <p className="text-xs text-brand-gray-medium mt-2">DM us for quick questions</p>
          </a>

          <a href="https://www.linkedin.com/company/111713673" target="_blank" rel="noopener noreferrer" className="comic-card p-6 hover:shadow-comic transition-shadow group">
            <div className="w-12 h-12 border-3 border-black bg-brand-yellow flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </div>
            <h3 className="font-display font-bold text-lg uppercase mb-1">LinkedIn</h3>
            <p className="text-brand-yellow font-display font-bold">MoltCompany</p>
            <p className="text-xs text-brand-gray-medium mt-2">Connect with us professionally</p>
          </a>
        </div>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="comic-heading text-2xl mb-6">FREQUENTLY ASKED QUESTIONS</h2>

          <div className="space-y-4">
            <div className="comic-card p-5">
              <h3 className="font-display font-bold text-sm uppercase mb-2">How do I deploy my first companion?</h3>
              <p className="text-sm text-brand-gray-dark font-body">
                Go to <Link href="/companions" className="text-brand-yellow font-bold hover:underline">Explore</Link>, pick a companion, click &quot;Hire&quot;, configure your model provider and API keys, then complete the checkout. Your companion will be live in about 5 minutes.
              </p>
            </div>

            <div className="comic-card p-5">
              <h3 className="font-display font-bold text-sm uppercase mb-2">How do I update my LLM API key?</h3>
              <p className="text-sm text-brand-gray-dark font-body">
                Go to your <Link href="/console" className="text-brand-yellow font-bold hover:underline">Console</Link> and click &quot;UPDATE KEY&quot; on your companion card. Enter your new API key and it will redeploy with the new key automatically.
              </p>
            </div>

            <div className="comic-card p-5">
              <h3 className="font-display font-bold text-sm uppercase mb-2">How do I cancel my subscription?</h3>
              <p className="text-sm text-brand-gray-dark font-body">
                In your <Link href="/console" className="text-brand-yellow font-bold hover:underline">Console</Link>, click &quot;CANCEL SUBSCRIPTION&quot; on the companion card. This will cancel your Stripe billing and terminate the instance. You can also manage billing directly through the Stripe portal.
              </p>
            </div>

            <div className="comic-card p-5">
              <h3 className="font-display font-bold text-sm uppercase mb-2">What model providers are supported?</h3>
              <p className="text-sm text-brand-gray-dark font-body">
                We support Anthropic (Claude), OpenAI (GPT), Google (Gemini), Kimi (Moonshot), and MiniMax. You bring your own API key from your chosen provider.
              </p>
            </div>

            <div className="comic-card p-5">
              <h3 className="font-display font-bold text-sm uppercase mb-2">What happens if my instance goes down?</h3>
              <p className="text-sm text-brand-gray-dark font-body">
                Your companion runs on a dedicated AWS EC2 instance with automatic Docker restart policies. If the container crashes, it restarts automatically. If the entire instance has issues, contact us and we&apos;ll help resolve it.
              </p>
            </div>

            <div className="comic-card p-5">
              <h3 className="font-display font-bold text-sm uppercase mb-2">Can I create my own custom companion?</h3>
              <p className="text-sm text-brand-gray-dark font-body">
                Yes! Go to <Link href="/create" className="text-brand-yellow font-bold hover:underline">Create</Link> to publish your own AI companion to the community marketplace. You can customize the personality, role, and character files.
              </p>
            </div>

            <div className="comic-card p-5">
              <h3 className="font-display font-bold text-sm uppercase mb-2">How much does it cost?</h3>
              <p className="text-sm text-brand-gray-dark font-body">
                Each managed companion costs $40/month, which covers the dedicated AWS infrastructure (EC2 instance, storage, bandwidth). You also need your own LLM API key from your preferred provider.
              </p>
            </div>
          </div>
        </section>

        {/* Legal links */}
        <div className="comic-card p-6 text-center">
          <p className="text-sm text-brand-gray-medium font-body">
            By using MoltCompany.ai, you agree to our{' '}
            <Link href="/terms" className="text-brand-yellow font-bold hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-brand-yellow font-bold hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}

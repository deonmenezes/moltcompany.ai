import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-sm text-brand-gray-medium mb-6 font-display">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-black font-bold">Terms of Service</span>
        </div>

        <h1 className="comic-heading text-4xl mb-8">TERMS OF SERVICE</h1>

        <div className="prose prose-sm max-w-none font-body text-brand-gray-dark space-y-6">
          <p className="text-sm text-brand-gray-medium">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <section>
            <h2 className="comic-heading text-xl mb-3">1. ACCEPTANCE OF TERMS</h2>
            <p>By accessing and using MoltCompany.ai (&quot;the Service&quot;), you accept and agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="comic-heading text-xl mb-3">2. DESCRIPTION OF SERVICE</h2>
            <p>MoltCompany.ai provides managed AI companion deployment services. We deploy AI assistants on dedicated AWS infrastructure connected to your Telegram account. Each companion runs on its own server and is exclusively accessible to the account holder who purchased it.</p>
          </section>

          <section>
            <h2 className="comic-heading text-xl mb-3">3. USER ACCOUNTS</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information during registration. Each deployed instance is exclusively accessible to the account holder who purchased it.</p>
          </section>

          <section>
            <h2 className="comic-heading text-xl mb-3">4. PAYMENT &amp; BILLING</h2>
            <p>Companion subscriptions are billed monthly at the rate displayed at time of purchase. You may cancel your subscription at any time. Upon cancellation, your AI companion instance will be terminated at the end of the billing period.</p>
          </section>

          <section>
            <h2 className="comic-heading text-xl mb-3">5. ACCEPTABLE USE</h2>
            <p>You agree not to use the Service for any unlawful purpose, to send spam or unsolicited messages, to impersonate others, or to engage in any activity that disrupts the Service. We reserve the right to terminate accounts that violate these terms.</p>
          </section>

          <section>
            <h2 className="comic-heading text-xl mb-3">6. API KEYS &amp; THIRD-PARTY SERVICES</h2>
            <p>You are responsible for any API keys you provide (e.g., OpenAI, Anthropic, Google). We encrypt and store these keys securely but are not liable for charges incurred on your third-party accounts through your AI companion&apos;s usage.</p>
          </section>

          <section>
            <h2 className="comic-heading text-xl mb-3">7. COMMUNITY COMPANIONS</h2>
            <p>Community-created companions are provided as-is. MoltCompany.ai does not guarantee the quality, safety, or accuracy of community-created content. Users who publish companions are responsible for their content.</p>
          </section>

          <section>
            <h2 className="comic-heading text-xl mb-3">8. LIMITATION OF LIABILITY</h2>
            <p>The Service is provided &quot;as is&quot; without warranties of any kind. MoltCompany.ai shall not be liable for any indirect, incidental, or consequential damages arising from use of the Service.</p>
          </section>

          <section>
            <h2 className="comic-heading text-xl mb-3">9. CONTACT</h2>
            <p>For questions about these terms, contact us at <a href="mailto:company@virelity.com" className="text-black font-bold hover:underline">company@virelity.com</a> or call <a href="tel:+971566433640" className="text-black font-bold hover:underline">+971 56 643 3640</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-sm text-brand-gray-medium mb-6 font-display">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-black font-bold">Privacy Policy</span>
        </div>

        <h1 className="comic-heading text-4xl mb-8">PRIVACY POLICY</h1>

        <div className="prose prose-sm max-w-none font-body text-brand-gray-dark space-y-6">
          <p className="text-sm text-brand-gray-medium">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <section>
            <h2 className="comic-heading text-xl mb-3">1. INFORMATION WE COLLECT</h2>
            <p>We collect the following information when you use MoltCompany.ai:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Account information:</strong> Email address, name, and phone number (if using phone auth)</li>
              <li><strong>Payment information:</strong> Processed securely via Stripe. We do not store your card details.</li>
              <li><strong>API keys:</strong> LLM provider API keys you provide are encrypted using AES-256-GCM before storage.</li>
              <li><strong>Telegram bot tokens:</strong> Encrypted and stored securely for deployment purposes.</li>
              <li><strong>Usage data:</strong> Instance status, deployment metadata, and community activity.</li>
            </ul>
          </section>

          <section>
            <h2 className="comic-heading text-xl mb-3">2. HOW WE USE YOUR DATA</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provision and manage your AI companion instances on AWS</li>
              <li>To process payments via Stripe</li>
              <li>To authenticate your account</li>
              <li>To display your community profile and published companions</li>
              <li>To communicate service updates</li>
            </ul>
          </section>

          <section>
            <h2 className="comic-heading text-xl mb-3">3. DATA SECURITY</h2>
            <p>We take security seriously:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Sensitive credentials (API keys, bot tokens) are encrypted with AES-256-GCM</li>
              <li>Each instance is isolated on its own dedicated AWS server</li>
              <li>Instances are exclusively accessible to the purchasing account holder</li>
              <li>We use Supabase Row Level Security for database access control</li>
              <li>All API endpoints require authentication</li>
              <li>Stripe webhook signatures are verified</li>
            </ul>
          </section>

          <section>
            <h2 className="comic-heading text-xl mb-3">4. INSTANCE ISOLATION</h2>
            <p>Each AI companion runs on a dedicated AWS EC2 instance. Your instance is exclusively accessible to your account. No other users can access, view, or control your deployed companion. When you terminate an instance, all associated data is permanently deleted.</p>
          </section>

          <section>
            <h2 className="comic-heading text-xl mb-3">5. THIRD-PARTY SERVICES</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Supabase:</strong> Authentication and database</li>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>AWS:</strong> Instance hosting</li>
              <li><strong>Google OAuth:</strong> Social sign-in</li>
            </ul>
          </section>

          <section>
            <h2 className="comic-heading text-xl mb-3">6. DATA RETENTION</h2>
            <p>Account data is retained while your account is active. Upon account deletion, your data will be removed within 30 days. Terminated instances are deleted immediately from AWS.</p>
          </section>

          <section>
            <h2 className="comic-heading text-xl mb-3">7. YOUR RIGHTS</h2>
            <p>You have the right to access, correct, or delete your personal data. Contact us to exercise these rights.</p>
          </section>

          <section>
            <h2 className="comic-heading text-xl mb-3">8. CONTACT</h2>
            <p>For privacy inquiries, contact us at <a href="mailto:company@virelity.com" className="text-black font-bold hover:underline">company@virelity.com</a> or call <a href="tel:+971566433640" className="text-black font-bold hover:underline">+971 56 643 3640</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}

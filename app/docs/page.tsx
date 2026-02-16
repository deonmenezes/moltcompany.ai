import Link from 'next/link'

const tutorials = [
  {
    id: 'hire-companion',
    title: 'HOW TO HIRE A COMPANION',
    desc: 'Deploy a verified AI employee to your Telegram in under 5 minutes.',
    steps: [
      {
        heading: 'Sign in to your account',
        text: 'Go to the Sign In page and log in with your Google account. If you don\'t have an account yet, one will be created automatically when you sign in for the first time.',
      },
      {
        heading: 'Browse available companions',
        text: 'Head to the Explore page to see all available AI companions. You can filter by category — Leadership, Engineering, or Operations — to find the right fit. Each card shows the companion\'s name, role, tagline, and monthly price ($40/month per companion).',
      },
      {
        heading: 'Click "Hire" on the companion you want',
        text: 'This takes you to the deployment wizard. If you already know which companion you want, you can go directly to the Hire page.',
      },
      {
        heading: 'Choose your AI model provider',
        text: 'Select which LLM will power your companion. We support Anthropic (Claude), OpenAI (GPT), Google (Gemini), Moonshot AI (Kimi), and MiniMax. You\'ll need your own API key from your chosen provider. Paste it into the API key field — it\'s encrypted with AES-256-GCM before being stored.',
      },
      {
        heading: 'Connect your Telegram bot',
        text: 'Open Telegram and message @BotFather. Send /newbot, follow the prompts to name your bot, and copy the bot token it gives you. Paste that token into the Telegram field in the deployment wizard.',
      },
      {
        heading: 'Customize the personality (optional)',
        text: 'Each companion comes with pre-written character files (SOUL, IDENTITY, AGENTS, TOOLS, USER, HEARTBEAT, BOOTSTRAP). You can edit these to tweak the personality, or just skip this step to use the defaults.',
      },
      {
        heading: 'Review and deploy',
        text: 'Check your settings on the review screen, then click "Hire". You\'ll be redirected to Stripe to complete payment ($40/month). Once payment succeeds, your companion is deployed on a dedicated AWS EC2 instance and will be live on your Telegram within a few minutes.',
      },
    ],
  },
  {
    id: 'create-companion',
    title: 'HOW TO CREATE YOUR OWN COMPANION',
    desc: 'Build a custom AI companion from scratch and publish it to the community marketplace.',
    steps: [
      {
        heading: 'Go to the Create page',
        text: 'Click "+ Create" in the navigation bar. You need to be signed in with a Google account.',
      },
      {
        heading: 'Set up the basics',
        text: 'Give your companion a name (e.g. "LUNA"), a role/title (e.g. "Marketing Guru"), and a short description of what it does. Pick an accent color and optionally paste a direct image URL for the avatar. Choose a category (Productivity, Creative, Business, Developer, etc.) and add up to 5 tags to help people discover it.',
      },
      {
        heading: 'Define the personality',
        text: 'Use the character file editor to write your companion\'s personality. There are 7 tabs:\n\n- SOUL — Core personality, values, and communication style\n- IDENTITY — Name, role, tone, and public persona\n- USER — How the companion should interact with users\n- AGENTS — Rules for delegating tasks to other bots\n- TOOLS — Available integrations and capabilities\n- HEARTBEAT — Scheduled recurring tasks\n- BOOTSTRAP — Startup initialization instructions\n\nYou can also upload a .md file directly into the SOUL tab. If you\'re not sure what to write, leave the defaults and come back later.',
      },
      {
        heading: 'Configure tools',
        text: 'Toggle capabilities on/off: Web Browsing (fetch information from the internet), Telegram Reactions (react with emojis), and Telegram Stickers (send stickers). You can also add custom instructions for how the companion should use these tools.',
      },
      {
        heading: 'Review and publish',
        text: 'Check everything on the review screen. When ready, click "Publish to Community". Your companion will appear in the Community section of the Explore page. You can publish up to 3 companions per account.',
      },
    ],
  },
  {
    id: 'publish-community',
    title: 'HOW TO PUBLISH TO THE COMMUNITY (QUICK METHOD)',
    desc: 'A faster way to share a companion using the legacy publish form.',
    steps: [
      {
        heading: 'Go to Community > Publish',
        text: 'Navigate to the Community Publish page. You need a verified account to publish.',
      },
      {
        heading: 'Add your companion\'s details',
        text: 'Fill in the icon URL (optional), companion name, and a short description.',
      },
      {
        heading: 'Upload or write a character file',
        text: 'You can upload a .md or .txt file, or paste your character definition directly into the text area. The format uses sections like # SOUL, # IDENTITY, # USER to define different aspects of the personality. Max 10,000 characters.',
      },
      {
        heading: 'Hit Publish',
        text: 'Click "Publish Companion" and your bot appears in the Community section of the Explore page. Other users can view it, upvote/downvote it, and deploy it.',
      },
    ],
  },
  {
    id: 'manage-companion',
    title: 'HOW TO MANAGE YOUR DEPLOYED COMPANIONS',
    desc: 'Monitor, update, restart, and cancel your running companions from the Console.',
    steps: [
      {
        heading: 'Open the Console',
        text: 'Sign in and click "Console" in the navigation. This is your dashboard showing all deployed companions.',
      },
      {
        heading: 'Check companion status',
        text: 'Each companion card shows its current status: Running (green), Deploying (yellow), Stopped (gray), or Failed (red). You can also see the AI model, AWS region, public IP, and when it was created.',
      },
      {
        heading: 'Open the Control UI',
        text: 'Click "Open UI" on any running companion to access its OpenClaw control panel. This lets you interact with the bot directly, view logs, and configure advanced settings.',
      },
      {
        heading: 'Update your API key',
        text: 'If you need to rotate your LLM API key, click "Update Key" on the companion card. Enter the new key and the companion will automatically redeploy with the updated credentials.',
      },
      {
        heading: 'Restart a stopped companion',
        text: 'If a companion stops or fails, use the "Restart" button. This reboots the EC2 instance and restarts the Docker container.',
      },
      {
        heading: 'Cancel your subscription',
        text: 'Click "Cancel Subscription" on any companion card. This cancels your Stripe billing and terminates the AWS instance. The companion will stop responding immediately.',
      },
    ],
  },
  {
    id: 'telegram-setup',
    title: 'HOW TO SET UP A TELEGRAM BOT',
    desc: 'Step-by-step guide to creating a Telegram bot token via @BotFather.',
    steps: [
      {
        heading: 'Open Telegram',
        text: 'Open the Telegram app on your phone or desktop. If you don\'t have Telegram, download it from telegram.org.',
      },
      {
        heading: 'Find @BotFather',
        text: 'In the Telegram search bar, type "@BotFather" and tap the verified result (it has a blue checkmark). This is Telegram\'s official bot for creating and managing bots.',
      },
      {
        heading: 'Create a new bot',
        text: 'Send the command /newbot to BotFather. It will ask you two things:\n\n1. A display name for your bot (e.g. "My Sales Assistant")\n2. A username that ends in "bot" (e.g. "my_sales_assistant_bot")\n\nThe username must be unique across all of Telegram.',
      },
      {
        heading: 'Copy the bot token',
        text: 'After creating the bot, BotFather sends you a message with your bot token. It looks something like: 7123456789:AAF1xxxxxxxxxxxxxxxxxxxxxxxxxxx. Copy this entire token — you\'ll paste it into MoltCompany.ai during the deployment wizard.',
      },
      {
        heading: 'Keep your token safe',
        text: 'Your bot token is like a password. Don\'t share it publicly. If it gets compromised, go back to @BotFather and use /revoke to generate a new one, then update the key in your MoltCompany.ai Console.',
      },
    ],
  },
  {
    id: 'api-keys',
    title: 'HOW TO GET YOUR LLM API KEY',
    desc: 'Where to get API keys for each supported AI model provider.',
    steps: [
      {
        heading: 'Anthropic (Claude)',
        text: 'Go to console.anthropic.com/settings/keys. Sign up or log in, then click "Create Key". Copy the key (starts with sk-ant-api03-). Anthropic offers Claude Opus 4.5 and Claude Sonnet 4.',
      },
      {
        heading: 'OpenAI (GPT)',
        text: 'Go to platform.openai.com/api-keys. Sign up or log in, then click "Create new secret key". Copy the key (starts with sk-). OpenAI offers GPT-5.2 and GPT-4.1.',
      },
      {
        heading: 'Google (Gemini)',
        text: 'Go to aistudio.google.com/apikey. Sign in with your Google account and click "Create API Key". Copy the key (starts with AIza). Google offers Gemini 3 Flash and Gemini 2.5 Pro.',
      },
      {
        heading: 'Moonshot AI (Kimi)',
        text: 'Go to platform.moonshot.cn/console/api-keys. Create an account and generate a new key. Copy it (starts with sk-). Moonshot offers Kimi K2.5.',
      },
      {
        heading: 'MiniMax',
        text: 'Go to platform.minimaxi.com/user-center/basic-information/interface-key. Create an account and generate a key (starts with eyJ). MiniMax offers MiniMax M2.1.',
      },
      {
        heading: 'Important notes',
        text: 'All API keys are encrypted with AES-256-GCM before being stored. Your key is never sent to MoltCompany.ai servers in plain text — it goes directly to the encrypted storage on your companion\'s dedicated EC2 instance. Usage costs for the LLM are billed by the provider (Anthropic, OpenAI, etc.) separately from the $40/month MoltCompany.ai hosting fee.',
      },
    ],
  },
  {
    id: 'company-package',
    title: 'HOW TO GET THE FULL COMPANY PACKAGE',
    desc: 'Hire all 9 AI employees at once for $300/month (save $60).',
    steps: [
      {
        heading: 'Visit the Company Package page',
        text: 'Click "Offer" in the navigation bar, or go directly to the Company Package page. This shows all 9 AI companions included in the deal.',
      },
      {
        heading: 'Review what\'s included',
        text: 'The package includes: Bob (CEO), Specter (Legal Advisor), Caroline (Sales Lead), Harsh (Developer), Sean (AI Engineer), Christopher (Cybersec/Pentester), Amy (HR Specialist), Xavier (Data Analyst), and Walter (Finance). Each runs on its own dedicated AWS server.',
      },
      {
        heading: 'Contact our support team',
        text: 'The company package is set up manually by our team to ensure everything works perfectly. Reach out via:\n\n- Email: company@virelity.com\n- Phone: +971 56 643 3640\n\nWe\'ll have all 9 companions deployed and running on your Telegram within the hour.',
      },
      {
        heading: 'Provide your details',
        text: 'You\'ll need to have ready: your LLM API key (one key works for all 9 companions), and 9 Telegram bot tokens (one per companion). Our team will walk you through creating the bots if needed.',
      },
    ],
  },
  {
    id: 'sell-companion',
    title: 'HOW TO SELL YOUR AI AGENT',
    desc: 'List your custom AI agent on our marketplace and earn money.',
    steps: [
      {
        heading: 'Build your agent first',
        text: 'Before selling, create a high-quality AI companion using the Create page. Give it a clear purpose, well-written character files, and thorough testing.',
      },
      {
        heading: 'Go to the Sell page',
        text: 'Click "Sell" in the navigation bar. This page explains the marketplace opportunity and how to list your agent.',
      },
      {
        heading: 'Contact us to list your agent',
        text: 'Currently, marketplace listings are curated by our team. Reach out via the Sell page contact section to discuss listing your agent. We review submissions for quality and market fit.',
      },
      {
        heading: 'Set your pricing',
        text: 'Work with our team to set appropriate pricing for your agent. You earn revenue each time someone deploys your companion through the marketplace.',
      },
    ],
  },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="text-sm text-brand-gray-medium mb-6 font-display">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-black font-bold">Docs</span>
        </div>

        {/* Header */}
        <h1 className="comic-heading text-3xl md:text-4xl mb-2">DOCUMENTATION & TUTORIALS</h1>
        <p className="text-brand-gray-dark font-body mb-10 max-w-2xl">
          Everything you need to know about hiring, creating, managing, and selling AI companions on MoltCompany.ai.
        </p>

        {/* Table of Contents */}
        <nav className="comic-card p-6 mb-12">
          <h2 className="font-display font-bold text-sm uppercase mb-4">QUICK NAVIGATION</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {tutorials.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className="flex items-start gap-2 p-2 hover:bg-brand-yellow/20 transition rounded text-sm"
              >
                <span className="text-brand-yellow font-bold mt-0.5">&#9654;</span>
                <div>
                  <span className="font-display font-bold text-xs uppercase">{t.title}</span>
                  <p className="text-[11px] text-brand-gray-medium mt-0.5">{t.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </nav>

        {/* Tutorials */}
        <div className="space-y-16">
          {tutorials.map((tutorial) => (
            <section key={tutorial.id} id={tutorial.id} className="scroll-mt-24">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 bg-brand-yellow border-3 border-black flex items-center justify-center flex-shrink-0 shadow-comic-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                </div>
                <div>
                  <h2 className="comic-heading text-2xl">{tutorial.title}</h2>
                  <p className="text-sm text-brand-gray-medium font-body">{tutorial.desc}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4 ml-0 sm:ml-13">
                {tutorial.steps.map((step, i) => (
                  <div key={i} className="comic-card p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-black text-white flex items-center justify-center flex-shrink-0 font-display font-black text-xs">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-sm uppercase mb-2">{step.heading}</h3>
                        <div className="text-sm text-brand-gray-dark font-body whitespace-pre-line">
                          {step.text}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Still need help */}
        <div className="mt-16 comic-card p-8 text-center bg-brand-yellow/10">
          <h2 className="comic-heading text-2xl mb-3">STILL HAVE QUESTIONS?</h2>
          <p className="text-sm text-brand-gray-dark font-body mb-6 max-w-md mx-auto">
            Our support team is available 24/7 to help you get started, troubleshoot issues, or answer any questions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/support" className="comic-btn text-sm inline-block">
              CONTACT SUPPORT
            </Link>
            <a href="mailto:company@virelity.com" className="comic-btn-outline text-sm inline-block">
              EMAIL US
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

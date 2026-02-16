import Link from 'next/link'

const tutorials = [
  {
    id: 'hire-openclaw-bot',
    title: 'How to Hire an OpenClaw Bot',
    description: 'Learn how to deploy and set up your first OpenClaw AI companion on Telegram.',
    video: '/avatars/0216.mp4',
  },
]

export default function TutorialsPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-sm text-brand-gray-medium mb-6 font-display">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-black font-bold">Tutorials</span>
        </div>

        <h1 className="comic-heading text-4xl mb-2">TUTORIALS</h1>
        <p className="text-brand-gray-medium mb-10">Video guides to help you get started with OpenClaw</p>

        <div className="space-y-10">
          {tutorials.map((t) => (
            <div key={t.id} className="comic-card p-0 overflow-hidden">
              <video
                controls
                preload="metadata"
                className="w-full aspect-video bg-black"
                poster=""
              >
                <source src={t.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="p-6">
                <h2 className="comic-heading text-2xl mb-2">{t.title}</h2>
                <p className="text-brand-gray-medium">{t.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

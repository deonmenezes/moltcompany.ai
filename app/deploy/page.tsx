'use client'

import { useAuth } from '@/components/AuthProvider'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { ModelSelector, models } from '@/components/ModelSelector'
import { ChannelSelector } from '@/components/ChannelSelector'
import { TelegramConnect } from '@/components/TelegramConnect'
import { ApiKeyInput } from '@/components/ApiKeyInput'
import { DeployButton } from '@/components/DeployButton'

function AvatarFallback({ name, size }: { name: string; size: number }) {
  return (
    <div
      className="rounded-full avatar-comic bg-brand-gray flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <span className="font-display font-black text-2xl text-black">{name.charAt(0)}</span>
    </div>
  )
}

function DeployForm() {
  const { user, session, loading, signInWithGoogle } = useAuth()
  const searchParams = useSearchParams()
  const modelParam = searchParams.get('model')

  const initialModel = models.find(m => m.id === modelParam) || models[0]
  const [selectedModel, setSelectedModel] = useState(initialModel)
  const [avatarError, setAvatarError] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState('telegram')
  const [telegramToken, setTelegramToken] = useState('')
  const [apiKey, setApiKey] = useState('')

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-16">
        <div className="animate-spin h-8 w-8 border-3 border-brand-yellow border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-16">
        <div className="text-center">
          <h2 className="comic-heading text-3xl mb-4">SIGN IN TO DEPLOY</h2>
          <p className="text-brand-gray-medium mb-6">You need a Google account to get started</p>
          <button
            onClick={() => signInWithGoogle()}
            className="comic-btn"
          >
            SIGN IN WITH GOOGLE
          </button>
        </div>
      </div>
    )
  }

  const isReady = telegramToken && apiKey && selectedModel && selectedChannel === 'telegram'

  const handleDeploy = async () => {
    const res = await fetch('/api/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        model_provider: selectedModel.provider,
        model_name: selectedModel.name,
        channel: selectedChannel,
        telegram_bot_token: telegramToken,
        llm_api_key: apiKey,
      }),
    })

    const data = await res.json()

    if (data.redirect) {
      window.location.href = data.redirect
    } else if (data.url) {
      window.location.href = data.url
    } else {
      alert(data.error || 'Something went wrong')
    }
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header with selected bot */}
        <div className="mb-10 flex items-center gap-4">
          {avatarError ? (
            <AvatarFallback name={selectedModel.characterName} size={64} />
          ) : (
            <Image
              src={selectedModel.avatar}
              alt={selectedModel.characterName}
              width={64}
              height={64}
              className="rounded-full avatar-comic"
              onError={() => setAvatarError(true)}
            />
          )}
          <div>
            <h1 className="comic-heading text-3xl">DEPLOY {selectedModel.characterName}</h1>
            <p className="text-sm font-display font-bold text-brand-gray-medium uppercase">{selectedModel.characterRole} &middot; {selectedModel.label}</p>
          </div>
        </div>

        {/* User info */}
        <div className="mb-8 flex items-center gap-3 p-3 border-3 border-black bg-brand-gray inline-flex">
          {user.user_metadata?.avatar_url && (
            <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full border-2 border-black" />
          )}
          <div>
            <div className="text-sm text-black font-bold">{user.user_metadata?.full_name || user.email}</div>
            <div className="text-xs text-brand-gray-medium">{user.email}</div>
          </div>
        </div>

        {/* Step 1: Model */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-brand-yellow border-3 border-black flex items-center justify-center font-display font-black text-sm">1</div>
            <h2 className="comic-heading text-xl">Choose your AI model</h2>
          </div>
          <ModelSelector selected={selectedModel.id} onSelect={(m) => { setSelectedModel(m); setAvatarError(false) }} />
        </section>

        {/* Step 2: Channel */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-brand-yellow border-3 border-black flex items-center justify-center font-display font-black text-sm">2</div>
            <h2 className="comic-heading text-xl">Select messaging channel</h2>
          </div>
          <ChannelSelector selected={selectedChannel} onSelect={setSelectedChannel} />
        </section>

        {/* Step 3: Telegram */}
        {selectedChannel === 'telegram' && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-brand-yellow border-3 border-black flex items-center justify-center font-display font-black text-sm">3</div>
              <h2 className="comic-heading text-xl">Connect Telegram</h2>
            </div>
            <TelegramConnect token={telegramToken} onSave={setTelegramToken} />
          </section>
        )}

        {/* Step 4: API Key */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-brand-yellow border-3 border-black flex items-center justify-center font-display font-black text-sm">4</div>
            <h2 className="comic-heading text-xl">Enter LLM API Key</h2>
          </div>
          <ApiKeyInput provider={selectedModel.provider} apiKey={apiKey} onSave={setApiKey} />
        </section>

        {/* Step 5: Deploy */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-brand-yellow border-3 border-black flex items-center justify-center font-display font-black text-sm">5</div>
            <h2 className="comic-heading text-xl">Deploy</h2>
          </div>
          {!isReady && (
            <p className="text-sm text-brand-gray-medium mb-4">Complete all steps above to enable deployment</p>
          )}
          <DeployButton disabled={!isReady} onDeploy={handleDeploy} botName={selectedModel.characterName} />
        </section>
      </div>
    </div>
  )
}

export default function DeployPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center pt-16">
        <div className="animate-spin h-8 w-8 border-3 border-brand-yellow border-t-transparent rounded-full" />
      </div>
    }>
      <DeployForm />
    </Suspense>
  )
}

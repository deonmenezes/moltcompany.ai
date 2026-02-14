'use client'

import { useAuth } from '@/components/AuthProvider'
import { useState } from 'react'
import { ModelSelector, models } from '@/components/ModelSelector'
import { ChannelSelector } from '@/components/ChannelSelector'
import { TelegramConnect } from '@/components/TelegramConnect'
import { ApiKeyInput } from '@/components/ApiKeyInput'
import { DeployButton } from '@/components/DeployButton'

export default function DeployPage() {
  const { user, session, loading, signInWithGoogle } = useAuth()
  const [selectedModel, setSelectedModel] = useState(models[0])
  const [selectedChannel, setSelectedChannel] = useState('telegram')
  const [telegramToken, setTelegramToken] = useState('')
  const [apiKey, setApiKey] = useState('')

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center pt-16">
        <div className="animate-spin h-8 w-8 border-2 border-accent-blue border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Sign in to deploy</h2>
          <p className="text-gray-400 mb-6">You need a Google account to get started</p>
          <button
            onClick={() => signInWithGoogle()}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple font-semibold hover:opacity-90 transition"
          >
            Sign in with Google
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
    <div className="min-h-screen bg-dark-bg pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Deploy your OpenClaw instance</h1>
          <p className="text-gray-400">Configure and launch in under a minute</p>
        </div>

        <div className="mb-8 flex items-center gap-3 p-3 rounded-lg bg-dark-card border border-dark-border inline-flex">
          {user.user_metadata?.avatar_url && (
            <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full" />
          )}
          <div>
            <div className="text-sm text-white">{user.user_metadata?.full_name || user.email}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        </div>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center text-sm font-bold">1</div>
            <h2 className="text-xl font-semibold">Choose your AI model</h2>
          </div>
          <ModelSelector selected={selectedModel.id} onSelect={setSelectedModel} />
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center text-sm font-bold">2</div>
            <h2 className="text-xl font-semibold">Select messaging channel</h2>
          </div>
          <ChannelSelector selected={selectedChannel} onSelect={setSelectedChannel} />
        </section>

        {selectedChannel === 'telegram' && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center text-sm font-bold">3</div>
              <h2 className="text-xl font-semibold">Connect Telegram</h2>
            </div>
            <TelegramConnect token={telegramToken} onSave={setTelegramToken} />
          </section>
        )}

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center text-sm font-bold">4</div>
            <h2 className="text-xl font-semibold">Enter LLM API Key</h2>
          </div>
          <ApiKeyInput provider={selectedModel.provider} apiKey={apiKey} onSave={setApiKey} />
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center text-sm font-bold">5</div>
            <h2 className="text-xl font-semibold">Deploy</h2>
          </div>
          {!isReady && (
            <p className="text-sm text-gray-500 mb-4">Complete all steps above to enable deployment</p>
          )}
          <DeployButton disabled={!isReady} onDeploy={handleDeploy} />
        </section>
      </div>
    </div>
  )
}

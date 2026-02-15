'use client'

import { useAuth } from '@/components/AuthProvider'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { CompanionSelector } from '@/components/ModelSelector'
import { ChannelSelector } from '@/components/ChannelSelector'
import { TelegramConnect } from '@/components/TelegramConnect'
import { ApiKeyInput } from '@/components/ApiKeyInput'
import { DeployButton } from '@/components/DeployButton'
import { CharacterEditor } from '@/components/CharacterEditor'
import { getCharacterFilesForBot, type CharacterFiles } from '@/lib/character-files'
import { bots, type Bot } from '@/lib/bots'
import { llmProviders } from '@/lib/providers'

function AvatarFallback({ name, color, size }: { name: string; color: string; size: number }) {
  return (
    <div
      className="rounded-full avatar-comic flex items-center justify-center"
      style={{ width: size, height: size, backgroundColor: `${color}30`, border: '3px solid black' }}
    >
      <span className="font-display font-black text-2xl text-black">{name.charAt(0)}</span>
    </div>
  )
}

type StepId = 'companion' | 'model' | 'telegram' | 'personality' | 'deploy'

function DeployForm() {
  const { user, session, loading } = useAuth()
  const searchParams = useSearchParams()
  const botParam = searchParams.get('model')
  const canceled = searchParams.get('canceled') === 'true'

  const hasPreselected = !!bots.find(b => b.id === botParam)
  const initialBot = bots.find(b => b.id === botParam) || bots[0]

  const [selectedBot, setSelectedBot] = useState<Bot>(initialBot)
  const [avatarError, setAvatarError] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState(llmProviders[0].id)
  const [selectedModelId, setSelectedModelId] = useState(llmProviders[0].models[0].id)
  const [selectedChannel, setSelectedChannel] = useState('telegram')
  const [telegramToken, setTelegramToken] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [characterFiles, setCharacterFiles] = useState<CharacterFiles>(() => getCharacterFilesForBot(initialBot.id))

  const allSteps: StepId[] = hasPreselected
    ? ['model', 'telegram', 'personality', 'deploy']
    : ['companion', 'model', 'telegram', 'personality', 'deploy']

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const currentStep = allSteps[currentStepIndex]

  const currentProvider = llmProviders.find(p => p.id === selectedProvider) || llmProviders[0]
  const selectedModel = currentProvider.models.find(m => m.id === selectedModelId) || currentProvider.models[0]

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
          <p className="text-brand-gray-medium mb-6">Sign in with Google or your phone number to get started</p>
          <a href="/login" className="comic-btn inline-block no-underline">
            SIGN IN
          </a>
        </div>
      </div>
    )
  }

  const canProceed = () => {
    switch (currentStep) {
      case 'companion': return !!selectedBot
      case 'model': return !!selectedProvider && !!selectedModelId && !!apiKey
      case 'telegram': return !!telegramToken
      case 'personality': return true
      case 'deploy': return true
      default: return false
    }
  }

  const handleNext = () => {
    if (currentStepIndex < allSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToStep = (index: number) => {
    if (index <= currentStepIndex) {
      setCurrentStepIndex(index)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleDeploy = async () => {
    const res = await fetch('/api/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        model_provider: selectedProvider,
        model_name: selectedModelId,
        channel: selectedChannel,
        telegram_bot_token: telegramToken,
        llm_api_key: apiKey,
        character_files: characterFiles,
        bot_id: selectedBot.id,
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

  const stepLabels: Record<StepId, string> = {
    companion: 'Companion',
    model: 'AI Model',
    telegram: 'Telegram',
    personality: 'Personality',
    deploy: 'Deploy',
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          {!selectedBot.avatar || avatarError ? (
            <AvatarFallback name={selectedBot.characterName} color={selectedBot.color} size={56} />
          ) : (
            <Image
              src={selectedBot.avatar}
              alt={selectedBot.characterName}
              width={56}
              height={56}
              className="rounded-full avatar-comic"
              onError={() => setAvatarError(true)}
            />
          )}
          <div>
            <h1 className="comic-heading text-2xl md:text-3xl">HIRE {selectedBot.characterName}</h1>
            <p className="text-xs font-display font-bold text-brand-gray-medium uppercase">{selectedBot.characterRole}</p>
          </div>
        </div>

        {/* Payment canceled banner */}
        {canceled && (
          <div className="mb-6 p-4 border-3 border-black bg-red-50">
            <p className="font-display font-bold text-sm text-red-700">
              PAYMENT CANCELED &mdash; Your companion has not been deployed. You can try again below.
            </p>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex items-center gap-1">
            {allSteps.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <button
                  onClick={() => goToStep(i)}
                  className={`flex items-center gap-2 ${i <= currentStepIndex ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className={`w-8 h-8 border-3 border-black flex items-center justify-center font-display font-black text-xs transition-all ${
                    i < currentStepIndex ? 'bg-black text-white' :
                    i === currentStepIndex ? 'bg-brand-yellow text-black' :
                    'bg-white text-brand-gray-medium'
                  }`}>
                    {i < currentStepIndex ? '\u2713' : i + 1}
                  </div>
                  <span className={`hidden sm:inline text-xs font-display font-bold uppercase ${
                    i === currentStepIndex ? 'text-black' : 'text-brand-gray-medium'
                  }`}>
                    {stepLabels[step]}
                  </span>
                </button>
                {i < allSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${i < currentStepIndex ? 'bg-black' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="min-h-[400px]">
          {/* STEP: Companion */}
          {currentStep === 'companion' && (
            <div>
              <h2 className="comic-heading text-xl mb-2">CHOOSE YOUR AI COMPANION</h2>
              <p className="text-sm text-brand-gray-medium mb-6 font-body">Each companion has a unique personality and expertise.</p>
              <CompanionSelector
                selected={selectedBot.id}
                onSelect={(bot) => {
                  setSelectedBot(bot)
                  setAvatarError(false)
                  setCharacterFiles(getCharacterFilesForBot(bot.id))
                }}
              />
            </div>
          )}

          {/* STEP: Model */}
          {currentStep === 'model' && (
            <div>
              <h2 className="comic-heading text-xl mb-2">CHOOSE AI MODEL</h2>
              <p className="text-sm text-brand-gray-medium mb-6 font-body">Select the LLM provider, model, and enter your API key.</p>

              {/* Provider tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {llmProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => {
                      setSelectedProvider(provider.id)
                      setSelectedModelId(provider.models[0].id)
                      setApiKey('')
                    }}
                    className={`px-4 py-2 border-3 border-black font-display font-bold text-sm uppercase transition-all duration-200 ${
                      selectedProvider === provider.id
                        ? 'bg-brand-yellow shadow-comic'
                        : 'bg-white hover:shadow-comic-sm hover:-translate-y-0.5'
                    }`}
                  >
                    {provider.name}
                  </button>
                ))}
              </div>

              {/* Model selection */}
              <div className="flex flex-wrap gap-2 mb-6">
                {currentProvider.models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModelId(model.id)}
                    className={`px-4 py-2 border-3 border-black font-display font-bold text-xs uppercase transition-all duration-200 ${
                      selectedModelId === model.id
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-gray-50'
                    }`}
                  >
                    {model.label}
                  </button>
                ))}
              </div>

              {/* API Key */}
              <ApiKeyInput provider={selectedProvider} apiKey={apiKey} onSave={setApiKey} />
            </div>
          )}

          {/* STEP: Telegram */}
          {currentStep === 'telegram' && (
            <div>
              <h2 className="comic-heading text-xl mb-2">CONNECT TELEGRAM</h2>
              <p className="text-sm text-brand-gray-medium mb-6 font-body">Create a Telegram bot and paste the token below.</p>
              <TelegramConnect token={telegramToken} onSave={setTelegramToken} />
            </div>
          )}

          {/* STEP: Personality */}
          {currentStep === 'personality' && (
            <div>
              <h2 className="comic-heading text-xl mb-2">CUSTOMIZE PERSONALITY</h2>
              <p className="text-sm text-brand-gray-medium mb-6 font-body">
                Edit {selectedBot.characterName}&apos;s personality files. Presets are loaded automatically &mdash; you can skip this step.
              </p>
              <CharacterEditor files={characterFiles} onChange={setCharacterFiles} />
            </div>
          )}

          {/* STEP: Deploy */}
          {currentStep === 'deploy' && (
            <div>
              <h2 className="comic-heading text-xl mb-6">REVIEW & HIRE</h2>

              {/* Summary */}
              <div className="comic-card p-6 mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm uppercase text-brand-gray-medium">Companion</span>
                  <div className="flex items-center gap-2">
                    {selectedBot.avatar && !avatarError ? (
                      <Image src={selectedBot.avatar} alt="" width={24} height={24} className="rounded-full border-2 border-black" onError={() => setAvatarError(true)} />
                    ) : null}
                    <span className="font-display font-bold text-sm">{selectedBot.characterName}</span>
                  </div>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm uppercase text-brand-gray-medium">AI Model</span>
                  <span className="font-display font-bold text-sm">{currentProvider.name} / {selectedModel.label}</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm uppercase text-brand-gray-medium">Channel</span>
                  <span className="font-display font-bold text-sm">Telegram</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm uppercase text-brand-gray-medium">API Key</span>
                  <span className="font-display font-bold text-sm text-green-700">{'\u2713'} Saved</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm uppercase text-brand-gray-medium">Telegram Bot</span>
                  <span className="font-display font-bold text-sm text-green-700">{'\u2713'} Connected</span>
                </div>
              </div>

              <DeployButton disabled={false} onDeploy={handleDeploy} botName={selectedBot.characterName} />
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="mt-10 flex items-center justify-between">
          {currentStepIndex > 0 ? (
            <button
              onClick={handleBack}
              className="comic-btn-outline text-sm py-3 px-6"
            >
              &larr; BACK
            </button>
          ) : (
            <div />
          )}

          {currentStep !== 'deploy' && (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="comic-btn text-sm py-3 px-8 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
            >
              {currentStep === 'personality' ? 'REVIEW' : 'NEXT'} &rarr;
            </button>
          )}
        </div>
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

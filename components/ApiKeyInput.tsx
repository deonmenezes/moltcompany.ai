'use client'

import { useState } from 'react'

const providerInfo: Record<string, { label: string; placeholder: string; helpUrl: string }> = {
  anthropic: {
    label: 'Anthropic API Key',
    placeholder: 'sk-ant-...',
    helpUrl: 'https://console.anthropic.com/settings/keys',
  },
  openai: {
    label: 'OpenAI API Key',
    placeholder: 'sk-...',
    helpUrl: 'https://platform.openai.com/api-keys',
  },
  google: {
    label: 'Google AI API Key',
    placeholder: 'AIza...',
    helpUrl: 'https://aistudio.google.com/app/apikey',
  },
}

export function ApiKeyInput({
  provider,
  apiKey,
  onSave,
}: {
  provider: string
  apiKey: string
  onSave: (key: string) => void
}) {
  const [value, setValue] = useState(apiKey)
  const [saved, setSaved] = useState(!!apiKey)
  const info = providerInfo[provider] || providerInfo.anthropic

  return (
    <div className="max-w-lg">
      <div className="p-6 rounded-xl bg-dark-card border border-dark-border">
        <h4 className="font-semibold mb-1 text-white">Enter your {info.label}</h4>
        <p className="text-sm text-gray-500 mb-4">
          Your key is encrypted before storage and only used by your instance.
        </p>
        <input
          type="password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setSaved(false)
          }}
          placeholder={info.placeholder}
          className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-white placeholder-gray-600 focus:outline-none focus:border-accent-blue transition"
        />
        <button
          onClick={() => {
            if (value.trim()) {
              onSave(value.trim())
              setSaved(true)
            }
          }}
          disabled={!value.trim()}
          className={`mt-4 w-full py-3 rounded-lg font-medium transition ${
            saved
              ? 'bg-green-600/20 text-green-400 border border-green-600/30'
              : 'bg-gradient-to-r from-accent-blue to-accent-purple hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed'
          }`}
        >
          {saved ? 'Saved ✓' : 'Save API Key'}
        </button>
        <a
          href={info.helpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-3 text-sm text-accent-blue hover:underline"
        >
          How to get your API key →
        </a>
      </div>
    </div>
  )
}

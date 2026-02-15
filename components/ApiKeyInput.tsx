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
      <div className="comic-card p-6">
        <h4 className="font-display font-bold mb-1 text-black uppercase">Enter your {info.label}</h4>
        <p className="text-sm text-brand-gray-medium mb-4">
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
          className="w-full px-4 py-3 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow transition"
        />
        <button
          onClick={() => {
            if (value.trim()) {
              onSave(value.trim())
              setSaved(true)
            }
          }}
          disabled={!value.trim()}
          className={`mt-4 w-full py-3 font-display font-bold uppercase border-3 transition ${
            saved
              ? 'bg-green-100 text-green-700 border-green-700'
              : 'comic-btn disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none'
          }`}
        >
          {saved ? 'SAVED' : 'SAVE API KEY'}
        </button>
        <a
          href={info.helpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-3 text-sm text-black font-bold underline hover:text-brand-gray-dark"
        >
          How to get your API key &rarr;
        </a>
      </div>
    </div>
  )
}

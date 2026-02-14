'use client'

import { useState } from 'react'

export function TelegramConnect({
  token,
  onSave,
}: {
  token: string
  onSave: (token: string) => void
}) {
  const [value, setValue] = useState(token)
  const [saved, setSaved] = useState(!!token)

  const handleSave = () => {
    if (value.trim() && value.includes(':')) {
      onSave(value.trim())
      setSaved(true)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Instructions */}
      <div className="p-6 rounded-xl bg-dark-card border border-dark-border">
        <h4 className="font-semibold mb-4 text-white">How to create your Telegram bot</h4>
        <div className="space-y-4">
          {[
            { step: '1', text: 'Open Telegram and search for @BotFather' },
            { step: '2', text: 'Start a chat and type /newbot' },
            { step: '3', text: 'Follow the prompts to name your bot' },
            { step: '4', text: 'Copy the bot token BotFather gives you' },
            { step: '5', text: 'Paste it in the field below' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-accent-blue/20 text-accent-blue text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {item.step}
              </div>
              <p className="text-sm text-gray-300">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-6 rounded-xl bg-dark-card border border-dark-border">
        <h4 className="font-semibold mb-4 text-white">Enter bot token</h4>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setSaved(false)
          }}
          placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
          className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-white placeholder-gray-600 focus:outline-none focus:border-accent-blue transition"
        />
        <button
          onClick={handleSave}
          disabled={!value.trim() || !value.includes(':')}
          className={`mt-4 w-full py-3 rounded-lg font-medium transition ${
            saved
              ? 'bg-green-600/20 text-green-400 border border-green-600/30'
              : 'bg-gradient-to-r from-accent-blue to-accent-purple hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed'
          }`}
        >
          {saved ? 'Saved ✓' : 'Save & Connect'}
        </button>
      </div>
    </div>
  )
}

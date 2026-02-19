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
    <div className="grid md:grid-cols-2 gap-4">
      <div className="comic-card p-4">
        <h4 className="font-display font-bold mb-3 text-black uppercase text-sm">How to create your Telegram bot</h4>
        <div className="space-y-2">
          {[
            { step: '1', text: 'Open Telegram and search for @BotFather' },
            { step: '2', text: 'Start a chat and type /newbot' },
            { step: '3', text: 'Follow the prompts to name your bot' },
            { step: '4', text: 'Copy the bot token BotFather gives you' },
            { step: '5', text: 'Paste it in the field below' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-brand-yellow border-2 border-black text-black text-xs font-display font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {item.step}
              </div>
              <p className="text-sm text-brand-gray-dark">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="comic-card p-4">
        <h4 className="font-display font-bold mb-3 text-black uppercase text-sm">Enter bot token</h4>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setSaved(false)
          }}
          placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
          className="w-full px-4 py-3 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow transition"
        />
        <button
          onClick={handleSave}
          disabled={!value.trim() || !value.includes(':')}
          className={`mt-3 w-full py-2 font-display font-bold uppercase border-3 transition ${
            saved
              ? 'bg-green-100 text-green-700 border-green-700'
              : 'comic-btn disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none'
          }`}
        >
          {saved ? 'SAVED' : 'SAVE & CONNECT'}
        </button>
      </div>
    </div>
  )
}

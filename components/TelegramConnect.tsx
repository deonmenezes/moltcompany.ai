'use client'

import { useState } from 'react'

export function TelegramConnect({
  token,
  onSave,
  dark,
}: {
  token: string
  onSave: (token: string) => void
  dark?: boolean
}) {
  const [value, setValue] = useState(token)
  const [saved, setSaved] = useState(!!token)

  const handleSave = () => {
    if (value.trim() && value.includes(':')) {
      onSave(value.trim())
      setSaved(true)
    }
  }

  const cardClass = dark ? 'comic-card-dark' : 'comic-card'
  const headingColor = dark ? 'text-gray-200' : 'text-black'
  const textColor = dark ? 'text-gray-400' : 'text-brand-gray-dark'
  const stepBorder = dark ? 'border-brand-yellow/50' : 'border-black'
  const inputClass = dark
    ? 'w-full px-4 py-3 border-3 border-brand-yellow/30 bg-[#0d0d20] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow/60 transition'
    : 'w-full px-4 py-3 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow transition'

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className={`${cardClass} p-4`}>
        <h4 className={`font-display font-bold mb-3 uppercase text-sm ${headingColor}`}>How to create your Telegram bot</h4>
        <div className="space-y-2">
          {[
            { step: '1', text: 'Open Telegram and search for @BotFather' },
            { step: '2', text: 'Start a chat and type /newbot' },
            { step: '3', text: 'Follow the prompts to name your bot' },
            { step: '4', text: 'Copy the bot token BotFather gives you' },
            { step: '5', text: 'Paste it in the field below' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className={`w-6 h-6 bg-brand-yellow border-2 ${stepBorder} text-black text-xs font-display font-bold flex items-center justify-center flex-shrink-0 mt-0.5`}>
                {item.step}
              </div>
              <p className={`text-sm ${textColor}`}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`${cardClass} p-4`}>
        <h4 className={`font-display font-bold mb-3 uppercase text-sm ${headingColor}`}>Enter bot token</h4>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setSaved(false)
          }}
          placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
          className={inputClass}
        />
        <button
          onClick={handleSave}
          disabled={!value.trim() || !value.includes(':')}
          className={`mt-3 w-full py-2 font-display font-bold uppercase border-3 transition ${
            saved
              ? dark
                ? 'bg-green-900/50 text-green-400 border-green-500/50'
                : 'bg-green-100 text-green-700 border-green-700'
              : 'comic-btn disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none'
          }`}
        >
          {saved ? 'SAVED' : 'SAVE & CONNECT'}
        </button>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

export function TeamsConnect({
  appId,
  appPassword,
  onSave,
}: {
  appId: string
  appPassword: string
  onSave: (appId: string, appPassword: string) => void
}) {
  const [id, setId] = useState(appId)
  const [password, setPassword] = useState(appPassword)
  const [saved, setSaved] = useState(!!appId && !!appPassword)

  const handleSave = () => {
    if (id.trim() && password.trim()) {
      onSave(id.trim(), password.trim())
      setSaved(true)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="comic-card p-6">
        <h4 className="font-display font-bold mb-4 text-black uppercase">How to create your Teams bot</h4>
        <div className="space-y-4">
          {[
            { step: '1', text: 'Go to the Azure Portal and create an "Azure Bot" resource (free tier)' },
            { step: '2', text: 'Under Configuration, note the Microsoft App ID' },
            { step: '3', text: 'Click "Manage Password" to create a client secret (App Password)' },
            { step: '4', text: 'Under Channels, enable the "Microsoft Teams" channel' },
            { step: '5', text: 'Paste the App ID and App Password below' },
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

      <div className="comic-card p-6">
        <h4 className="font-display font-bold mb-4 text-black uppercase">Enter bot credentials</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-display font-bold text-brand-gray-medium uppercase mb-1">
              Microsoft App ID
            </label>
            <input
              type="text"
              value={id}
              onChange={(e) => {
                setId(e.target.value)
                setSaved(false)
              }}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="w-full px-4 py-3 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow transition"
            />
          </div>
          <div>
            <label className="block text-xs font-display font-bold text-brand-gray-medium uppercase mb-1">
              App Password (Client Secret)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setSaved(false)
              }}
              placeholder="Your client secret value"
              className="w-full px-4 py-3 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow transition"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={!id.trim() || !password.trim()}
          className={`mt-4 w-full py-3 font-display font-bold uppercase border-3 transition ${
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

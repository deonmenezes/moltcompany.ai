'use client'

import { useState } from 'react'

export function WhatsAppConnect({
  phoneNumberId,
  accessToken,
  onSave,
}: {
  phoneNumberId: string
  accessToken: string
  onSave: (phoneNumberId: string, accessToken: string) => void
}) {
  const [phoneId, setPhoneId] = useState(phoneNumberId)
  const [token, setToken] = useState(accessToken)
  const [saved, setSaved] = useState(!!phoneNumberId && !!accessToken)

  const handleSave = () => {
    if (phoneId.trim() && token.trim()) {
      onSave(phoneId.trim(), token.trim())
      setSaved(true)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="comic-card p-6">
        <h4 className="font-display font-bold mb-4 text-black uppercase">How to set up WhatsApp</h4>
        <div className="space-y-4">
          {[
            { step: '1', text: 'Go to developers.facebook.com and create a new app (type: Business)' },
            { step: '2', text: 'Add the "WhatsApp" product to your app' },
            { step: '3', text: 'Under WhatsApp > API Setup, note your Phone Number ID' },
            { step: '4', text: 'Generate a permanent access token (System User token from Business Settings)' },
            { step: '5', text: 'Paste both values below' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-brand-yellow border-2 border-black text-black text-xs font-display font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {item.step}
              </div>
              <p className="text-sm text-brand-gray-dark">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 border-2 border-blue-300">
          <p className="text-[10px] font-display font-bold uppercase text-blue-700 mb-1">Webhook URL (set this in Meta App Dashboard)</p>
          <code className="text-[11px] text-black font-mono block break-all">
            https://moltcompany.ai/api/whatsapp/webhook
          </code>
        </div>
      </div>

      <div className="comic-card p-6">
        <h4 className="font-display font-bold mb-4 text-black uppercase">Enter WhatsApp credentials</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-display font-bold text-brand-gray-medium uppercase mb-1">
              Phone Number ID
            </label>
            <input
              type="text"
              value={phoneId}
              onChange={(e) => {
                setPhoneId(e.target.value)
                setSaved(false)
              }}
              placeholder="e.g. 102345678901234"
              className="w-full px-4 py-3 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow transition"
            />
          </div>
          <div>
            <label className="block text-xs font-display font-bold text-brand-gray-medium uppercase mb-1">
              Permanent Access Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => {
                setToken(e.target.value)
                setSaved(false)
              }}
              placeholder="Your WhatsApp Cloud API access token"
              className="w-full px-4 py-3 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow transition"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={!phoneId.trim() || !token.trim()}
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

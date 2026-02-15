'use client'

import { useState } from 'react'

export function DeployButton({
  disabled,
  onDeploy,
  botName,
}: {
  disabled: boolean
  onDeploy: () => Promise<void>
  botName?: string
}) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      await onDeploy()
    } catch (err) {
      console.error('Deploy error:', err)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className="comic-btn w-full max-w-md text-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          DEPLOYING...
        </span>
      ) : (
        `DEPLOY ${botName || 'BOT'} — $40/MO`
      )}
    </button>
  )
}

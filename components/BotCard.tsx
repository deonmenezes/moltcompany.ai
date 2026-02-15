'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Bot } from '@/lib/bots'
import { useState } from 'react'

export function BotCard({ bot }: { bot: Bot }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="comic-card-hover flex flex-col">
      <div className="h-2" style={{ backgroundColor: bot.color }} />

      <div className="p-6 pb-2 flex flex-col items-center text-center">
        {imgError ? (
          <div
            className="w-20 h-20 rounded-full avatar-comic bg-brand-gray flex items-center justify-center mb-3"
            style={{ borderColor: bot.color }}
          >
            <span className="font-display font-black text-2xl text-black">
              {bot.characterName.charAt(0)}
            </span>
          </div>
        ) : (
          <Image
            src={bot.avatar}
            alt={bot.characterName}
            width={80}
            height={80}
            className="avatar-comic rounded-full bg-brand-gray mb-3"
            onError={() => setImgError(true)}
          />
        )}
        <h3 className="comic-heading text-2xl">{bot.characterName}</h3>
        <span
          className="inline-block mt-1 px-3 py-0.5 text-xs font-display font-bold uppercase border-2 border-black"
          style={{ backgroundColor: bot.color, color: bot.color === '#FFD600' ? '#000' : '#fff' }}
        >
          {bot.characterRole}
        </span>
      </div>

      <div className="px-6 pt-4">
        <div className="border-t-2 border-dashed border-brand-gray-medium" />
        <p className="font-body text-sm text-brand-gray-dark text-center mt-3">
          {bot.tagline}
        </p>
      </div>

      <div className="p-6 pt-4 mt-auto">
        <div className="flex items-baseline justify-center gap-2 mb-4">
          <span className="comic-heading text-3xl">$40</span>
          <span className="text-brand-gray-medium font-medium text-sm">/month</span>
        </div>
        <Link
          href={`/deploy?model=${bot.id}`}
          className="comic-btn block text-center w-full text-sm"
        >
          DEPLOY {bot.characterName}
        </Link>
      </div>
    </div>
  )
}

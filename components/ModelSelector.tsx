'use client'

import Image from 'next/image'
import { bots, type Bot } from '@/lib/bots'
import { useState } from 'react'

function AvatarWithFallback({ src, name, color, size }: { src: string | null; name: string; color: string; size: number }) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div
        className="rounded-full avatar-comic flex items-center justify-center"
        style={{ width: size, height: size, backgroundColor: `${color}30`, border: '2px solid black' }}
      >
        <span className="font-display font-black text-lg text-black">
          {name.charAt(0)}
        </span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      className="rounded-full avatar-comic"
      onError={() => setError(true)}
    />
  )
}

export function CompanionSelector({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (bot: Bot) => void
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {bots.map((bot) => (
        <button
          key={bot.id}
          onClick={() => onSelect(bot)}
          className={`p-4 border-3 transition-all duration-200 text-left ${
            selected === bot.id
              ? 'border-black bg-brand-yellow shadow-comic'
              : 'border-black bg-white hover:shadow-comic-sm hover:-translate-y-0.5'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <AvatarWithFallback src={bot.avatar} name={bot.characterName} color={bot.color} size={40} />
            <div className="min-w-0">
              <div className="font-display font-bold text-black uppercase text-sm truncate">{bot.characterName}</div>
              <div className="text-[10px] text-brand-gray-medium font-display font-bold uppercase">{bot.characterRole}</div>
            </div>
          </div>
          {selected === bot.id && (
            <div className="text-[10px] font-display font-bold text-black mt-1 uppercase">Selected</div>
          )}
        </button>
      ))}
    </div>
  )
}

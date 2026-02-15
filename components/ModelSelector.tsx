'use client'

import Image from 'next/image'
import { bots } from '@/lib/bots'
import { useState } from 'react'

export const models = bots.map(b => ({
  id: b.id,
  provider: b.provider,
  name: b.modelName,
  label: b.label,
  company: b.company,
  avatar: b.avatar,
  characterName: b.characterName,
  characterRole: b.characterRole,
}))

function AvatarWithFallback({ src, name, size }: { src: string; name: string; size: number }) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div
        className="rounded-full avatar-comic bg-brand-gray flex items-center justify-center"
        style={{ width: size, height: size }}
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

export function ModelSelector({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (model: typeof models[0]) => void
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {models.map((model) => (
        <button
          key={model.id}
          onClick={() => onSelect(model)}
          className={`p-4 border-3 transition-all duration-200 text-left ${
            selected === model.id
              ? 'border-black bg-brand-yellow shadow-comic'
              : 'border-black bg-white hover:shadow-comic-sm hover:-translate-y-0.5'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <AvatarWithFallback src={model.avatar} name={model.characterName} size={40} />
            <div className="min-w-0">
              <div className="font-display font-bold text-black uppercase text-sm truncate">{model.characterName}</div>
              <div className="text-[10px] text-brand-gray-medium font-display font-bold uppercase">{model.characterRole}</div>
            </div>
          </div>
          <div className="text-[10px] text-brand-gray-medium">{model.label} &middot; {model.company}</div>
          {selected === model.id && (
            <div className="text-[10px] font-display font-bold text-black mt-1 uppercase">Selected</div>
          )}
        </button>
      ))}
    </div>
  )
}

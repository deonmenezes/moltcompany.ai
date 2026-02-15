'use client'

import { useState } from 'react'
import { bots, categories, type Category } from '@/lib/bots'
import { BotCard } from './BotCard'

export function BotGrid() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')

  const filtered = activeCategory === 'all'
    ? bots
    : bots.filter(b => b.category === activeCategory)

  return (
    <>
      {/* Category filter tabs */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-2 border-3 border-black font-display font-bold text-sm uppercase transition-all duration-200 ${
              activeCategory === cat.id
                ? 'bg-black text-white shadow-none translate-y-0.5'
                : 'bg-white text-black shadow-comic-sm hover:shadow-comic hover:-translate-y-0.5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Bot grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((bot) => (
          <BotCard key={bot.id} bot={bot} />
        ))}
      </div>
    </>
  )
}

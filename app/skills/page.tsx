'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'
import { skills, skillCategories, type SkillCategory } from '@/lib/skills'

export default function SkillsPage() {
  const { user, loading } = useAuth()
  const [filter, setFilter] = useState<SkillCategory>('all')
  const [search, setSearch] = useState('')
  const [subscribing, setSubscribing] = useState<string | null>(null)

  const filtered = skills.filter(s => {
    const matchesCategory = filter === 'all' || s.category === filter
    const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredSkills = skills.filter(s => s.featured)

  const handleSubscribe = async (skillId: string) => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    setSubscribing(skillId)
    try {
      const token = (await (window as any).__supabase?.auth?.getSession?.())?.data?.session?.access_token
      const res = await fetch('/api/skills/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ skillId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Subscribe error:', err)
    } finally {
      setSubscribing(null)
    }
  }

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden border-b-3 border-black bg-gradient-to-br from-white via-yellow-50 to-white">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
          <div className="inline-block bg-brand-yellow border-3 border-black px-4 py-1 mb-6 shadow-comic-sm">
            <span className="font-display font-black text-sm uppercase">Skills Marketplace</span>
          </div>
          <h1 className="comic-heading text-4xl md:text-6xl lg:text-7xl mb-6">
            SUPERCHARGE YOUR<br />
            <span className="text-brand-yellow">AI AGENT</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-gray-medium max-w-2xl mx-auto mb-8">
            Browse 50+ skills from the OpenClaw ecosystem. Each skill gives your AI new powers. $10/month per skill, cancel anytime.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm font-display font-bold uppercase">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 bg-brand-yellow border-3 border-black flex items-center justify-center text-lg">⚡</span>
              Instant Install
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 bg-brand-yellow border-3 border-black flex items-center justify-center text-lg">🔄</span>
              Cancel Anytime
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 bg-brand-yellow border-3 border-black flex items-center justify-center text-lg">🛡️</span>
              Secure
            </div>
          </div>
        </div>
        {/* Decorative dots */}
        <div className="absolute top-4 left-4 w-24 h-24 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, black 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }} />
        <div className="absolute bottom-4 right-4 w-24 h-24 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, black 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }} />
      </section>

      {/* Featured Skills */}
      {filter === 'all' && !search && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="comic-heading text-2xl mb-6">⭐ FEATURED SKILLS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredSkills.map(skill => (
              <div key={skill.id} className="comic-card-hover p-5 flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-brand-yellow border-l-3 border-b-3 border-black px-2 py-0.5">
                  <span className="font-display font-black text-[10px] uppercase">Featured</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-yellow border-3 border-black flex items-center justify-center text-2xl shadow-comic-sm">
                    {skill.emoji}
                  </div>
                  <div>
                    <h3 className="font-display font-black text-lg uppercase">{skill.name}</h3>
                    <span className="text-xs font-display font-bold uppercase text-brand-gray-medium">
                      {skillCategories.find(c => c.id === skill.category)?.label}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-brand-gray-medium flex-1">{skill.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-display font-black text-lg">${skill.price}<span className="text-xs font-bold text-brand-gray-medium">/mo</span></span>
                  <button
                    onClick={() => handleSubscribe(skill.id)}
                    disabled={subscribing === skill.id}
                    className="comic-btn text-xs py-2 px-5"
                  >
                    {subscribing === skill.id ? 'LOADING...' : 'SUBSCRIBE'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Browse All */}
      <section className="max-w-6xl mx-auto px-4 py-8 pb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="comic-heading text-2xl">ALL SKILLS</h2>
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border-3 border-black px-4 py-2.5 pr-10 font-display text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-medium" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b-2 border-black/10">
          {skillCategories.map(c => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id as SkillCategory)}
              className={`px-4 py-2 border-3 border-black font-display font-bold text-xs uppercase transition-all duration-200 ${
                filter === c.id
                  ? 'bg-brand-yellow shadow-comic-sm'
                  : 'bg-white hover:bg-gray-50 hover:-translate-y-0.5'
              }`}
            >
              {c.label}
              {filter !== c.id && (
                <span className="ml-1.5 text-[10px] text-brand-gray-medium">
                  {c.id === 'all' ? skills.length : skills.filter(s => s.category === c.id).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-brand-gray-medium mb-4 font-display font-bold">
          {filtered.length} skill{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-6xl mb-4">🔍</p>
            <p className="font-display font-bold text-lg">No skills found</p>
            <p className="text-brand-gray-medium text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(skill => (
              <div key={skill.id} className="comic-card-hover p-4 flex flex-col gap-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 border-3 border-black flex items-center justify-center text-xl flex-shrink-0">
                    {skill.emoji}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-black text-sm uppercase truncate">{skill.name}</h3>
                    <span className="text-[10px] font-display font-bold uppercase text-brand-gray-medium">
                      {skillCategories.find(c => c.id === skill.category)?.label}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-brand-gray-medium flex-1 line-clamp-2">{skill.description}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-display font-black">${skill.price}<span className="text-[10px] font-bold text-brand-gray-medium">/mo</span></span>
                  <button
                    onClick={() => handleSubscribe(skill.id)}
                    disabled={subscribing === skill.id}
                    className="comic-btn-outline text-[10px] py-1.5 px-3"
                  >
                    {subscribing === skill.id ? '...' : 'SUBSCRIBE'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t-3 border-black bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="comic-heading text-3xl md:text-4xl mb-4">BUILD YOUR OWN SKILL</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Got an idea for a skill? Build it with the Skill Creator and sell it on the marketplace. Earn from every subscription.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sell" className="comic-btn text-sm py-3 px-8 no-underline">
              START SELLING
            </Link>
            <Link href="/docs" className="comic-btn-outline text-sm py-3 px-8 no-underline bg-white">
              READ THE DOCS
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

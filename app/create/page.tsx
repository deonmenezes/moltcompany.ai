'use client'

import { useAuth } from '@/components/AuthProvider'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CharacterEditor } from '@/components/CharacterEditor'
import { CHARACTER_FILE_NAMES, type CharacterFiles } from '@/lib/character-files'

const COLOR_PALETTE = [
  '#FFD600', '#F59E0B', '#EF4444', '#EC4899',
  '#8B5CF6', '#3B82F6', '#06B6D4', '#10B981',
  '#6B7280', '#000000',
]

function blankCharacterFiles(): CharacterFiles {
  const files = {} as CharacterFiles
  for (const name of CHARACTER_FILE_NAMES) {
    files[name] = ''
  }
  files.SOUL = `You are [NAME], a [ROLE].

Core values:
-

Communication style:
- `
  files.IDENTITY = `Name: [NAME]
Role: [ROLE]
Tone: Professional yet approachable

Public persona:
- `
  files.USER = `How to interact with users:
- Listen carefully to their needs
- Provide clear, actionable responses
- Ask clarifying questions when needed`
  return files
}

type StepId = 'basics' | 'personality' | 'tools' | 'publish'

export default function CreateCompanionPage() {
  const { user, session, loading } = useAuth()
  const router = useRouter()

  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [description, setDescription] = useState('')
  const [iconUrl, setIconUrl] = useState('')
  const [color, setColor] = useState(COLOR_PALETTE[0])
  const [characterFiles, setCharacterFiles] = useState<CharacterFiles>(blankCharacterFiles)
  const [category, setCategory] = useState('other')
  const [tagsInput, setTagsInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [toolsConfig, setToolsConfig] = useState({
    browser: true,
    reactions: true,
    stickers: false,
  })
  const [customInstructions, setCustomInstructions] = useState('')

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [published, setPublished] = useState(false)

  const allSteps: StepId[] = ['basics', 'personality', 'tools', 'publish']
  const currentStep = allSteps[currentStepIndex]

  const stepLabels: Record<StepId, string> = {
    basics: 'Basics',
    personality: 'Personality',
    tools: 'Tools',
    publish: 'Publish',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-16">
        <div className="animate-spin h-8 w-8 border-3 border-brand-yellow border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-16">
        <div className="text-center">
          <h2 className="comic-heading text-3xl mb-4">SIGN IN TO CREATE</h2>
          <p className="text-brand-gray-medium mb-6">You need an account to create AI companions</p>
          <Link href="/login" className="comic-btn inline-block no-underline">SIGN IN</Link>
        </div>
      </div>
    )
  }

  if (published) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-16 px-4">
        <div className="comic-card p-12 text-center max-w-lg">
          <div className="text-6xl mb-4">&#127881;</div>
          <h2 className="comic-heading text-3xl mb-3">COMPANION PUBLISHED!</h2>
          <p className="text-brand-gray-medium mb-2">
            <span className="font-display font-bold text-black">{name.toUpperCase()}</span> is now live in the community.
          </p>
          <p className="text-brand-gray-medium mb-8 text-sm">
            Other users can discover and view your companion.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/community" className="comic-btn inline-block text-sm">
              VIEW IN COMMUNITY
            </Link>
            <button onClick={() => { setPublished(false); setCurrentStepIndex(0); setName(''); setRole(''); setDescription(''); setIconUrl(''); setColor(COLOR_PALETTE[0]); setCharacterFiles(blankCharacterFiles()); setCustomInstructions(''); setError(''); }} className="comic-btn-outline text-sm">
              CREATE ANOTHER
            </button>
          </div>
        </div>
      </div>
    )
  }

  const canProceed = () => {
    switch (currentStep) {
      case 'basics': return !!name.trim() && !!role.trim()
      case 'personality': return true
      case 'tools': return true
      case 'publish': return true
      default: return false
    }
  }

  const handleNext = () => {
    if (currentStepIndex < allSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToStep = (index: number) => {
    if (index <= currentStepIndex) {
      setCurrentStepIndex(index)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePublish = async () => {
    setError('')
    if (!name.trim()) { setError('Companion name is required'); return }

    // Build the full character file content from all files
    const allContent = CHARACTER_FILE_NAMES
      .filter(fn => characterFiles[fn].trim())
      .map(fn => `# ${fn}\n${characterFiles[fn]}`)
      .join('\n\n---\n\n')

    const fullCharacterFile = customInstructions.trim()
      ? `${allContent}\n\n---\n\n# CUSTOM INSTRUCTIONS\n${customInstructions}`
      : allContent

    setSubmitting(true)
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          icon_url: iconUrl.trim() || null,
          character_file: fullCharacterFile || 'No character file provided.',
          role: role.trim(),
          color,
          tools_config: toolsConfig,
          category,
          tags,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to publish')
        return
      }
      setPublished(true)
    } catch {
      setError('Failed to publish companion')
    } finally {
      setSubmitting(false)
    }
  }

  const totalCharSize = Object.values(characterFiles).reduce((sum, c) => sum + c.length, 0)

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          {iconUrl ? (
            <img src={iconUrl} alt="" className="w-14 h-14 rounded-full avatar-comic object-cover bg-brand-gray" />
          ) : (
            <div
              className="w-14 h-14 rounded-full avatar-comic flex items-center justify-center"
              style={{ backgroundColor: `${color}30`, border: '3px solid black' }}
            >
              <span className="font-display font-black text-2xl text-black">
                {name ? name.charAt(0).toUpperCase() : '?'}
              </span>
            </div>
          )}
          <div>
            <h1 className="comic-heading text-2xl md:text-3xl">
              {name ? `CREATE ${name.toUpperCase()}` : 'CREATE YOUR COMPANION'}
            </h1>
            {role && <p className="text-xs font-display font-bold text-brand-gray-medium uppercase">{role}</p>}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex items-center gap-1">
            {allSteps.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <button
                  onClick={() => goToStep(i)}
                  className={`flex items-center gap-2 ${i <= currentStepIndex ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className={`w-8 h-8 border-3 border-black flex items-center justify-center font-display font-black text-xs transition-all ${
                    i < currentStepIndex ? 'bg-black text-white' :
                    i === currentStepIndex ? 'bg-brand-yellow text-black' :
                    'bg-white text-brand-gray-medium'
                  }`}>
                    {i < currentStepIndex ? '\u2713' : i + 1}
                  </div>
                  <span className={`hidden sm:inline text-xs font-display font-bold uppercase ${
                    i === currentStepIndex ? 'text-black' : 'text-brand-gray-medium'
                  }`}>
                    {stepLabels[step]}
                  </span>
                </button>
                {i < allSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${i < currentStepIndex ? 'bg-black' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="min-h-[400px]">

          {/* STEP 1: BASICS */}
          {currentStep === 'basics' && (
            <div>
              <h2 className="comic-heading text-xl mb-2">NAME & IDENTITY</h2>
              <p className="text-sm text-brand-gray-medium mb-6 font-body">Give your companion a name, role, and look.</p>

              {/* Icon preview + URL */}
              <div className="flex items-center gap-4 mb-6">
                {iconUrl ? (
                  <img src={iconUrl} alt="Preview" className="w-20 h-20 rounded-full avatar-comic object-cover bg-brand-gray" />
                ) : (
                  <div
                    className="w-20 h-20 rounded-full avatar-comic flex items-center justify-center"
                    style={{ backgroundColor: `${color}30`, borderColor: color }}
                  >
                    <span className="font-display font-black text-3xl text-black">
                      {name ? name.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="text"
                    value={iconUrl}
                    onChange={e => setIconUrl(e.target.value)}
                    placeholder="Paste image URL (optional)"
                    className="w-full px-4 py-3 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow transition"
                  />
                  <p className="text-xs text-brand-gray-medium mt-1">Or leave empty for a letter icon</p>
                </div>
              </div>

              {/* Color picker */}
              <div className="mb-6">
                <label className="block font-display font-bold text-sm uppercase mb-2">Accent Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTE.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-10 h-10 rounded-full border-3 transition-all ${
                        color === c ? 'border-black scale-110 shadow-comic-sm' : 'border-gray-300 hover:border-black'
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="mb-6">
                <label className="block font-display font-bold text-sm uppercase mb-2">Companion Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. LUNA, ATLAS, MAX..."
                  maxLength={60}
                  className="w-full px-4 py-3 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow transition font-display font-bold uppercase"
                />
                <p className="text-xs text-brand-gray-medium mt-1">{name.length}/60 characters</p>
              </div>

              {/* Role */}
              <div className="mb-6">
                <label className="block font-display font-bold text-sm uppercase mb-2">Role / Title *</label>
                <input
                  type="text"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Marketing Guru, Research Assistant, Code Reviewer..."
                  maxLength={60}
                  className="w-full px-4 py-3 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow transition"
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block font-display font-bold text-sm uppercase mb-2">Short Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What does this companion do? What makes it special?"
                  maxLength={300}
                  rows={3}
                  className="w-full px-4 py-3 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow transition resize-none"
                />
                <p className="text-xs text-brand-gray-medium mt-1">{description.length}/300 characters</p>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block font-display font-bold text-sm uppercase mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'productivity', label: 'Productivity' },
                    { id: 'creative', label: 'Creative' },
                    { id: 'business', label: 'Business' },
                    { id: 'education', label: 'Education' },
                    { id: 'entertainment', label: 'Entertainment' },
                    { id: 'developer', label: 'Developer' },
                    { id: 'health', label: 'Health' },
                    { id: 'social', label: 'Social' },
                    { id: 'finance', label: 'Finance' },
                    { id: 'other', label: 'Other' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`px-3 py-1.5 border-2 border-black font-display font-bold text-xs uppercase transition-all ${
                        category === cat.id ? 'bg-brand-yellow shadow-comic-sm' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <label className="block font-display font-bold text-sm uppercase mb-2">Tags (up to 5)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault()
                        const tag = tagsInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
                        if (tag && tags.length < 5 && !tags.includes(tag)) {
                          setTags([...tags, tag])
                        }
                        setTagsInput('')
                      }
                    }}
                    placeholder="Type a tag and press Enter..."
                    className="flex-1 px-4 py-2 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow transition text-sm"
                    disabled={tags.length >= 5}
                  />
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-display font-bold bg-gray-100 border border-gray-300 text-gray-700 uppercase">
                        #{tag}
                        <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="text-red-400 hover:text-red-600 ml-0.5">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-brand-gray-medium mt-1">{tags.length}/5 tags &mdash; helps users discover your companion</p>
              </div>

              {/* Live preview card */}
              <div className="mt-8">
                <label className="block font-display font-bold text-sm uppercase mb-3 text-brand-gray-medium">Preview</label>
                <div className="comic-card overflow-hidden max-w-xs">
                  <div className="h-2" style={{ backgroundColor: color }} />
                  <div className="p-6 text-center">
                    {iconUrl ? (
                      <img src={iconUrl} alt="" className="w-16 h-16 rounded-full avatar-comic mx-auto mb-3 object-cover bg-brand-gray" />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-full avatar-comic mx-auto mb-3 flex items-center justify-center"
                        style={{ backgroundColor: `${color}30`, borderColor: color }}
                      >
                        <span className="font-display font-black text-xl text-black">
                          {name ? name.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                    )}
                    <h3 className="comic-heading text-lg">{name ? name.toUpperCase() : 'YOUR BOT'}</h3>
                    {role && (
                      <span
                        className="inline-block mt-1 px-3 py-0.5 text-xs font-display font-bold uppercase border-2 border-black text-white"
                        style={{ backgroundColor: color, color: color === '#FFD600' || color === '#F59E0B' ? '#000' : '#fff' }}
                      >
                        {role}
                      </span>
                    )}
                    {description && (
                      <p className="text-xs text-brand-gray-dark mt-3 line-clamp-2">{description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PERSONALITY */}
          {currentStep === 'personality' && (
            <div>
              <h2 className="comic-heading text-xl mb-2">PERSONALITY & CHARACTER</h2>
              <p className="text-sm text-brand-gray-medium mb-4 font-body">
                Define {name ? name.toUpperCase() : 'your companion'}&apos;s personality using character files.
                Each tab represents a different aspect of behavior. You can skip this and come back later.
              </p>

              {/* Upload option */}
              <div className="mb-4">
                <label className="comic-btn-outline text-xs inline-block cursor-pointer">
                  UPLOAD .MD FILE
                  <input
                    type="file"
                    accept=".md,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (file.size > 50000) { setError('File too large. Max 50KB.'); return }
                      const reader = new FileReader()
                      reader.onload = (ev) => {
                        const content = ev.target?.result as string || ''
                        setCharacterFiles(prev => ({ ...prev, SOUL: content }))
                        setError('')
                      }
                      reader.readAsText(file)
                    }}
                  />
                </label>
                <span className="text-xs text-brand-gray-medium ml-3">Upload to SOUL tab</span>
              </div>

              <CharacterEditor files={characterFiles} onChange={setCharacterFiles} />
            </div>
          )}

          {/* STEP 3: TOOLS & CONFIG */}
          {currentStep === 'tools' && (
            <div>
              <h2 className="comic-heading text-xl mb-2">TOOLS & CAPABILITIES</h2>
              <p className="text-sm text-brand-gray-medium mb-6 font-body">
                Configure what tools your companion can use when deployed via Telegram.
              </p>

              <div className="comic-card p-6 space-y-6">
                {/* Browser */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-sm uppercase">Web Browsing</h3>
                    <p className="text-xs text-brand-gray-medium mt-0.5">Allow the companion to browse the web and fetch information</p>
                  </div>
                  <ToggleSwitch
                    checked={toolsConfig.browser}
                    onChange={(v) => setToolsConfig(prev => ({ ...prev, browser: v }))}
                  />
                </div>
                <div className="h-px bg-gray-200" />

                {/* Reactions */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-sm uppercase">Telegram Reactions</h3>
                    <p className="text-xs text-brand-gray-medium mt-0.5">React to messages with emojis in Telegram chats</p>
                  </div>
                  <ToggleSwitch
                    checked={toolsConfig.reactions}
                    onChange={(v) => setToolsConfig(prev => ({ ...prev, reactions: v }))}
                  />
                </div>
                <div className="h-px bg-gray-200" />

                {/* Stickers */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-sm uppercase">Telegram Stickers</h3>
                    <p className="text-xs text-brand-gray-medium mt-0.5">Send stickers in conversations for more expressive communication</p>
                  </div>
                  <ToggleSwitch
                    checked={toolsConfig.stickers}
                    onChange={(v) => setToolsConfig(prev => ({ ...prev, stickers: v }))}
                  />
                </div>
              </div>

              {/* Custom instructions */}
              <div className="mt-6">
                <label className="block font-display font-bold text-sm uppercase mb-2">Custom Instructions (Optional)</label>
                <textarea
                  value={customInstructions}
                  onChange={e => setCustomInstructions(e.target.value)}
                  placeholder="Add any extra instructions for how your companion should behave with these tools..."
                  rows={4}
                  maxLength={2000}
                  className="w-full px-4 py-3 border-3 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow transition resize-none font-mono text-sm"
                />
                <p className="text-xs text-brand-gray-medium mt-1">{customInstructions.length}/2000 characters</p>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & PUBLISH */}
          {currentStep === 'publish' && (
            <div>
              <h2 className="comic-heading text-xl mb-6">REVIEW & PUBLISH</h2>

              {/* Summary card */}
              <div className="comic-card p-6 mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm uppercase text-brand-gray-medium">Companion</span>
                  <div className="flex items-center gap-2">
                    {iconUrl ? (
                      <img src={iconUrl} alt="" className="w-6 h-6 rounded-full border-2 border-black object-cover" />
                    ) : (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-black"
                        style={{ backgroundColor: `${color}30` }}
                      >
                        <span className="font-display font-black text-[10px]">{name ? name.charAt(0).toUpperCase() : '?'}</span>
                      </div>
                    )}
                    <span className="font-display font-bold text-sm">{name.toUpperCase() || 'UNNAMED'}</span>
                  </div>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm uppercase text-brand-gray-medium">Role</span>
                  <span className="font-display font-bold text-sm">{role || 'Not set'}</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm uppercase text-brand-gray-medium">Description</span>
                  <span className="font-display text-sm text-right max-w-[200px] truncate">{description || 'None'}</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm uppercase text-brand-gray-medium">Category</span>
                  <span className="font-display font-bold text-sm capitalize">{category}</span>
                </div>
                {tags.length > 0 && (
                  <>
                    <div className="h-px bg-gray-200" />
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-sm uppercase text-brand-gray-medium">Tags</span>
                      <span className="font-display text-sm">{tags.map(t => `#${t}`).join(', ')}</span>
                    </div>
                  </>
                )}
                <div className="h-px bg-gray-200" />
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm uppercase text-brand-gray-medium">Character Files</span>
                  <span className="font-display font-bold text-sm">
                    {totalCharSize > 0 ? `${(totalCharSize / 1024).toFixed(1)} KB` : 'Empty'}
                  </span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm uppercase text-brand-gray-medium">Tools</span>
                  <span className="font-display text-sm">
                    {[
                      toolsConfig.browser && 'Browser',
                      toolsConfig.reactions && 'Reactions',
                      toolsConfig.stickers && 'Stickers',
                    ].filter(Boolean).join(', ') || 'None'}
                  </span>
                </div>
              </div>

              {/* Verified via Google */}
              {user?.email && (
                <div className="flex items-center gap-2 text-green-600 mb-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span className="font-display font-bold text-sm">Verified as {user.email}</span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-6 p-4 border-3 border-red-500 bg-red-50 text-red-700 font-display font-bold text-sm">
                  {error}
                </div>
              )}

              {/* Publish button */}
              <button
                onClick={handlePublish}
                disabled={submitting || !name.trim() || !user?.email}
                className="comic-btn w-full text-lg py-4 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {submitting ? 'PUBLISHING...' : 'PUBLISH TO COMMUNITY'}
              </button>
              <p className="text-xs text-brand-gray-medium text-center mt-3">
                Your companion will be visible to all users in the Community section. Max 3 per user.
              </p>
            </div>
          )}
        </div>

        {/* Error (for non-publish steps) */}
        {error && currentStep !== 'publish' && (
          <div className="mt-4 p-4 border-3 border-red-500 bg-red-50 text-red-700 font-display font-bold text-sm">
            {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-10 flex items-center justify-between">
          {currentStepIndex > 0 ? (
            <button onClick={handleBack} className="comic-btn-outline text-sm py-3 px-6">
              &larr; BACK
            </button>
          ) : (
            <div />
          )}

          {currentStep !== 'publish' && (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="comic-btn text-sm py-3 px-8 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
            >
              {currentStep === 'tools' ? 'REVIEW' : 'NEXT'} &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 border-3 border-black transition-colors duration-200 ${
        checked ? 'bg-brand-yellow' : 'bg-gray-200'
      }`}
    >
      <div
        className={`absolute top-0.5 w-4 h-4 bg-black transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

'use client'

import { useState } from 'react'
import { CHARACTER_FILE_NAMES, CHARACTER_FILE_DESCRIPTIONS, type CharacterFiles, type CharacterFileName } from '@/lib/character-files'

interface CharacterEditorProps {
  files: CharacterFiles
  onChange: (files: CharacterFiles) => void
}

export function CharacterEditor({ files, onChange }: CharacterEditorProps) {
  const [activeTab, setActiveTab] = useState<CharacterFileName>('SOUL')

  const handleChange = (value: string) => {
    onChange({ ...files, [activeTab]: value })
  }

  const totalSize = Object.values(files).reduce((sum, content) => sum + new TextEncoder().encode(content).byteLength, 0)
  const maxSize = 8 * 1024

  return (
    <div className="comic-card p-6">
      {/* Tab buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CHARACTER_FILE_NAMES.map((name) => (
          <button
            key={name}
            onClick={() => setActiveTab(name)}
            className={`px-4 py-2 border-3 border-black font-display font-bold uppercase text-xs transition-all duration-200 ${
              activeTab === name
                ? 'bg-black text-white'
                : 'bg-white text-black shadow-comic-sm hover:shadow-comic'
            }`}
          >
            {name}.md
          </button>
        ))}
      </div>

      {/* Description hint */}
      <p className="text-sm text-brand-gray-medium mb-2 font-display">
        {CHARACTER_FILE_DESCRIPTIONS[activeTab]}
      </p>

      {/* Textarea */}
      <textarea
        value={files[activeTab]}
        onChange={(e) => handleChange(e.target.value)}
        rows={12}
        className="w-full px-4 py-3 border-3 border-black focus:ring-2 focus:ring-brand-yellow focus:outline-none font-mono text-sm resize-y"
        placeholder={`Write your ${activeTab}.md content here...`}
      />

      {/* Footer stats */}
      <div className="flex justify-between items-center mt-2 text-xs font-display">
        <span className="text-brand-gray-medium">
          {files[activeTab].length} chars
        </span>
        <span className={totalSize > maxSize ? 'text-red-600 font-bold' : 'text-brand-gray-medium'}>
          {(totalSize / 1024).toFixed(1)} KB / {(maxSize / 1024).toFixed(0)} KB total
        </span>
      </div>
      {totalSize > maxSize && (
        <p className="text-red-600 text-xs font-display font-bold mt-1">
          Total character file size exceeds 8 KB limit. Please shorten some files before deploying.
        </p>
      )}
    </div>
  )
}

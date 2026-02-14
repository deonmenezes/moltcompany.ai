'use client'

const models = [
  {
    id: 'claude-opus',
    provider: 'anthropic',
    name: 'anthropic/claude-opus-4-5-20250514',
    label: 'Claude Opus 4.5',
    company: 'Anthropic',
    logo: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M17.304 3.541l-5.296 16.918h3.273L20.578 3.54h-3.274zm-10.608 0L1.422 20.46h3.274l1.26-4.042h5.578l1.259 4.042h3.274L10.77 3.54H6.696zm2.037 4.81L10.86 13.9H6.607l2.126-5.55z"/>
      </svg>
    ),
  },
  {
    id: 'gpt-5',
    provider: 'openai',
    name: 'openai/gpt-5.2',
    label: 'GPT-5.2',
    company: 'OpenAI',
    logo: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
      </svg>
    ),
  },
  {
    id: 'gemini-3',
    provider: 'google',
    name: 'google/gemini-3-flash',
    label: 'Gemini 3 Flash',
    company: 'Google',
    logo: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 2.4A9.6 9.6 0 0121.6 12 9.6 9.6 0 0112 21.6 9.6 9.6 0 012.4 12 9.6 9.6 0 0112 2.4z"/>
      </svg>
    ),
  },
]

export function ModelSelector({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (model: typeof models[0]) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {models.map((model) => (
        <button
          key={model.id}
          onClick={() => onSelect(model)}
          className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
            selected === model.id
              ? 'border-accent-blue selected-glow bg-accent-blue/10'
              : 'border-dark-border bg-dark-card hover:border-gray-600'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={selected === model.id ? 'text-accent-blue' : 'text-gray-400'}>
              {model.logo}
            </div>
            <div>
              <div className="font-semibold text-white">{model.label}</div>
              <div className="text-xs text-gray-500">{model.company}</div>
            </div>
          </div>
          {selected === model.id && (
            <div className="text-xs text-accent-blue mt-2">Selected</div>
          )}
        </button>
      ))}
    </div>
  )
}

export { models }

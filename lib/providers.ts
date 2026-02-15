export type LLMProvider = {
  id: string
  name: string
  envVar: string
  models: { id: string; label: string }[]
  keyPlaceholder: string
  keyHelpUrl: string
}

export const llmProviders: LLMProvider[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    envVar: 'ANTHROPIC_API_KEY',
    models: [
      { id: 'anthropic/claude-opus-4-5-20250514', label: 'Claude Opus 4.5' },
      { id: 'anthropic/claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
    ],
    keyPlaceholder: 'sk-ant-api03-...',
    keyHelpUrl: 'https://console.anthropic.com/settings/keys',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    envVar: 'OPENAI_API_KEY',
    models: [
      { id: 'openai/gpt-5.2', label: 'GPT-5.2' },
      { id: 'openai/gpt-4.1', label: 'GPT-4.1' },
    ],
    keyPlaceholder: 'sk-...',
    keyHelpUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'google',
    name: 'Google',
    envVar: 'GEMINI_API_KEY',
    models: [
      { id: 'google/gemini-3-flash', label: 'Gemini 3 Flash' },
      { id: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    ],
    keyPlaceholder: 'AIza...',
    keyHelpUrl: 'https://aistudio.google.com/apikey',
  },
  {
    id: 'kimi',
    name: 'Moonshot AI',
    envVar: 'MOONSHOT_API_KEY',
    models: [
      { id: 'kimi/kimi-k2.5', label: 'Kimi K2.5' },
    ],
    keyPlaceholder: 'sk-...',
    keyHelpUrl: 'https://platform.moonshot.cn/console/api-keys',
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    envVar: 'MINIMAX_API_KEY',
    models: [
      { id: 'minimax/MiniMax-M2.1', label: 'MiniMax M2.1' },
    ],
    keyPlaceholder: 'eyJ...',
    keyHelpUrl: 'https://platform.minimaxi.com/user-center/basic-information/interface-key',
  },
]

export function getProviderById(id: string) {
  return llmProviders.find(p => p.id === id)
}

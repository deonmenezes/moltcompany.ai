export const skillCategories = [
  { id: 'all', label: 'All Skills' },
  { id: 'communication', label: 'Communication' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'development', label: 'Development' },
  { id: 'media', label: 'Media' },
  { id: 'smart-home', label: 'Smart Home' },
  { id: 'ai-models', label: 'AI & Models' },
  { id: 'voice', label: 'Voice' },
  { id: 'automation', label: 'Automation' },
  { id: 'security', label: 'Security' },
  { id: 'system', label: 'System' },
] as const

export type SkillCategory = typeof skillCategories[number]['id']

export interface Skill {
  id: string
  name: string
  description: string
  category: SkillCategory
  emoji: string
  price: number
  featured?: boolean
}

export const skills: Skill[] = [
  // Communication
  { id: 'discord', name: 'Discord', description: 'Full Discord bot integration. Manage servers, send messages, moderate channels, and react to events.', category: 'communication', emoji: '💬', price: 10 },
  { id: 'slack', name: 'Slack', description: 'Connect your AI to Slack workspaces. Send messages, manage channels, and automate workflows.', category: 'communication', emoji: '📢', price: 10 },
  { id: 'wacli', name: 'WhatsApp', description: 'WhatsApp messaging automation. Send and receive messages, manage groups, and handle media.', category: 'communication', emoji: '📱', price: 10 },
  { id: 'imsg', name: 'iMessage', description: 'Native iMessage integration for macOS. Send and receive messages through Apple Messages.', category: 'communication', emoji: '🍎', price: 10 },
  { id: 'bluebubbles', name: 'BlueBubbles', description: 'Cross-platform iMessage access via BlueBubbles server. Chat from anywhere.', category: 'communication', emoji: '🫧', price: 10 },
  { id: 'himalaya', name: 'Email (Himalaya)', description: 'Full email client. Read, compose, reply, and organize emails across IMAP/SMTP accounts.', category: 'communication', emoji: '📧', price: 10 },

  // Productivity
  { id: 'apple-notes', name: 'Apple Notes', description: 'Create, read, and organize Apple Notes. Seamless integration with your existing notes.', category: 'productivity', emoji: '📝', price: 10 },
  { id: 'apple-reminders', name: 'Apple Reminders', description: 'Manage reminders and to-do lists through Apple Reminders. Set due dates and priorities.', category: 'productivity', emoji: '✅', price: 10 },
  { id: 'bear-notes', name: 'Bear Notes', description: 'Read and create notes in Bear. Full markdown support with tags and organization.', category: 'productivity', emoji: '🐻', price: 10 },
  { id: 'notion', name: 'Notion', description: 'Connect to your Notion workspace. Create pages, query databases, and manage content.', category: 'productivity', emoji: '📓', price: 10, featured: true },
  { id: 'obsidian', name: 'Obsidian', description: 'Access and manage your Obsidian vault. Create notes, search, and navigate your knowledge graph.', category: 'productivity', emoji: '💎', price: 10 },
  { id: 'things-mac', name: 'Things 3', description: 'Task management through Things 3 on macOS. Create tasks, projects, and manage your workflow.', category: 'productivity', emoji: '📋', price: 10 },
  { id: 'trello', name: 'Trello', description: 'Manage Trello boards, lists, and cards. Automate project workflows and track progress.', category: 'productivity', emoji: '📊', price: 10 },
  { id: 'gh-issues', name: 'GitHub Issues', description: 'Create, manage, and track GitHub issues. Automate issue triage and labeling.', category: 'productivity', emoji: '🐛', price: 10 },

  // Development
  { id: 'coding-agent', name: 'Coding Agent', description: 'Spawn coding sub-agents. Run Codex, Claude Code, or other coding tools programmatically.', category: 'development', emoji: '👨‍💻', price: 10, featured: true },
  { id: 'github', name: 'GitHub', description: 'Full GitHub integration. Manage repos, PRs, branches, and automate development workflows.', category: 'development', emoji: '🐙', price: 10 },
  { id: 'nano-pdf', name: 'Nano PDF', description: 'Edit PDFs with natural language. Merge, split, watermark, and transform PDF documents.', category: 'development', emoji: '📄', price: 10 },
  { id: 'skill-creator', name: 'Skill Creator', description: 'Build and package new OpenClaw skills. Design, structure, and publish your own agent skills.', category: 'development', emoji: '🔧', price: 10 },

  // Media
  { id: 'video-frames', name: 'Video Frames', description: 'Extract frames and clips from videos using ffmpeg. Perfect for video analysis and thumbnails.', category: 'media', emoji: '🎬', price: 10 },
  { id: 'openai-image-gen', name: 'AI Image Generation', description: 'Generate images with OpenAI DALL-E. Create visuals from text descriptions on demand.', category: 'media', emoji: '🎨', price: 10, featured: true },
  { id: 'openai-whisper', name: 'Whisper (Local)', description: 'Local speech-to-text with OpenAI Whisper. Transcribe audio files without API costs.', category: 'media', emoji: '🎙️', price: 10 },
  { id: 'openai-whisper-api', name: 'Whisper API', description: 'Cloud-based speech-to-text via OpenAI API. Fast, accurate transcription with minimal setup.', category: 'media', emoji: '☁️', price: 10 },
  { id: 'gifgrep', name: 'GifGrep', description: 'Search and find the perfect GIF. Integrate GIF search into conversations and responses.', category: 'media', emoji: '🎞️', price: 10 },
  { id: 'songsee', name: 'SongSee', description: 'Identify songs from audio. Recognize music playing around you or in audio files.', category: 'media', emoji: '🎵', price: 10 },
  { id: 'spotify-player', name: 'Spotify Player', description: 'Control Spotify playback. Play, pause, skip, queue songs, and manage playlists.', category: 'media', emoji: '🎧', price: 10 },

  // Smart Home
  { id: 'openhue', name: 'Philips Hue', description: 'Control Philips Hue lights. Set colors, brightness, scenes, and automate lighting.', category: 'smart-home', emoji: '💡', price: 10 },
  { id: 'sonoscli', name: 'Sonos', description: 'Control Sonos speakers. Play music, adjust volume, group rooms, and manage queues.', category: 'smart-home', emoji: '🔊', price: 10 },
  { id: 'peekaboo', name: 'Peekaboo (Camera)', description: 'Access and manage security cameras. Snap photos, check feeds, and monitor your space.', category: 'smart-home', emoji: '📸', price: 10 },

  // AI & Models
  { id: 'gemini', name: 'Gemini', description: 'Access Google Gemini models. Use Gemini for reasoning, analysis, and multimodal tasks.', category: 'ai-models', emoji: '♊', price: 10 },
  { id: 'oracle', name: 'Oracle', description: 'Advanced prediction and decision-making engine. Get data-driven insights and forecasts.', category: 'ai-models', emoji: '🔮', price: 10 },
  { id: 'model-usage', name: 'Model Usage', description: 'Track and analyze AI model usage across sessions. Monitor costs, tokens, and performance.', category: 'ai-models', emoji: '📈', price: 10 },
  { id: 'summarize', name: 'Summarize', description: 'Intelligent content summarization. Condense articles, documents, and conversations.', category: 'ai-models', emoji: '📰', price: 10 },

  // Voice
  { id: 'sag', name: 'ElevenLabs TTS', description: 'Premium text-to-speech with ElevenLabs. Natural voices, multiple languages, emotional range.', category: 'voice', emoji: '🗣️', price: 10, featured: true },
  { id: 'sherpa-onnx-tts', name: 'Sherpa TTS', description: 'Offline text-to-speech with Sherpa ONNX. Fast, private, no API keys required.', category: 'voice', emoji: '🔈', price: 10 },
  { id: 'voice-call', name: 'Voice Call', description: 'Make and receive voice calls through your AI. Real-time conversation over phone.', category: 'voice', emoji: '📞', price: 10 },

  // Automation
  { id: 'canvas', name: 'Canvas', description: 'Render dynamic UI canvases. Present interactive dashboards, charts, and visual content.', category: 'automation', emoji: '🖼️', price: 10 },
  { id: 'food-order', name: 'Food Order', description: 'Automate food ordering from local restaurants. Browse menus, place orders, track delivery.', category: 'automation', emoji: '🍕', price: 10 },
  { id: 'ordercli', name: 'OrderCLI', description: 'Command-line order management. Track shipments, manage purchases, and automate reorders.', category: 'automation', emoji: '📦', price: 10 },
  { id: 'goplaces', name: 'GoPlaces', description: 'Location-aware navigation and recommendations. Find places, get directions, explore areas.', category: 'automation', emoji: '🗺️', price: 10 },
  { id: 'weather', name: 'Weather', description: 'Real-time weather data and forecasts. No API key required. Current conditions and multi-day outlook.', category: 'automation', emoji: '⛅', price: 10 },
  { id: 'blogwatcher', name: 'BlogWatcher', description: 'Monitor blogs and websites for new content. Get notified when your favorite sources publish.', category: 'automation', emoji: '👁️', price: 10 },
  { id: 'session-logs', name: 'Session Logs', description: 'Access and search through session transcripts. Review past conversations and extract insights.', category: 'automation', emoji: '📜', price: 10 },
  { id: 'camsnap', name: 'CamSnap', description: 'Quick camera snapshots from connected devices. Capture moments on command.', category: 'automation', emoji: '📷', price: 10 },

  // Security
  { id: '1password', name: '1Password', description: 'Secure password and secret management. Access vaults, retrieve credentials, generate passwords.', category: 'security', emoji: '🔐', price: 10, featured: true },
  { id: 'healthcheck', name: 'Healthcheck', description: 'Host security hardening and risk assessment. Audit firewalls, SSH, updates, and exposure.', category: 'security', emoji: '🛡️', price: 10 },

  // System
  { id: 'tmux', name: 'Tmux', description: 'Terminal multiplexer control. Manage sessions, windows, and panes programmatically.', category: 'system', emoji: '🖥️', price: 10 },
  { id: 'mcporter', name: 'MCPorter', description: 'MCP server management. Install, configure, and route Model Context Protocol servers.', category: 'system', emoji: '🔌', price: 10 },
  { id: 'blucli', name: 'BluCLI', description: 'Bluetooth device management from the command line. Scan, connect, and control BT devices.', category: 'system', emoji: '🦷', price: 10 },
  { id: 'eightctl', name: 'EightCTL', description: 'Eight Sleep smart mattress control. Adjust temperature, view sleep data, manage schedules.', category: 'system', emoji: '🛏️', price: 10 },
  { id: 'xurl', name: 'XURL', description: 'Advanced URL fetching and web scraping. Extract content, follow redirects, parse responses.', category: 'system', emoji: '🌐', price: 10 },
  { id: 'nano-banana-pro', name: 'Nano Banana Pro', description: 'Hardware integration for Nano Banana Pro boards. IoT automation and sensor control.', category: 'system', emoji: '🍌', price: 10 },
  { id: 'gog', name: 'GOG', description: 'GOG Galaxy game library management. Browse, install, and organize your game collection.', category: 'system', emoji: '🎮', price: 10 },
]

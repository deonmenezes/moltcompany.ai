import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0a0f',
          card: '#1a1a2e',
          border: '#2a2a3e',
        },
        accent: {
          blue: '#3b82f6',
          purple: '#8b5cf6',
        },
      },
    },
  },
  plugins: [],
}
export default config

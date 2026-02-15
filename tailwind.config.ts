import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FFD600',
          'yellow-light': '#FFDE00',
          'yellow-hover': '#E6C100',
          black: '#000000',
          white: '#FFFFFF',
          gray: '#F5F5F5',
          'gray-dark': '#333333',
          'gray-medium': '#666666',
          'gray-light': '#999999',
        },
        // Legacy tokens kept during migration
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
      fontFamily: {
        display: ['var(--font-display)', 'Inter', 'sans-serif'],
        body: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      borderWidth: {
        '3': '3px',
      },
      boxShadow: {
        'comic': '4px 4px 0px 0px #000000',
        'comic-sm': '2px 2px 0px 0px #000000',
        'comic-hover': '6px 6px 0px 0px #000000',
        'comic-active': '1px 1px 0px 0px #000000',
      },
    },
  },
  plugins: [],
}
export default config

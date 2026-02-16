'use client'

import { useState } from 'react'

const COUNTRIES = [
  { code: '+1', flag: '🇺🇸', name: 'US' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+82', flag: '🇰🇷', name: 'Korea' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey' },
  { code: '+20', flag: '🇪🇬', name: 'Egypt' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+63', flag: '🇵🇭', name: 'Philippines' },
  { code: '+62', flag: '🇮🇩', name: 'Indonesia' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+66', flag: '🇹🇭', name: 'Thailand' },
  { code: '+84', flag: '🇻🇳', name: 'Vietnam' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+48', flag: '🇵🇱', name: 'Poland' },
  { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
  { code: '+46', flag: '🇸🇪', name: 'Sweden' },
  { code: '+47', flag: '🇳🇴', name: 'Norway' },
  { code: '+45', flag: '🇩🇰', name: 'Denmark' },
  { code: '+41', flag: '🇨🇭', name: 'Switzerland' },
  { code: '+43', flag: '🇦🇹', name: 'Austria' },
  { code: '+32', flag: '🇧🇪', name: 'Belgium' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+30', flag: '🇬🇷', name: 'Greece' },
  { code: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: '+972', flag: '🇮🇱', name: 'Israel' },
  { code: '+64', flag: '🇳🇿', name: 'New Zealand' },
  { code: '+1', flag: '🇨🇦', name: 'Canada' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
]

export function PhoneInput({
  value,
  onChange,
  autoFocus,
}: {
  value: string
  onChange: (fullNumber: string) => void
  autoFocus?: boolean
}) {
  const [countryCode, setCountryCode] = useState('+1')
  const [number, setNumber] = useState(() => {
    // If value already starts with a code, extract the number part
    if (value) {
      const match = COUNTRIES.find(c => value.startsWith(c.code))
      if (match) return value.slice(match.code.length).trim()
    }
    return value.replace(/^\+\d+\s*/, '')
  })
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selectedCountry = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0]

  const handleNumberChange = (num: string) => {
    // Only allow digits and spaces
    const cleaned = num.replace(/[^\d\s]/g, '')
    setNumber(cleaned)
    onChange(`${countryCode}${cleaned.replace(/\s/g, '')}`)
  }

  const handleCountrySelect = (code: string) => {
    setCountryCode(code)
    setDropdownOpen(false)
    setSearch('')
    onChange(`${code}${number.replace(/\s/g, '')}`)
  }

  const filtered = search
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.includes(search)
      )
    : COUNTRIES

  return (
    <div className="relative">
      <div className="flex">
        {/* Country code button */}
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 px-3 border-3 border-r-0 border-black bg-gray-50 hover:bg-gray-100 transition font-body text-sm shrink-0"
        >
          <span className="text-lg">{selectedCountry.flag}</span>
          <span className="font-bold">{countryCode}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        {/* Phone number input */}
        <input
          type="tel"
          value={number}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder="Phone number"
          className="flex-1 min-w-0 border-3 border-black px-4 py-3 font-body text-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          autoFocus={autoFocus}
        />
      </div>

      {/* Dropdown */}
      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setDropdownOpen(false); setSearch('') }} />
          <div className="absolute top-full left-0 mt-1 w-72 max-h-64 overflow-y-auto bg-white border-3 border-black shadow-comic z-50">
            <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                className="w-full px-3 py-2 border-2 border-black text-sm focus:outline-none focus:ring-1 focus:ring-brand-yellow"
                autoFocus
              />
            </div>
            {filtered.map((country, i) => (
              <button
                key={`${country.code}-${country.name}-${i}`}
                type="button"
                onClick={() => handleCountrySelect(country.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-brand-yellow/20 transition text-sm ${
                  country.code === countryCode ? 'bg-brand-yellow/10 font-bold' : ''
                }`}
              >
                <span className="text-lg">{country.flag}</span>
                <span className="font-display font-bold">{country.name}</span>
                <span className="text-brand-gray-medium ml-auto">{country.code}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'

interface ThemeToggleProps {
  variant?: 'pill' | 'icon'
  className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'pill', className = '' }) => {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Consistently render 'dark' during SSR and initial hydration pass
  const isDark = mounted ? theme === 'dark' : true

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        suppressHydrationWarning
        aria-label={mounted ? `Switch to ${isDark ? 'Light' : 'Dark'} Mode` : 'Switch Theme'}
        title={mounted ? `Current: ${isDark ? 'Deep Space (Dark)' : 'Sunrise Air (Light)'}. Click to switch.` : 'Toggle Theme'}
        className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 ${className}`}
        style={{
          background: 'var(--card)',
          border: '1px solid var(--glass-border)',
          color: 'var(--foreground)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: 'var(--glass-shadow)',
        }}
      >
        <div className="relative w-4 h-4">
          <Sun
            size={16}
            className={`absolute inset-0 transition-all duration-500 transform ${
              isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100 text-amber-500'
            }`}
          />
          <Moon
            size={16}
            className={`absolute inset-0 transition-all duration-500 transform ${
              isDark ? 'opacity-100 rotate-0 scale-100 text-cyan-400' : 'opacity-0 -rotate-90 scale-50'
            }`}
          />
        </div>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      suppressHydrationWarning
      aria-label={mounted ? `Switch to ${isDark ? 'Light' : 'Dark'} Mode` : 'Switch Theme'}
      title={mounted ? `Current: ${isDark ? 'Deep Space (Dark Mode)' : 'Sunrise Air (Light Mode)'}. Click to switch.` : 'Toggle Theme'}
      className={`group relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${className}`}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--glass-border)',
        color: 'var(--foreground)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: 'var(--glass-shadow)',
      }}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        <Sun
          size={14}
          strokeWidth={2.2}
          className={`absolute transition-all duration-500 ${
            isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100 text-amber-500'
          }`}
        />
        <Moon
          size={14}
          strokeWidth={2.2}
          className={`absolute transition-all duration-500 ${
            isDark ? 'opacity-100 rotate-0 scale-100 text-cyan-400' : 'opacity-0 -rotate-90 scale-50'
          }`}
        />
      </div>
      <span className="tracking-tight text-[12px] font-semibold transition-colors duration-300" suppressHydrationWarning>
        {isDark ? 'Deep Space' : 'Sunrise Air'}
      </span>
      <span
        className="w-1.5 h-1.5 rounded-full transition-colors duration-500"
        style={{
          backgroundColor: isDark ? '#06B6D4' : '#FF8A00',
          boxShadow: isDark ? '0 0 8px #06B6D4' : '0 0 8px #FF8A00',
        }}
      />
    </button>
  )
}

export default ThemeToggle

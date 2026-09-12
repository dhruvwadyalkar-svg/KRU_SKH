'use client'

import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'

export const AmbientBlooms: React.FC = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <>
      {/* 1.5% Opacity Physical Tactile SVG Noise Grain Overlay behind content */}
      <div className="noise-overlay" aria-hidden="true" style={{ zIndex: -1 }} />

      {/* Atmospheric Radial Blooms Container - Strictly behind all content (-z-10 / zIndex: -1) */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden -z-10"
        aria-hidden="true"
        style={{
          zIndex: -1,
          pointerEvents: 'none',
          transition: 'background-color 700ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* LIGHT MODE BLOOMS: Gentle Sunlight + Soft Sky Blue (subtle ambient tints, never blurring foreground) */}
        <div
          className="absolute inset-0 transition-opacity duration-700 ease-out pointer-events-none"
          style={{
            opacity: isDark ? 0 : 1,
          }}
        >
          {/* Soft Sunlight Radial Bloom (Top-Right) */}
          <div
            className="absolute -top-[15%] right-[5%] w-[650px] h-[650px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255, 209, 128, 0.25) 0%, rgba(255, 209, 128, 0.1) 60%, transparent 100%)',
              filter: 'blur(100px)',
              opacity: 0.18,
              animation: 'mesh-1 28s ease-in-out infinite alternate',
            }}
          />

          {/* Sky Blue Radial Bloom (Top-Left / Center) */}
          <div
            className="absolute -top-[10%] -left-[10%] w-[650px] h-[650px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(219, 234, 254, 0.35) 0%, rgba(219, 234, 254, 0.12) 55%, transparent 100%)',
              filter: 'blur(100px)',
              opacity: 0.15,
              animation: 'mesh-2 36s ease-in-out infinite alternate',
            }}
          />

          {/* Subtle Ambient Bottom-Center Azure Accent Bloom */}
          <div
            className="absolute top-[45%] left-[20%] w-[700px] h-[700px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(191, 219, 254, 0.2) 0%, rgba(224, 242, 254, 0.08) 60%, transparent 100%)',
              filter: 'blur(120px)',
              opacity: 0.12,
              animation: 'mesh-3 40s ease-in-out infinite alternate',
            }}
          />
        </div>

        {/* DARK MODE BLOOMS: Deep Obsidian Space + Electric Blue (#3B82F6) + Neon Cyan (#06B6D4) */}
        <div
          className="absolute inset-0 transition-opacity duration-700 ease-out pointer-events-none"
          style={{
            opacity: isDark ? 1 : 0,
          }}
        >
          {/* Electric Blue Deep Space Nebula */}
          <div
            className="absolute -top-[20%] right-[10%] w-[700px] h-[700px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.08) 50%, transparent 80%)',
              filter: 'blur(120px)',
              opacity: 0.35,
              animation: 'mesh-2 32s ease-in-out infinite alternate',
            }}
          />

          {/* Neon Cyan Cosmic Bloom */}
          <div
            className="absolute top-[10%] -left-[15%] w-[650px] h-[650px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, rgba(14, 165, 233, 0.06) 55%, transparent 85%)',
              filter: 'blur(110px)',
              opacity: 0.3,
              animation: 'mesh-1 30s ease-in-out infinite alternate',
            }}
          />

          {/* Deep Core Cosmic Accent */}
          <div
            className="absolute top-[55%] right-[20%] w-[850px] h-[850px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, rgba(30, 58, 138, 0.05) 60%, transparent 90%)',
              filter: 'blur(130px)',
              opacity: 0.25,
              animation: 'mesh-3 42s ease-in-out infinite alternate',
            }}
          />
        </div>
      </div>
    </>
  )
}

export default AmbientBlooms

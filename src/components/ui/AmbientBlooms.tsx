'use client'

import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'

export const AmbientBlooms: React.FC = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <>
      {/* 2% Opacity Physical Tactile SVG Noise Grain Overlay */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* Atmospheric Radial Blooms Container */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
        aria-hidden="true"
        style={{
          transition: 'background-color 700ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* LIGHT MODE BLOOMS: Sunlight (#FFD180 @ 40%, 120px blur) + Sky Blue (#DBEAFE @ 80%, 120px blur) */}
        <div
          className="absolute inset-0 transition-opacity duration-700 ease-out"
          style={{
            opacity: isDark ? 0 : 1,
          }}
        >
          {/* Soft Sunlight Radial Bloom (Top-Right Hero) */}
          <div
            className="absolute -top-[15%] right-[5%] w-[650px] h-[650px] rounded-full"
            style={{
              background: 'radial-gradient(circle, #FFD180 0%, rgba(255, 209, 128, 0.4) 60%, transparent 100%)',
              filter: 'blur(120px)',
              opacity: 0.45,
              animation: 'mesh-1 28s ease-in-out infinite alternate',
            }}
          />

          {/* Sky Blue Radial Bloom (Top-Left / Center) */}
          <div
            className="absolute -top-[10%] -left-[10%] w-[750px] h-[750px] rounded-full"
            style={{
              background: 'radial-gradient(circle, #DBEAFE 0%, rgba(219, 234, 254, 0.8) 55%, transparent 100%)',
              filter: 'blur(120px)',
              opacity: 0.85,
              animation: 'mesh-2 36s ease-in-out infinite alternate',
            }}
          />

          {/* Subtle Ambient Bottom-Center Azure Accent Bloom */}
          <div
            className="absolute top-[45%] left-[20%] w-[800px] h-[800px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(191, 219, 254, 0.5) 0%, rgba(224, 242, 254, 0.25) 60%, transparent 100%)',
              filter: 'blur(140px)',
              opacity: 0.6,
              animation: 'mesh-3 40s ease-in-out infinite alternate',
            }}
          />
        </div>

        {/* DARK MODE BLOOMS: Deep Obsidian Space + Electric Blue (#3B82F6) + Neon Cyan (#06B6D4) */}
        <div
          className="absolute inset-0 transition-opacity duration-700 ease-out"
          style={{
            opacity: isDark ? 1 : 0,
          }}
        >
          {/* Electric Blue Deep Space Nebula */}
          <div
            className="absolute -top-[20%] right-[10%] w-[700px] h-[700px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.12) 50%, transparent 80%)',
              filter: 'blur(130px)',
              opacity: 0.8,
              animation: 'mesh-2 32s ease-in-out infinite alternate',
            }}
          />

          {/* Neon Cyan Cosmic Bloom */}
          <div
            className="absolute top-[10%] -left-[15%] w-[650px] h-[650px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.22) 0%, rgba(14, 165, 233, 0.08) 55%, transparent 85%)',
              filter: 'blur(120px)',
              opacity: 0.75,
              animation: 'mesh-1 30s ease-in-out infinite alternate',
            }}
          />

          {/* Deep Core Cosmic Accent */}
          <div
            className="absolute top-[55%] right-[20%] w-[850px] h-[850px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.16) 0%, rgba(30, 58, 138, 0.08) 60%, transparent 90%)',
              filter: 'blur(150px)',
              opacity: 0.7,
              animation: 'mesh-3 42s ease-in-out infinite alternate',
            }}
          />
        </div>
      </div>
    </>
  )
}

export default AmbientBlooms

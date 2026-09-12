'use client'

import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import FallingLeaves from './FallingLeaves'

export const AmbientBlooms: React.FC = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <>
      {/* 1.5% Opacity Physical Tactile SVG Noise Grain Overlay behind content */}
      <div className="noise-overlay" aria-hidden="true" style={{ zIndex: -1 }} />

      {/* Falling Autumn Leaves (Active in Light Mode) */}
      <FallingLeaves />

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
        {/* LIGHT MODE BLOOMS: Warm Sunrise Sunlight + Soft Morning Sky Blue */}
        <div
          className="absolute inset-0 transition-opacity duration-700 ease-out pointer-events-none"
          style={{
            opacity: isDark ? 0 : 1,
            background: 'radial-gradient(circle at 88% 16%, rgba(254, 243, 199, 0.55) 0%, rgba(255, 247, 237, 0.3) 45%, transparent 75%), radial-gradient(circle at 10% 12%, rgba(219, 234, 254, 0.45) 0%, transparent 60%)',
          }}
        >
          {/* Soft Golden Sunlight Radial Bloom (Top-Right) */}
          <div
            className="absolute -top-[15%] right-[2%] w-[800px] h-[800px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(254, 215, 170, 0.6) 0%, rgba(253, 186, 116, 0.25) 45%, transparent 75%)',
              filter: 'blur(90px)',
              opacity: 0.52,
              animation: 'mesh-1 28s ease-in-out infinite alternate',
            }}
          />

          {/* Sky Blue Radial Bloom (Top-Left / Center) */}
          <div
            className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(191, 219, 254, 0.65) 0%, rgba(147, 197, 253, 0.25) 50%, transparent 80%)',
              filter: 'blur(95px)',
              opacity: 0.5,
              animation: 'mesh-2 36s ease-in-out infinite alternate',
            }}
          />

          {/* Subtle Ambient Bottom-Center Amber Accent Bloom */}
          <div
            className="absolute top-[42%] right-[18%] w-[750px] h-[750px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(254, 243, 199, 0.45) 0%, rgba(255, 237, 213, 0.18) 55%, transparent 80%)',
              filter: 'blur(110px)',
              opacity: 0.4,
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

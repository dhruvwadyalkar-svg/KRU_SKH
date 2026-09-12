'use client'

import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import styles from './FallingLeaves.module.css'

interface FallingLeafItem {
  id: number
  type: 'leaf-1' | 'leaf-2' | 'diamond' | 'ring' | 'cross'
  left: string
  size: number
  color: string
  duration: number
  swayDuration: number
  delay: number
  driftX: number
  swayAmt: number
  rotEnd: number
  flipEnd: number
  opacity: number
  blur?: number
}

// 24 deterministic items distributed across the viewport
const PARTICLES: FallingLeafItem[] = [
  { id: 1, type: 'leaf-1', left: '4%', size: 24, color: '#F97316', duration: 14, swayDuration: 4.2, delay: -2, driftX: 60, swayAmt: 34, rotEnd: 320, flipEnd: 180, opacity: 0.88 },
  { id: 2, type: 'leaf-2', left: '12%', size: 20, color: '#FB923C', duration: 17, swayDuration: 4.8, delay: -8, driftX: -45, swayAmt: 28, rotEnd: 240, flipEnd: 140, opacity: 0.82 },
  { id: 3, type: 'diamond', left: '18%', size: 13, color: '#F97316', duration: 19, swayDuration: 5.5, delay: -13, driftX: 50, swayAmt: 25, rotEnd: 180, flipEnd: 90, opacity: 0.65 },
  { id: 4, type: 'leaf-1', left: '26%', size: 22, color: '#EA580C', duration: 15, swayDuration: 3.9, delay: -5, driftX: 75, swayAmt: 38, rotEnd: 420, flipEnd: 220, opacity: 0.9 },
  { id: 5, type: 'ring', left: '32%', size: 18, color: '#FB923C', duration: 22, swayDuration: 6.0, delay: -11, driftX: -40, swayAmt: 22, rotEnd: 180, flipEnd: 0, opacity: 0.55 },
  { id: 6, type: 'leaf-2', left: '38%', size: 26, color: '#F97316', duration: 13, swayDuration: 4.0, delay: -1, driftX: 55, swayAmt: 32, rotEnd: 360, flipEnd: 190, opacity: 0.85 },
  { id: 7, type: 'cross', left: '44%', size: 14, color: '#F97316', duration: 20, swayDuration: 5.2, delay: -15, driftX: -30, swayAmt: 20, rotEnd: 270, flipEnd: 0, opacity: 0.6 },
  { id: 8, type: 'leaf-1', left: '52%', size: 18, color: '#FDBA74', duration: 18, swayDuration: 4.6, delay: -9, driftX: 65, swayAmt: 30, rotEnd: 300, flipEnd: 160, opacity: 0.75, blur: 1 },
  { id: 9, type: 'diamond', left: '59%', size: 12, color: '#F97316', duration: 16, swayDuration: 4.4, delay: -4, driftX: -55, swayAmt: 26, rotEnd: 220, flipEnd: 110, opacity: 0.6 },
  { id: 10, type: 'leaf-2', left: '66%', size: 25, color: '#FB923C', duration: 14, swayDuration: 3.8, delay: -6, driftX: 70, swayAmt: 40, rotEnd: 380, flipEnd: 200, opacity: 0.9 },
  { id: 11, type: 'leaf-1', left: '73%', size: 21, color: '#EA580C', duration: 16, swayDuration: 4.5, delay: -12, driftX: -60, swayAmt: 35, rotEnd: 290, flipEnd: 170, opacity: 0.85 },
  { id: 12, type: 'ring', left: '79%', size: 22, color: '#F97316', duration: 21, swayDuration: 5.8, delay: -14, driftX: 45, swayAmt: 24, rotEnd: 160, flipEnd: 0, opacity: 0.5 },
  { id: 13, type: 'leaf-2', left: '85%', size: 23, color: '#F97316', duration: 15, swayDuration: 4.1, delay: -3, driftX: 80, swayAmt: 36, rotEnd: 340, flipEnd: 180, opacity: 0.88 },
  { id: 14, type: 'diamond', left: '92%', size: 14, color: '#FB923C', duration: 18, swayDuration: 5.0, delay: -10, driftX: -50, swayAmt: 25, rotEnd: 200, flipEnd: 100, opacity: 0.65 },
  { id: 15, type: 'leaf-1', left: '97%', size: 19, color: '#FDBA74', duration: 17, swayDuration: 4.7, delay: -7, driftX: -40, swayAmt: 28, rotEnd: 260, flipEnd: 150, opacity: 0.75, blur: 1.2 },
  { id: 16, type: 'cross', left: '8%', size: 15, color: '#FB923C', duration: 19, swayDuration: 5.4, delay: -16, driftX: 40, swayAmt: 22, rotEnd: 180, flipEnd: 0, opacity: 0.55 },
  { id: 17, type: 'leaf-2', left: '22%', size: 17, color: '#F59E0B', duration: 16, swayDuration: 4.3, delay: -4, driftX: -65, swayAmt: 30, rotEnd: 310, flipEnd: 160, opacity: 0.78, blur: 0.8 },
  { id: 18, type: 'leaf-1', left: '35%', size: 27, color: '#F97316', duration: 12, swayDuration: 3.6, delay: -8, driftX: 85, swayAmt: 42, rotEnd: 400, flipEnd: 210, opacity: 0.92 },
  { id: 19, type: 'diamond', left: '48%', size: 11, color: '#F97316', duration: 20, swayDuration: 5.6, delay: -13, driftX: 35, swayAmt: 20, rotEnd: 190, flipEnd: 90, opacity: 0.55 },
  { id: 20, type: 'leaf-2', left: '62%', size: 22, color: '#EA580C', duration: 15, swayDuration: 4.2, delay: -2, driftX: -70, swayAmt: 36, rotEnd: 330, flipEnd: 175, opacity: 0.86 },
  { id: 21, type: 'ring', left: '70%', size: 17, color: '#FB923C', duration: 23, swayDuration: 6.2, delay: -17, driftX: 50, swayAmt: 25, rotEnd: 150, flipEnd: 0, opacity: 0.5 },
  { id: 22, type: 'leaf-1', left: '81%', size: 20, color: '#F97316', duration: 14, swayDuration: 3.9, delay: -6, driftX: -55, swayAmt: 32, rotEnd: 350, flipEnd: 190, opacity: 0.84 },
  { id: 23, type: 'cross', left: '89%', size: 13, color: '#F97316', duration: 21, swayDuration: 5.3, delay: -11, driftX: 30, swayAmt: 18, rotEnd: 220, flipEnd: 0, opacity: 0.6 },
  { id: 24, type: 'leaf-2', left: '15%', size: 24, color: '#FB923C', duration: 13, swayDuration: 3.7, delay: -10, driftX: 60, swayAmt: 35, rotEnd: 370, flipEnd: 180, opacity: 0.9 }
]

export const FallingLeaves: React.FC = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Only active in Light Mode as requested
  if (isDark) {
    return null
  }

  return (
    <div className={styles.leavesContainer} aria-hidden="true">
      {/* Signature Blue Bokeh Orb at top-left from user reference screenshot */}
      <div className={styles.blueBokehOrb} />

      {/* Floating & Drifting Leaves / Ambient Particles */}
      {PARTICLES.map((p) => {
        const itemStyle: React.CSSProperties = {
          left: p.left,
          width: `${p.size}px`,
          height: `${p.size}px`,
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
          filter: p.blur ? `blur(${p.blur}px)` : 'none',
          // Custom CSS properties passed into keyframes
          ['--item-opacity' as string]: p.opacity,
          ['--drift-x' as string]: `${p.driftX}px`,
          ['--rot-end' as string]: `${p.rotEnd}deg`,
          ['--flip-end' as string]: `${p.flipEnd}deg`,
        }

        const innerStyle: React.CSSProperties = {
          animationDuration: `${p.swayDuration}s`,
          ['--sway-amt' as string]: `${p.swayAmt}px`,
        }

        return (
          <div key={p.id} className={styles.fallingItem} style={itemStyle}>
            <div className={styles.swayInner} style={innerStyle}>
              {p.type === 'leaf-1' && (
                <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none">
                  <path
                    d="M12 2C17.5 7 21 13 13 22C4.5 13 7.5 7 12 2Z"
                    fill={p.color}
                    opacity={0.92}
                  />
                  <path
                    d="M12 3C12.5 9 12.8 15 13 21"
                    stroke="rgba(255, 255, 255, 0.45)"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                </svg>
              )}

              {p.type === 'leaf-2' && (
                <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none">
                  <path
                    d="M4 20C4 20 5 10 14 4C18 1 21 2 21 2C21 2 20 6 16 11C11 17 4 20 4 20Z"
                    fill={p.color}
                    opacity={0.88}
                  />
                  <path
                    d="M4 20C7.5 16 11.5 12 18 5"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                  />
                </svg>
              )}

              {p.type === 'diamond' && (
                <div className={styles.diamondParticle} style={{ width: p.size, height: p.size }} />
              )}

              {p.type === 'ring' && (
                <div className={styles.ringParticle} style={{ width: p.size, height: p.size }} />
              )}

              {p.type === 'cross' && (
                <span className={styles.crossParticle}>+</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default FallingLeaves

'use client'

import React, { useRef, useState, useCallback, type MouseEvent, type ReactNode, type CSSProperties } from 'react'

interface SpecularGlassCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  onClick?: () => void
  radius?: string
  spotlightSize?: number
  spotlightColor?: string
  hoverLift?: boolean
}

export const SpecularGlassCard: React.FC<SpecularGlassCardProps> = ({
  children,
  className = '',
  style = {},
  onClick,
  radius = '2rem',
  spotlightSize = 400,
  spotlightColor = 'rgba(255, 255, 255, 0.4)',
  hoverLift = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`glass-panel group relative overflow-hidden transition-all duration-500 ease-out cursor-pointer ${
        hoverLift ? 'hover:-translate-y-2' : ''
      } ${className}`}
      style={{
        borderRadius: radius,
        ...style,
      }}
    >
      {/* Specular Lighting Overlay (Mouse Tracking) */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(${spotlightSize}px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 40%)`,
          mixBlendMode: 'overlay',
          zIndex: 2,
        }}
      />

      {/* Subtle border glow tracker */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          borderRadius: radius,
          border: '1px solid rgba(255, 255, 255, 0.25)',
          background: `radial-gradient(${spotlightSize * 0.75}px circle at ${mousePos.x}px ${mousePos.y}px, rgba(56, 189, 248, 0.15), transparent 60%)`,
          zIndex: 1,
        }}
      />

      {/* Card Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  )
}

export default SpecularGlassCard

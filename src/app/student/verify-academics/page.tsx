'use client'

import React from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'
import AcademicVerificationFlow from '@/components/AcademicVerificationFlow'
import { AmbientBlooms } from '@/components/ui/AmbientBlooms'
import { ArrowLeft, ShieldCheck, HelpCircle } from 'lucide-react'

export default function VerifyAcademicsPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        padding: '32px 20px 80px',
        fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
        position: 'relative'
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto 32px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '16px'
        }}
      >
        <Logo variant="student" size="md" href="/student/dashboard" withBadge badgeText="STUDENT" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/student/dashboard"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <ArrowLeft size={15} />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Main Flow */}
      <AcademicVerificationFlow />
      <AmbientBlooms />
    </div>
  )
}

'use client'

import React from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import styles from './page.module.css'
import MaskedHeading from '@/components/MaskedHeading'
import BlurText from '@/components/BlurText'
import Logo from '@/components/Logo'
import SpecularButton from '@/components/SpecularButton'
import PillNav from '@/components/PillNav'
import AmbientBlooms from '@/components/ui/AmbientBlooms'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useTheme } from '@/contexts/ThemeContext'
import {
  FileText,
  Brain,
  Target,
  Compass,
  Mic,
  Code2,
  ChartNoAxesCombined,
  Sparkles,
  FolderLock,
  Upload,
  Zap,
  TrendingUp,
  Bot,
  Search,
  ArrowRight,
  GraduationCap,
  Building2,
  Landmark,
  Rocket,
  Lightbulb,
  Sun,
  Moon
} from 'lucide-react'

const DriftWall = dynamic(() => import('@/components/DriftWall'), { ssr: false })
const CircularGallery = dynamic(() => import('@/components/CircularGallery'), { ssr: false })
const SideRays = dynamic(() => import('@/components/SideRays'), { ssr: false })

const DRIFT_ITEMS = [
  { icon: <FileText size={18} strokeWidth={2} />, title: 'Resume Score', subtitle: '89/100 ATS Match', type: 'progress' as const, val: 89 },
  { icon: <Brain size={18} strokeWidth={2} />, title: 'Skill Gaps', subtitle: 'Next.js & Go missing', type: 'tags' as const, tags: ['Next.js', 'Go'] },
  { icon: <Target size={18} strokeWidth={2} />, title: 'Job Matching', subtitle: '94% Google Match', type: 'match' as const, val: '94%' },
  { icon: <Compass size={18} strokeWidth={2} />, title: 'AI Roadmap', subtitle: 'Week 1: System Design', type: 'step' as const, val: 'Active' },
  { icon: <Mic size={18} strokeWidth={2} />, title: 'Interview Sim', subtitle: 'Confidence: 87%', type: 'badge' as const, val: 'Ready' },
  { icon: <Code2 size={18} strokeWidth={2} />, title: 'Coding Judge', subtitle: 'LeetCode Sim 5/5 pass', type: 'code' as const, val: 'Accepted' },
  { icon: <ChartNoAxesCombined size={18} strokeWidth={2} />, title: 'Skill Radar', subtitle: 'Frontend: 92%', type: 'progress' as const, val: 92 },
  { icon: <Sparkles size={18} strokeWidth={2} />, title: 'Dream Mode', subtitle: 'Google prep active', type: 'badge' as const, val: 'Tier 1' },
  { icon: <FolderLock size={18} strokeWidth={2} />, title: 'Portfolio Scan', subtitle: 'GitHub: 12 projects', type: 'tags' as const, tags: ['GitHub', 'Projects'] },
]

export default function LandingPage() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  const handleAnimationComplete = () => {
    // animation complete handler
  }

  // Dynamic text gradient matching the theme specification
  const currentGradient = isDark
    ? 'linear-gradient(to right, #3B82F6, #60A5FA, #06B6D4)'
    : 'linear-gradient(to right, #1E3A8A, #2563EB, #38BDF8)'

  return (
    <main className={styles.main}>
      {/* ── AMBIENT RADIAL BLOOMS & 2% SVG NOISE OVERLAY ── */}
      <AmbientBlooms />

      {/* ── OPTIONAL ACCENT SIDE RAYS (SOFT INTEGRATION) ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <SideRays
            speed={2.5}
            rayColor1={isDark ? '#3B82F6' : '#ffffff'}
            rayColor2={isDark ? '#06B6D4' : '#cbd5e1'}
            intensity={isDark ? 0.6 : 0.4}
            spread={2}
            origin="top-right"
            tilt={0}
            saturation={1.5}
            blend={0.75}
            falloff={1.6}
            opacity={isDark ? 0.08 : 0.06}
          />
        </div>
      </div>

      {/* ── FLOATING PILL NAVIGATION WITH THEME TOGGLE ── */}
      <PillNav
        logo={<Logo variant="student" size="sm" href="/" withBadge badgeText="AI" />}
        items={[
          { label: 'Features', href: '#features' },
          { label: 'How It Works', href: '#how-it-works' },
          { label: 'Showcase', href: '#showcase' },
          { label: 'Theme Studio', href: '#theme-studio' },
        ]}
        rightAction={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ThemeToggle variant="pill" />
            <Link
              href="/auth/login"
              className="btn btn-sm btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 18px',
                fontSize: '13px',
                borderRadius: '9999px',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              <span>Sign In</span>
              <ArrowRight size={13} strokeWidth={2.2} />
            </Link>
          </div>
        }
      />

      {/* ── HERO SECTION ── */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} strokeWidth={2} />
            <span>AI-Powered Career Intelligence Platform</span>
          </span>
        </div>

        <h1 className={styles.heroTitle}>
          <BlurText
            text="Close the Gap."
            delay={140}
            animateBy="words"
            direction="top"
            gradientText={currentGradient}
            onAnimationComplete={handleAnimationComplete}
            style={{ display: 'block' }}
          />
          <BlurText
            text="Land Your Dream."
            delay={140}
            animateBy="words"
            direction="top"
            gradientText={currentGradient}
            style={{ display: 'block' }}
          />
        </h1>

        <p className={styles.heroSubtitle}>
          <BlurText
            text="Upload your resume. AI analyzes skill gaps, matches top companies, generates your personalized 4-week roadmap, and simulates real interviews."
            delay={50}
            animateBy="words"
            direction="top"
          />
        </p>

        <div className={styles.heroCTA}>
          <Link href="/auth/login?role=student" style={{ textDecoration: 'none' }}>
            <SpecularButton
              size="lg"
              radius={12}
              tint={isDark ? '#3B82F6' : '#2563EB'}
              tintOpacity={0.22}
              blur={0}
              textColor="#ffffff"
              lineColor={isDark ? '#60A5FA' : '#93C5FD'}
              baseColor={isDark ? '#1D4ED8' : '#2563EB'}
              intensity={0.9}
              shineSize={8}
              shineFade={35}
              thickness={1}
              speed={0.3}
              followMouse
              proximity={220}
            >
              <GraduationCap size={20} strokeWidth={2} />
              <span>Start as Student — Free</span>
            </SpecularButton>
          </Link>
          <Link
            href="/auth/login?role=company"
            className="btn btn-company btn-lg"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Building2 size={20} strokeWidth={2} />
            <span>Hire Talent</span>
          </Link>
          <Link
            href="/auth/login?role=institution"
            className="btn btn-institution btn-lg"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Landmark size={20} strokeWidth={2} />
            <span>Institution Portal</span>
          </Link>
        </div>

        <div className={styles.heroStats}>
          {[
            { num: '50K+', label: 'Students Placed', color: 'var(--foreground)' },
            { num: '2K+', label: 'Partner Companies', color: 'var(--accent-secondary)' },
            { num: '94%', label: 'Match Accuracy', color: 'var(--primary)' },
            { num: '4 Weeks', label: 'Avg. Readiness', color: 'var(--muted)' },
          ].map((s) => (
            <div key={s.label} className={styles.heroStat}>
              <span className={styles.heroStatNum} style={{ color: s.color }}>
                {s.num}
              </span>
              <span className={styles.heroStatLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── DRIFT WALL SHOWCASE ── */}
      <section id="showcase" className={styles.driftSection}>
        <div className={styles.sectionHeader}>
          <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={13} strokeWidth={2} />
            <span>Platform Preview</span>
          </span>
          <h2 className={styles.sectionTitle}>
            <BlurText
              text="Everything You Need to Get"
              delay={100}
              animateBy="words"
              direction="top"
            />{' '}
            <BlurText
              text="Placed"
              delay={100}
              animateBy="words"
              direction="top"
              gradientText={currentGradient}
            />
          </h2>
          <p className={styles.sectionSub}>
            <BlurText
              text="20+ AI-powered tools built for students and recruiters"
              delay={80}
              animateBy="words"
              direction="top"
            />
          </p>
        </div>
        <div className={styles.driftWrap}>
          <DriftWall
            items={DRIFT_ITEMS}
            columns={5}
            tileWidth={200}
            tileHeight={132}
            gap={18}
            tilt={16}
            turn={-14}
            perspective={1200}
            depth={120}
            speed={42}
            direction="up"
            variance={0.45}
            parallax={0.6}
            lift={64}
            fade={0.6}
            dim={0.55}
            overlayColor={isDark ? '#0B1120' : '#F8FAFC'}
          />
        </div>
      </section>

      {/* ── CORE FEATURES (CIRCULAR 3D GALLERY) ── */}
      <section id="features" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={13} strokeWidth={2} />
            <span>Core Features</span>
          </span>
          <h2 className={styles.sectionTitle}>
            <BlurText
              text="From Resume to"
              delay={100}
              animateBy="words"
              direction="top"
            />{' '}
            <BlurText
              text="Offer Letter"
              delay={100}
              animateBy="words"
              direction="top"
              gradientText={currentGradient}
            />
          </h2>
          <p className={styles.sectionSub}>
            <BlurText
              text="20+ AI-powered tools built for students and recruiters"
              delay={80}
              animateBy="words"
              direction="top"
            />
          </p>
        </div>
        <div style={{ height: '600px', position: 'relative', marginTop: '40px' }}>
          <CircularGallery
            items={FEATURES}
            bend={3}
            textColor={isDark ? '#F8FAFC' : '#0F172A'}
            borderRadius={0.06}
            scrollEase={0.08}
            autoRotateSpeed={0.025}
            fontUrl="https://fonts.googleapis.com/css2?family=Outfit:wght@700&display=swap"
            font="bold 28px Outfit, sans-serif"
          />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={13} strokeWidth={2} />
            <span>Simple Process</span>
          </span>
          <h2 className={styles.sectionTitle}>
            4 Steps to Your <MaskedHeading text="Dream Job" style={{ fontSize: 'inherit', fontWeight: 'inherit' }} />
          </h2>
        </div>
        <div className={styles.stepsGrid}>
          {STEPS.map((s, i) => (
            <div key={s.title} className={styles.stepCard}>
              <div className={styles.stepNum}>{i + 1}</div>
              <div className={styles.stepIcon}>{s.icon}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOR COMPANIES / RECRUITERS ── */}
      <section className={styles.section}>
        <div className={`glass-panel ${styles.companyBanner}`}>
          <div className={styles.companyBannerText}>
            <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={13} strokeWidth={2} />
              <span>For Recruiters</span>
            </span>
            <h2>Find Pre-Screened, Skill-Verified Talent</h2>
            <p>Post jobs, access AI-matched candidates, view skill radar charts, and shortlist in minutes — not weeks.</p>
            <Link href="/auth/login?role=company" style={{ textDecoration: 'none' }}>
              <SpecularButton
                size="md"
                radius={10}
                tint="#059669"
                tintOpacity={0.2}
                blur={0}
                textColor="#ffffff"
                lineColor="#6ee7b7"
                baseColor="#065f46"
                intensity={0.85}
                shineSize={8}
                shineFade={35}
                thickness={1}
                speed={0.3}
                followMouse
                proximity={220}
              >
                <span>Start Hiring Now</span>
                <ArrowRight size={16} strokeWidth={2} />
              </SpecularButton>
            </Link>
          </div>
          <div className={styles.companyBannerStats}>
            {[
              { icon: <Target size={22} strokeWidth={2} />, num: '95%', label: 'Qualified matches' },
              { icon: <Zap size={22} strokeWidth={2} />, num: '3x', label: 'Faster hiring' },
              { icon: <Lightbulb size={22} strokeWidth={2} />, num: '40%', label: 'Cost reduction' },
            ].map((stat, sIdx) => (
              <div key={sIdx} className={styles.companyStatItem}>
                <span className={styles.cmpIcon}>{stat.icon}</span>
                <span className={styles.cmpNum}>{stat.num}</span>
                <span className={styles.cmpLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DUAL-PERSONALITY THEME STUDIO ── */}
      <section id="theme-studio" className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className="badge badge-purple">
            <Sparkles size={13} strokeWidth={2.2} />
            <span>Dual-Personality Architecture</span>
          </div>
          <h2 className={styles.sectionTitle}>
            Handcrafted Light & Dark Experience. <br />
            <span className={styles.gradientTitle}>700ms Cinematic Transition.</span>
          </h2>
          <p className={styles.sectionSub}>
            Experience how the colors, typography, ambient radial blooms, and specular highlights adapt between Sunrise Luxury Air and Deep Space Cyber Glass.
          </p>
        </div>

        <div className={styles.themeStudio}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
            <button
              onClick={() => setTheme('light')}
              className={`btn cursor-pointer ${!isDark ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '10px 22px', fontSize: '14px', fontWeight: 600 }}
            >
              <Sun size={17} className={!isDark ? 'text-amber-300' : ''} />
              <span>Sunrise Luxury Glass (Light)</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`btn cursor-pointer ${isDark ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '10px 22px', fontSize: '14px', fontWeight: 600 }}
            >
              <Moon size={17} className={isDark ? 'text-cyan-300' : ''} />
              <span>Deep Space Cyber Glass (Dark)</span>
            </button>
          </div>

          <div className={styles.studioGrid}>
            <div
              className={`${styles.studioCard} ${styles.studioCardLight}`}
              style={{ outline: !isDark ? '2px solid #2563EB' : 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span className="badge badge-orange">Light Mode Personality</span>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Sunrise Air & Luxury Glass</span>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
                Clean Off-White & Soft Sunlight Blooms
              </h3>
              <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6, marginBottom: '18px' }}>
                Crisp ice-white background (<code style={{ background: 'rgba(255,209,128,0.3)', padding: '2px 6px', borderRadius: '4px' }}>#F8FAFC</code>) with delicate ambient blooms of soft sunlight (<code style={{ background: 'rgba(255,209,128,0.4)', padding: '2px 6px', borderRadius: '4px' }}>#FFD180</code>) and sky blue (<code style={{ background: 'rgba(219,234,254,0.7)', padding: '2px 6px', borderRadius: '4px' }}>#DBEAFE</code>). Frosted glass surfaces with royal-to-sky gradient accents.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '9999px', background: 'rgba(37,99,235,0.08)', color: '#2563EB', fontWeight: 600 }}>
                  Royal Blue → Sky Blue
                </span>
                <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '9999px', background: 'rgba(255,255,255,0.8)', border: '1px solid #DCE7F8', color: '#0F172A', fontWeight: 600 }}>
                  Frosted White 60%
                </span>
              </div>
            </div>

            <div
              className={`${styles.studioCard} ${styles.studioCardDark}`}
              style={{ outline: isDark ? '2px solid #3B82F6' : 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span className="badge badge-blue">Dark Mode Personality</span>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Deep Space Cyber Glass</span>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#F8FAFC', marginBottom: '10px' }}>
                Deep Obsidian & Neon Cyan
              </h3>
              <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '18px' }}>
                Obsidian navy canvas (<code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>#0B1120</code>) with luminous dark glass (<code style={{ background: 'rgba(11,17,32,0.8)', padding: '2px 6px', borderRadius: '4px' }}>rgba(11, 17, 32, 0.4)</code>), radiant halos of electric blue, and neon cyan accents with deep 48px ambient shadows.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '9999px', background: 'rgba(59,130,246,0.2)', color: '#60A5FA', fontWeight: 600 }}>
                  Electric Blue → Neon Cyan
                </span>
                <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '9999px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F8FAFC', fontWeight: 600 }}>
                  Obsidian Glass 40%
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Logo variant="student" size="md" href="/" withBadge badgeText="AI" />
          <p className={styles.footerTagline}>
            AI-powered placement intelligence • Built for the future of hiring
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px', color: 'var(--muted)' }}>
            <Link href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>Features</Link>
            <Link href="#how-it-works" style={{ color: 'inherit', textDecoration: 'none' }}>How It Works</Link>
            <Link href="#showcase" style={{ color: 'inherit', textDecoration: 'none' }}>Showcase</Link>
            <Link href="#theme-studio" style={{ color: 'inherit', textDecoration: 'none' }}>Theme Studio</Link>
            <Link href="/auth/login" style={{ color: 'inherit', textDecoration: 'none' }}>Sign In</Link>
          </div>
          <p className={styles.footerCopy}>© 2026 PLACEIQ. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}

const FEATURES = [
  { icon: <FileText size={20} strokeWidth={2} />, title: 'Resume Upload & ATS Score', desc: 'Upload PDF resumes. Get ATS compatibility score like real companies run it.', tag: 'Core', badge: 'badge-purple', gradient: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))', iconColor: '#6366f1' },
  { icon: <Brain size={20} strokeWidth={2} />, title: 'Semantic Skill Extraction', desc: 'AI reads between the lines and extracts hard + soft skills intelligently.', tag: 'AI', badge: 'badge-blue', gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,182,212,0.15))', iconColor: '#3b82f6' },
  { icon: <Target size={20} strokeWidth={2} />, title: 'Company Match Score', desc: 'Vector similarity matching against real company requirement profiles.', tag: 'AI', badge: 'badge-blue', gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.15))', iconColor: '#8b5cf6' },
  { icon: <Search size={20} strokeWidth={2} />, title: 'Skill Gap Detection', desc: 'Pinpoint exact missing skills — both technical and soft skills breakdown.', tag: 'Core', badge: 'badge-purple', gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.15))', iconColor: '#f59e0b' },
  { icon: <Compass size={20} strokeWidth={2} />, title: 'AI 4-Week Roadmap', desc: 'Personalized day-by-day learning plan to close your skill gaps fast.', tag: 'AI', badge: 'badge-blue', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.15))', iconColor: '#10b981' },
  { icon: <Mic size={20} strokeWidth={2} />, title: 'Live Interview Simulator', desc: 'Voice & chat AI for mock interviews. Get confidence scores instantly.', tag: 'Advanced', badge: 'badge-orange', gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.15))', iconColor: '#d97706' },
  { icon: <Code2 size={20} strokeWidth={2} />, title: 'DSA Coding Judge', desc: 'Real-time coding round evaluator with test cases — like LeetCode meets AI.', tag: 'Advanced', badge: 'badge-orange', gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.15))', iconColor: '#2563eb' },
  { icon: <ChartNoAxesCombined size={20} strokeWidth={2} />, title: 'Skill Radar Chart', desc: 'Beautiful visual radar showing your strengths across all domains.', tag: 'Visual', badge: 'badge-green', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.15))', iconColor: '#059669' },
  { icon: <Sparkles size={20} strokeWidth={2} />, title: 'Dream Company Mode', desc: 'Google, Amazon, Microsoft prep with company-specific question banks.', tag: 'Premium', badge: 'badge-orange', gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))', iconColor: '#ec4899' },
  { icon: <TrendingUp size={20} strokeWidth={2} />, title: 'Progress Tracker', desc: 'Track your before vs after improvement with timeline analytics.', tag: 'Visual', badge: 'badge-green', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.15))', iconColor: '#10b981' },
  { icon: <Bot size={20} strokeWidth={2} />, title: 'AI Mentor Chatbot', desc: '24/7 career guidance chatbot trained on placement best practices.', tag: 'AI', badge: 'badge-blue', gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))', iconColor: '#3b82f6' },
  { icon: <FolderLock size={20} strokeWidth={2} />, title: 'Portfolio Analyzer', desc: 'Analyze GitHub, projects, and portfolio for depth and confidence scoring.', tag: 'Advanced', badge: 'badge-orange', gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(139,92,246,0.15))', iconColor: '#d97706' },
]

const STEPS = [
  { icon: <Upload size={24} strokeWidth={2} />, title: 'Upload Resume', desc: 'Upload your PDF resume or LinkedIn profile. Takes under 30 seconds.', grad: 'linear-gradient(135deg,#ffffff,#cbd5e1)' },
  { icon: <Zap size={24} strokeWidth={2} />, title: 'AI Analysis', desc: 'Our AI extracts skills, scores ATS compatibility, and maps gaps instantly.', grad: 'linear-gradient(135deg,#cbd5e1,#94a3b8)' },
  { icon: <Target size={24} strokeWidth={2} />, title: 'Get Your Roadmap', desc: 'Receive a personalized 4-week prep plan with resources & mock interviews.', grad: 'linear-gradient(135deg,#94a3b8,#64748b)' },
  { icon: <Rocket size={24} strokeWidth={2} />, title: 'Land the Job', desc: 'Apply to matched companies with confidence. Track applications in real-time.', grad: 'linear-gradient(135deg,#64748b,#475569)' },
]

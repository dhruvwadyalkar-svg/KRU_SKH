'use client'
import { useState, useEffect, useRef } from 'react'
import StudentSidebar from '@/components/StudentSidebar'
import { AmbientBlooms } from '@/components/ui/AmbientBlooms'
import BackButton from '@/components/BackButton'
import { MorphingInfinity } from '@/components/ui/morphing-infinity'
import styles from '../dashboard.module.css'
import {
  Milestone,
  ListOrdered,
  TriangleAlert,
  Zap,
  Clock,
  CheckSquare,
  Play,
  Target,
  Lightbulb,
  MessageSquare,
  User,
  Bot,
  Sparkles,
  Search,
  Compass,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react'

const CAREER_PRESETS = [
  { id: 'fullstack', role: 'Full Stack Developer', desc: 'React, Node.js, Next.js, PostgreSQL, Docker', skills: ['React', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'] },
  { id: 'swe', role: 'Software Engineer', desc: 'DSA, System Design, Java/C++, SQL, Microservices', skills: ['Data Structures', 'Algorithms', 'System Design', 'Java / C++', 'SQL', 'Git'] },
  { id: 'devops', role: 'DevOps & Cloud Engineer', desc: 'Kubernetes, Docker, AWS, CI/CD, Terraform', skills: ['Docker', 'Kubernetes', 'AWS Cloud', 'Terraform', 'CI/CD Pipelines', 'Linux'] },
  { id: 'aiml', role: 'AI & Machine Learning Engineer', desc: 'Python, PyTorch, RAG Pipelines, Vector DBs', skills: ['Python', 'PyTorch', 'Vector DBs', 'RAG Architectures', 'Scikit-Learn', 'FastAPI'] },
  { id: 'data', role: 'Data Analyst & BI Specialist', desc: 'SQL, Python, Power BI, Statistics, Data Modeling', skills: ['SQL', 'Python Pandas', 'Power BI', 'Tableau', 'Statistical Analysis', 'ETL Pipelines'] },
  { id: 'frontend', role: 'Modern Frontend Engineer', desc: 'React, TypeScript, CSS Architecture, Web Performance', skills: ['React', 'TypeScript', 'Tailwind/CSS Architecture', 'Next.js SSR', 'State Management'] }
]

export default function RoadmapPage() {
  const [analyses, setAnalyses] = useState<any[]>([])
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null)
  const [activePreset, setActivePreset] = useState<string>('fullstack')
  const [customRoleInput, setCustomRoleInput] = useState('')
  const [roadmap, setRoadmap] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'presets' | 'analyses' | 'custom'>('presets')
  const [chatQuery, setChatQuery] = useState('')
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAnalyses()
    // Auto generate roadmap for default preset on initial load
    generatePresetRoadmap('Full Stack Developer', CAREER_PRESETS[0].skills)
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const fetchAnalyses = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/skill-gap/list')
      const data = await res.json()
      if (data.analyses && Array.isArray(data.analyses)) {
        const parsed = data.analyses.map((a: any) => {
          let analysisData = a.analysis_data
          if (typeof analysisData === 'string') {
            try {
              analysisData = JSON.parse(analysisData)
            } catch {
              analysisData = {}
            }
          }
          return {
            ...a,
            analysis_data: analysisData
          }
        })
        setAnalyses(parsed)
      }
    } catch (error) {
      console.error('Failed to fetch analyses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalysisSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value)
    const analysis = analyses.find(a => a.id === id)
    if (!analysis) return

    setSelectedAnalysis(analysis)
    setActivePreset('')
    setRoadmap(null)
    setChatHistory([])
    await generateRoadmap({ analysis: analysis.analysis_data })
  }

  const generatePresetRoadmap = async (roleName: string, skills: string[]) => {
    setActivePreset(roleName)
    setSelectedAnalysis(null)
    setRoadmap(null)
    setChatHistory([])
    await generateRoadmap({ targetRole: roleName, skills })
  }

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customRoleInput.trim()) return
    setActivePreset('')
    setSelectedAnalysis(null)
    setRoadmap(null)
    setChatHistory([])
    await generateRoadmap({ targetRole: customRoleInput.trim() })
  }

  const generateRoadmap = async (payload: { analysis?: any; targetRole?: string; skills?: string[] }, query?: string) => {
    setGenerating(true)
    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, userQuery: query })
      })

      const data = await res.json()
      if (data.success && data.roadmap) {
        setRoadmap(data.roadmap)
        if (query) {
          setChatHistory(prev => [
            ...prev,
            { type: 'user', message: query },
            { type: 'assistant', message: 'Roadmap dynamically adjusted based on your preference!' }
          ])
        }
      }
    } catch (error) {
      console.error('Failed to generate roadmap:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatQuery.trim()) return

    const query = chatQuery
    setChatQuery('')
    setChatHistory(prev => [...prev, { type: 'user', message: query }])

    if (selectedAnalysis) {
      await generateRoadmap({ analysis: selectedAnalysis.analysis_data }, query)
    } else {
      const preset = CAREER_PRESETS.find(p => p.role === activePreset)
      await generateRoadmap({
        targetRole: activePreset || customRoleInput || 'Software Engineer',
        skills: preset?.skills
      }, query)
    }
  }

  const getYouTubeSearchUrl = (query: string) => {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  }

  return (
    <div className={styles.layout}>
      <StudentSidebar />
      <AmbientBlooms />
      <div className={styles.content}>
        <header className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <BackButton fallbackHref="/student/dashboard" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Milestone size={24} strokeWidth={2} color="#8b5cf6" />
                <h1 className={styles.pageTitle}>Learning Roadmap</h1>
              </div>
              <p className={styles.pageSubtitle}>AI-engineered 4-5 week technical mastery blueprint</p>
            </div>
          </div>
        </header>

        <main className={styles.main}>
          {/* ================= ROADMAP SOURCE CONTROLS ================= */}
          <div className={`glass ${styles.panel}`} style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={18} strokeWidth={2.2} color="#8b5cf6" />
                <h3 className={styles.panelTitle} style={{ margin: 0, fontSize: '1.05rem' }}>Select Career Target or Analysis</h3>
              </div>

              {/* Source Mode Tabs */}
              <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('presets')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '7px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    background: activeTab === 'presets' ? 'var(--card)' : 'transparent',
                    color: activeTab === 'presets' ? 'var(--primary)' : 'var(--text-secondary)',
                    boxShadow: activeTab === 'presets' ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Role Tracks
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('analyses')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '7px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    background: activeTab === 'analyses' ? 'var(--card)' : 'transparent',
                    color: activeTab === 'analyses' ? 'var(--primary)' : 'var(--text-secondary)',
                    boxShadow: activeTab === 'analyses' ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Skill-Gap Uploads ({analyses.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('custom')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '7px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    background: activeTab === 'custom' ? 'var(--card)' : 'transparent',
                    color: activeTab === 'custom' ? 'var(--primary)' : 'var(--text-secondary)',
                    boxShadow: activeTab === 'custom' ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Custom Goal
                </button>
              </div>
            </div>

            {/* TAB 1: PRESET CAREER TRACKS */}
            {activeTab === 'presets' && (
              <div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
                  Choose a high-demand software engineering domain to generate a curated, week-by-week curriculum:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                  {CAREER_PRESETS.map((preset) => {
                    const isSelected = activePreset === preset.role
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => generatePresetRoadmap(preset.role, preset.skills)}
                        disabled={generating}
                        style={{
                          textAlign: 'left',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                          background: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                            {preset.role}
                          </span>
                          {isSelected && <Sparkles size={14} color="var(--primary)" />}
                        </div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {preset.desc}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: PRIOR RESUME / JD ANALYSES */}
            {activeTab === 'analyses' && (
              <div>
                {loading ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Loading prior skill gap analyses...</p>
                ) : analyses.length === 0 ? (
                  <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <p style={{ color: 'var(--text-secondary)', margin: '0 0 8px 0', fontSize: '0.86rem' }}>
                      No prior skill gap analyses detected. You can upload a resume and job description on the Skill Gap page, or select a Role Track above.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('presets')}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.8rem' }}
                    >
                      Browse Role Tracks →
                    </button>
                  </div>
                ) : (
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                      Select Analyzed Target Role:
                    </label>
                    <select
                      onChange={handleAnalysisSelect}
                      value={selectedAnalysis?.id || ''}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">Choose a resume and job description pair...</option>
                      {analyses.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.resume_name} → {a.job_desc_name} ({new Date(a.created_at).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CUSTOM GOAL INPUT */}
            {activeTab === 'custom' && (
              <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={customRoleInput}
                  onChange={(e) => setCustomRoleInput(e.target.value)}
                  placeholder="Enter any target role (e.g. Flutter Mobile Engineer, Security Analyst, Go Backend)..."
                  disabled={generating}
                  style={{
                    flex: 1,
                    minWidth: '260px',
                    padding: '12px 16px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem'
                  }}
                />
                <button
                  type="submit"
                  disabled={generating || !customRoleInput.trim()}
                  className="btn btn-primary"
                  style={{ padding: '12px 22px', fontSize: '0.88rem', fontWeight: 600 }}
                >
                  {generating ? 'Generating...' : 'Build Custom Roadmap'}
                </button>
              </form>
            )}
          </div>

          {/* ================= CRITICAL SKILLS CALLOUT ================= */}
          {roadmap?.critical_skills && roadmap.critical_skills.length > 0 && (
            <div className={`glass ${styles.panel}`} style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(245,158,11,0.06))',
              borderColor: 'rgba(239, 68, 68, 0.25)',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <TriangleAlert size={18} strokeWidth={2.2} color="#ef4444" />
                <h3 className={styles.panelTitle} style={{ color: '#ef4444', margin: 0, fontSize: '1rem' }}>
                  Critical Priority Skills to Bridge
                </h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {roadmap.critical_skills.map((skill: string, i: number) => (
                  <span key={i} style={{
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444',
                    fontSize: '0.82rem',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Zap size={14} strokeWidth={2} color="#ef4444" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ================= GENERATING LOADER ================= */}
          {generating && (
            <div className={`glass ${styles.panel}`} style={{ textAlign: 'center', padding: '50px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem' }}>
              <MorphingInfinity className="size-16" style={{ width: '64px', height: '64px', color: 'var(--primary)' }} />
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>Engineering Personalized Curriculum...</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.86rem' }}>Structuring milestones, project exercises, and curated video walkthroughs</p>
              </div>
            </div>
          )}

          {/* ================= ROADMAP WEEKS & DAILY SCHEDULE ================= */}
          {roadmap && !generating && (
            <>
              {/* Daily Schedule Card */}
              <div className={`glass ${styles.panel}`} style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Clock size={18} strokeWidth={2.2} color="var(--primary)" />
                  <h3 className={styles.panelTitle} style={{ margin: 0, fontSize: '1rem' }}>Pacing & Daily Schedule</h3>
                </div>
                <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
                  Target: {roadmap.daily_schedule?.hours_per_day || '2-3 hours/day'}
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                  {roadmap.daily_schedule?.breakdown || 'Core theory study + hands-on coding + implementation review'}
                </p>
              </div>

              {/* Weekly Modules */}
              {roadmap.roadmap?.map((week: any, i: number) => (
                <div key={i} className={`glass ${styles.panel}`} style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, var(--primary), #10b981)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: '900',
                      color: '#ffffff',
                      flexShrink: 0
                    }}>
                      W{week.week}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 3px 0', color: 'var(--text-primary)' }}>
                        {week.title}
                      </h3>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                        <strong>Focus:</strong> {week.focus}
                      </p>
                    </div>
                  </div>

                  {/* Skills Covered in Week */}
                  {week.skills && week.skills.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '6px' }}>
                        Core Competencies:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {week.skills.map((skill: string, j: number) => (
                          <span key={j} style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)'
                          }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tasks List */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <CheckSquare size={16} strokeWidth={2} color="var(--primary)" />
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>Hands-On Tasks:</h4>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {week.tasks?.map((task: any, j: number) => (
                        <div key={j} style={{
                          padding: '14px 16px',
                          background: 'var(--bg-secondary)',
                          borderRadius: '10px',
                          border: '1px solid var(--border)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                            <p style={{ fontSize: '0.88rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>{task.task}</p>
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                              <Clock size={12} strokeWidth={2} />
                              <span>{task.duration}</span>
                            </span>
                          </div>

                          {task.resources && task.resources.length > 0 && (
                            <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {task.resources.map((resource: any, k: number) => (
                                <a
                                  key={k}
                                  href={getYouTubeSearchUrl(resource.search_query)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '5px 10px',
                                    background: 'rgba(239,68,68,0.08)',
                                    border: '1px solid rgba(239,68,68,0.25)',
                                    borderRadius: '6px',
                                    color: '#ef4444',
                                    fontSize: '0.76rem',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  <Play size={12} strokeWidth={2.4} />
                                  <span>{resource.title}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Milestone */}
                  <div style={{
                    padding: '12px 14px',
                    background: 'rgba(16,185,129,0.08)',
                    borderRadius: '8px',
                    borderLeft: '4px solid #10b981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Target size={16} strokeWidth={2.2} color="#10b981" />
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                      <strong style={{ color: '#10b981' }}>Milestone:</strong> {week.milestone}
                    </p>
                  </div>
                </div>
              ))}

              {/* Tips Section */}
              {roadmap.tips && roadmap.tips.length > 0 && (
                <div className={`glass ${styles.panel}`} style={{ padding: '20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Lightbulb size={18} strokeWidth={2.2} color="#f59e0b" />
                    <h3 className={styles.panelTitle} style={{ margin: 0, fontSize: '1rem' }}>Placement Architect Strategy Tips</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {roadmap.tips.map((tip: string, i: number) => (
                      <div key={i} style={{
                        padding: '10px 14px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <Lightbulb size={16} strokeWidth={2} color="#f59e0b" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Real-time AI Roadmap Optimizer */}
              <div className={`glass ${styles.panel}`} style={{ padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <MessageSquare size={18} strokeWidth={2.2} color="var(--primary)" />
                  <h3 className={styles.panelTitle} style={{ margin: 0, fontSize: '1rem' }}>Tailor &amp; Refine Your Roadmap</h3>
                </div>

                {chatHistory.length > 0 && (
                  <div style={{
                    maxHeight: '280px',
                    overflowY: 'auto',
                    marginBottom: '14px',
                    padding: '12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}>
                    {chatHistory.map((msg, i) => (
                      <div key={i} style={{
                        marginBottom: '10px',
                        padding: '10px 14px',
                        background: msg.type === 'user' ? 'rgba(37, 99, 235, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                        borderRadius: '8px',
                        borderLeft: `3px solid ${msg.type === 'user' ? 'var(--primary)' : '#10b981'}`
                      }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {msg.type === 'user' ? <User size={12} strokeWidth={2} color="var(--primary)" /> : <Bot size={12} strokeWidth={2} color="#10b981" />}
                          <span>{msg.type === 'user' ? 'You' : 'Curriculum Assistant'}</span>
                        </div>
                        <p style={{ fontSize: '0.86rem', color: 'var(--text-primary)', margin: 0 }}>{msg.message}</p>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}

                <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={chatQuery}
                    onChange={(e) => setChatQuery(e.target.value)}
                    placeholder="E.g., Prioritize Docker and AWS, condense to 3 weeks, emphasize DSA..."
                    disabled={generating}
                    style={{
                      flex: 1,
                      minWidth: '240px',
                      padding: '12px 16px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={generating || !chatQuery.trim()}
                    className="btn btn-primary"
                    style={{ padding: '12px 22px', fontSize: '0.88rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    {generating ? <MorphingInfinity className="size-4" style={{ width: '16px', height: '16px' }} /> : <Sparkles size={16} strokeWidth={2} />}
                    <span>{generating ? 'Adjusting...' : 'Refine Roadmap'}</span>
                  </button>
                </form>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

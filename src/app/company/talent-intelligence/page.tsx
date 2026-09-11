'use client'

import React, { useState, useEffect, useMemo } from 'react'
import CompanySidebar from '@/components/CompanySidebar'
import styles from './talentIntelligence.module.css'
import {
  BrainCircuit,
  Sparkles,
  Target,
  TrendingUp,
  BarChart3,
  Users,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  X,
  FileText,
  ChevronRight,
  GraduationCap,
  Award,
  Clock,
  Compass,
  Eye,
  BookOpen,
  ShieldCheck,
  Layers,
  RefreshCw,
  SlidersHorizontal,
  Building2,
  Code2,
  ArrowRight,
  Zap,
  HelpCircle,
  TrendingDown
} from 'lucide-react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts'
import {
  TalentIntelligenceDashboardData,
  JobDescriptionAnalysis,
  CandidateComparisonResult,
  CandidateBridgeRoadmap,
  OverlookedCandidate
} from '@/lib/talentIntelligence/types'
import { CandidateCardData, ROLE_PRESET_SKILLS } from '@/lib/candidateIntelligenceService'
import { dispatchPortalNotification } from '@/components/NotificationBell'

const PRESET_ROLES = [
  'Software Developer',
  'Python Backend Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'DevOps & Cloud Engineer',
  'Data Scientist / AI Engineer',
  'Cybersecurity Specialist'
]

export default function TalentIntelligencePage() {
  // Primary Filter State
  const [selectedRole, setSelectedRole] = useState('Software Developer')
  const [activeSkills, setActiveSkills] = useState<string[]>(
    ROLE_PRESET_SKILLS['Software Developer'] || ['JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'REST APIs']
  )
  const [newSkillText, setNewSkillText] = useState('')

  // Dashboard Data State
  const [data, setData] = useState<TalentIntelligenceDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Candidate Tier Tab & Filter States
  const [activeTab, setActiveTab] = useState<'exact' | 'near' | 'potential' | 'all'>('exact')
  const [candidateSearch, setCandidateSearch] = useState('')
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('all')
  const [minCgpaFilter, setMinCgpaFilter] = useState<number>(0)
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  // Department Matrix Search
  const [departmentSearch, setDepartmentSearch] = useState('')

  // Candidate Comparison State
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<number[]>([])
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)
  const [comparisonResult, setComparisonResult] = useState<CandidateComparisonResult | null>(null)
  const [comparisonLoading, setComparisonLoading] = useState(false)

  // JD Analysis Modal State
  const [isJdModalOpen, setIsJdModalOpen] = useState(false)
  const [jdInputText, setJdInputText] = useState('')
  const [jdAnalyzing, setJdAnalyzing] = useState(false)

  // Bridge Roadmap Modal State
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false)
  const [roadmapData, setRoadmapData] = useState<CandidateBridgeRoadmap | null>(null)
  const [roadmapLoading, setRoadmapLoading] = useState(false)

  // Profile Modal State
  const [selectedProfile, setSelectedProfile] = useState<CandidateCardData | null>(null)

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const skillsQuery = activeSkills.join(',')
      const res = await fetch(
        `/api/company/talent-intelligence/dashboard?role=${encodeURIComponent(selectedRole)}&skills=${encodeURIComponent(skillsQuery)}`
      )
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load talent intelligence data')
      }
      setData(json.data)
    } catch (err: any) {
      console.error('Talent Intelligence fetch error:', err)
      setError(err.message || 'An error occurred while loading dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [selectedRole, activeSkills])

  // Handle Role Change
  const handleRoleChange = (role: string) => {
    setSelectedRole(role)
    const preset = ROLE_PRESET_SKILLS[role] || ['Coding', 'Problem Solving', 'Data Structures']
    setActiveSkills(preset)
  }

  // Skill Add / Remove
  const handleRemoveSkill = (skillToRemove: string) => {
    setActiveSkills(prev => prev.filter(s => s !== skillToRemove))
  }

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newSkillText.trim()
    if (trimmed && !activeSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setActiveSkills(prev => [...prev, trimmed])
      setNewSkillText('')
    }
  }

  // Handle Job Description AI Extraction
  const handleAnalyzeJD = async () => {
    if (!jdInputText.trim()) return
    setJdAnalyzing(true)
    try {
      const res = await fetch('/api/company/talent-intelligence/analyze-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jdInputText })
      })
      const json = await res.json()
      if (json.success && json.analysis) {
        const analysis: JobDescriptionAnalysis = json.analysis
        if (analysis.roleTitle) {
          setSelectedRole(analysis.roleTitle)
        }
        if (analysis.requiredSkills && analysis.requiredSkills.length > 0) {
          setActiveSkills(analysis.requiredSkills)
        }
        setIsJdModalOpen(false)
        setJdInputText('')
        dispatchPortalNotification({
          role: 'company',
          title: 'Job Description Analyzed',
          message: `Extracted ${analysis.requiredSkills?.length || 0} skills for role ${analysis.roleTitle || 'Custom Role'}.`,
          category: 'system'
        })
      }
    } catch (err: any) {
      console.error('JD analysis error:', err)
      alert('Failed to analyze job description: ' + err.message)
    } finally {
      setJdAnalyzing(false)
    }
  }

  // Handle Candidate Selection for Compare
  const toggleCandidateForCompare = (id: number) => {
    setSelectedCandidateIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(candId => candId !== id)
      } else {
        if (prev.length >= 4) {
          alert('You can compare a maximum of 4 candidates at a time.')
          return prev
        }
        return [...prev, id]
      }
    })
  }

  // Trigger Side-by-Side Candidate Comparison
  const handleOpenComparison = async () => {
    if (selectedCandidateIds.length < 2) return
    setIsCompareModalOpen(true)
    setComparisonLoading(true)
    try {
      const res = await fetch('/api/company/talent-intelligence/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateIds: selectedCandidateIds,
          role: selectedRole,
          requiredSkills: activeSkills
        })
      })
      const json = await res.json()
      if (json.success && json.comparison) {
        setComparisonResult(json.comparison)
      } else {
        throw new Error(json.error || 'Failed to compare candidates')
      }
    } catch (err: any) {
      console.error('Comparison error:', err)
      alert('Failed to compare candidates: ' + err.message)
    } finally {
      setComparisonLoading(false)
    }
  }

  // Trigger Preparation Path Modal
  const handleOpenRoadmap = async (candidate: CandidateCardData, missingSkills: string[]) => {
    setIsRoadmapModalOpen(true)
    setRoadmapLoading(true)
    setRoadmapData(null)
    try {
      const res = await fetch('/api/company/talent-intelligence/bridge-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: candidate.id,
          missingSkills,
          role: selectedRole
        })
      })
      const json = await res.json()
      if (json.success && json.roadmap) {
        setRoadmapData(json.roadmap)
      } else {
        throw new Error(json.error || 'Failed to generate bridge roadmap')
      }
    } catch (err: any) {
      console.error('Bridge roadmap error:', err)
      alert('Failed to generate bridge roadmap: ' + err.message)
    } finally {
      setRoadmapLoading(false)
    }
  }

  // Filtered Candidates by active tier and filter criteria
  const displayedCandidates = useMemo(() => {
    if (!data) return []

    let list: CandidateCardData[] = []
    if (activeTab === 'exact') list = data.tiers.exactMatches
    else if (activeTab === 'near') list = data.tiers.nearMatches
    else if (activeTab === 'potential') list = data.tiers.potentialMatches
    else list = [...data.tiers.exactMatches, ...data.tiers.nearMatches, ...data.tiers.potentialMatches, ...data.tiers.lowMatches]

    return list.filter(c => {
      // Search
      if (candidateSearch.trim()) {
        const q = candidateSearch.toLowerCase()
        const matches = c.name.toLowerCase().includes(q) ||
          c.institutionName?.toLowerCase().includes(q) ||
          c.branch?.toLowerCase().includes(q)
        if (!matches) return false
      }

      // Department
      if (selectedDepartmentFilter !== 'all' && c.branch !== selectedDepartmentFilter) {
        return false
      }

      // CGPA
      if (minCgpaFilter > 0 && c.cgpa < minCgpaFilter) {
        return false
      }

      // Verified
      if (verifiedOnly && !c.academicSummary?.cgpa?.isVerified) {
        return false
      }

      return true
    })
  }, [data, activeTab, candidateSearch, selectedDepartmentFilter, minCgpaFilter, verifiedOnly])

  // Filtered Departments in Comparison Table
  const displayedDepartments = useMemo(() => {
    if (!data) return []
    const list = data.departmentComparisons || data.collegeComparisons || []
    if (!departmentSearch.trim()) return list
    const q = departmentSearch.toLowerCase()
    return list.filter(dept =>
      dept.departmentName.toLowerCase().includes(q) ||
      dept.topSkill.toLowerCase().includes(q)
    )
  }, [data, departmentSearch])

  // Unique Department List for dropdown
  const uniqueDepartments = useMemo(() => {
    if (!data) return []
    const list = data.departmentComparisons || data.collegeComparisons || []
    return Array.from(new Set(list.map(c => c.departmentName)))
  }, [data])

  return (
    <div className={styles.layout}>
      <CompanySidebar />

      <div className={styles.content}>
        {/* ── HEADER ── */}
        <header className={styles.header}>
          <div className={styles.titleArea}>
            <div className={styles.pageTitle}>
              <BrainCircuit size={22} color="#a78bfa" />
              <span>Talent Intelligence</span>
              <span className={styles.badgeAi}>AI RECRUITER SUITE</span>
            </div>
            <p className={styles.pageSubtitle}>
              Understand where your best talent is and what skills the market demands.
            </p>
          </div>

          <div className={styles.headerActions}>
            <select
              className={styles.selectRole}
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              {PRESET_ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            <button
              className={styles.btnSecondary}
              onClick={() => setIsJdModalOpen(true)}
            >
              <FileText size={15} />
              <span>Analyze Job Description</span>
            </button>

            <button
              className={styles.btnSecondary}
              onClick={fetchDashboardData}
              title="Refresh Analytics"
            >
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </header>

        {/* ── MAIN BODY ── */}
        <main className={styles.main}>

          {/* Active Skills Bar */}
          <div className={styles.skillChipsBar}>
            <span className={styles.skillChipsLabel}>
              <Target size={14} color="#8b5cf6" />
              Target Skills:
            </span>

            {activeSkills.map(skill => (
              <span key={skill} className={styles.skillChip}>
                {skill}
                <button
                  className={styles.chipRemoveBtn}
                  onClick={() => handleRemoveSkill(skill)}
                  title="Remove skill"
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            <form onSubmit={handleAddSkill} className={styles.addSkillForm}>
              <input
                type="text"
                placeholder="+ Add skill"
                value={newSkillText}
                onChange={(e) => setNewSkillText(e.target.value)}
                className={styles.addSkillInput}
              />
            </form>
          </div>

          {/* Loading or Error State */}
          {loading && !data && (
            <div className={styles.panel} style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#a78bfa', fontSize: '15px' }}>
                <RefreshCw size={20} className="spin" />
                <span>Synthesizing Talent Intelligence from live database...</span>
              </div>
            </div>
          )}

          {error && (
            <div className={styles.panel} style={{ borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f87171' }}>
                <AlertTriangle size={18} />
                <span style={{ fontWeight: 600 }}>{error}</span>
              </div>
              <button onClick={fetchDashboardData} className={styles.btnSecondary} style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
                Retry Analysis
              </button>
            </div>
          )}

          {data && (
            <>
              {/* ── TOP KPI ROW ── */}
              <div className={styles.kpiGrid}>
                <div className={`${styles.kpiCard} ${styles.kpiCardGlowPrimary}`}>
                  <div className={styles.kpiHead}>
                    <span className={styles.kpiLabel}>Total Talent Pool</span>
                    <div className={styles.kpiIconBox}><Users size={18} /></div>
                  </div>
                  <div className={styles.kpiValue}>
                    {data.kpis.totalTalentPool > 0 ? data.kpis.totalTalentPool.toLocaleString() : 'Not enough data yet'}
                  </div>
                  <span className={styles.kpiSub}>Active candidate profiles in ecosystem</span>
                </div>

                <div className={`${styles.kpiCard} ${styles.kpiCardGlowGreen}`}>
                  <div className={styles.kpiHead}>
                    <span className={styles.kpiLabel}>Exact Matches</span>
                    <div className={styles.kpiIconBox} style={{ color: '#10b981' }}><CheckCircle2 size={18} /></div>
                  </div>
                  <div className={styles.kpiValue} style={{ color: '#34d399' }}>
                    {data.kpis.exactMatchesCount}
                  </div>
                  <span className={styles.kpiSub}>≥ 78% Match & satisfies core skills</span>
                </div>

                <div className={`${styles.kpiCard} ${styles.kpiCardGlowAmber}`}>
                  <div className={styles.kpiHead}>
                    <span className={styles.kpiLabel}>Near Matches</span>
                    <div className={styles.kpiIconBox} style={{ color: '#f59e0b' }}><Clock size={18} /></div>
                  </div>
                  <div className={styles.kpiValue} style={{ color: '#fbbf24' }}>
                    {data.kpis.nearMatchesCount}
                  </div>
                  <span className={styles.kpiSub}>Missing only 1–2 skills, bridgeable</span>
                </div>

                <div className={`${styles.kpiCard} ${styles.kpiCardGlowPink}`}>
                  <div className={styles.kpiHead}>
                    <span className={styles.kpiLabel}>High Potential</span>
                    <div className={styles.kpiIconBox} style={{ color: '#ec4899' }}><Zap size={18} /></div>
                  </div>
                  <div className={styles.kpiValue} style={{ color: '#f472b6' }}>
                    {data.kpis.highPotentialCount}
                  </div>
                  <span className={styles.kpiSub}>Exceptional coding & project upside</span>
                </div>
              </div>

              {/* ── AI TALENT INSIGHT BANNER ── */}
              <div className={styles.insightBanner}>
                <div className={styles.insightHead}>
                  <div className={styles.insightTitleGroup}>
                    <Sparkles size={18} color="#ec4899" />
                    <span className={styles.insightTitle}>Executive AI Hiring Insights</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 600 }}>
                    Live Synthesis: {selectedRole}
                  </span>
                </div>

                <p className={styles.insightSummary}>
                  {data.aiInsight.summary}
                </p>

                <div className={styles.insightPointsGrid}>
                  <div className={styles.insightPointCard}>
                    <span className={styles.insightPointLabel}>🎯 Near-Match Opportunity</span>
                    <span className={styles.insightPointText}>{data.aiInsight.nearMatchOpportunity}</span>
                  </div>

                  <div className={styles.insightPointCard}>
                    <span className={styles.insightPointLabel}>🏛️ Top Department Hub</span>
                    <span className={styles.insightPointText}>{data.aiInsight.topDepartmentInsight || data.aiInsight.topCollegeInsight}</span>
                  </div>

                  <div className={styles.insightPointCard}>
                    <span className={styles.insightPointLabel}>💡 Strategic Action</span>
                    <span className={styles.insightPointText}>{data.aiInsight.strategicRecommendations[1] || 'Prioritize interviews for high-potential candidates.'}</span>
                  </div>
                </div>
              </div>

              {/* ── MARKET-TO-TALENT RADAR & SKILL GAP SECTION ── */}
              <div className={styles.gridSection}>
                {/* Radar Chart */}
                <div className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <div>
                      <h3 className={styles.panelTitle}>
                        <Compass size={18} color="#a78bfa" />
                        Market-to-Talent Radar
                      </h3>
                      <p className={styles.panelSubtitle}>
                        Company Need vs Industry Demand vs Available Talent
                      </p>
                    </div>
                  </div>

                  <div className={styles.radarBox}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={data.radarMetrics}>
                        <PolarGrid stroke="rgba(255, 255, 255, 0.12)" />
                        <PolarAngleAxis dataKey="skill" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                        <Radar
                          name="Company Need"
                          dataKey="companyNeed"
                          stroke="#8b5cf6"
                          fill="#8b5cf6"
                          fillOpacity={0.25}
                        />
                        <Radar
                          name="Industry Demand"
                          dataKey="industryDemand"
                          stroke="#38bdf8"
                          fill="#38bdf8"
                          fillOpacity={0.15}
                        />
                        <Radar
                          name="Available Talent"
                          dataKey="availableTalent"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.35}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                          formatter={(value) => <span style={{ color: '#cbd5e1' }}>{value}</span>}
                        />
                        <RechartsTooltip
                          contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Skill Gap Heatmap Table */}
                <div className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <div>
                      <h3 className={styles.panelTitle}>
                        <BarChart3 size={18} color="#38bdf8" />
                        Skill Gap Analysis
                      </h3>
                      <p className={styles.panelSubtitle}>
                        Direct breakdown of hiring deficits & surpluses
                      </p>
                    </div>
                  </div>

                  <div className={styles.tableWrapper}>
                    <table className={styles.gapTable}>
                      <thead>
                        <tr>
                          <th>Skill</th>
                          <th>Category</th>
                          <th>Company Need</th>
                          <th>Industry</th>
                          <th>Available</th>
                          <th>Talent Gap</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.radarMetrics.map(item => {
                          const isNegative = item.talentGap < 0
                          return (
                            <tr key={item.skill}>
                              <td className={styles.skillCell}>
                                <span>{item.skill}</span>
                              </td>
                              <td>
                                <span className={styles.categoryBadge}>{item.category}</span>
                              </td>
                              <td>
                                <div>{item.companyNeed}%</div>
                                <div className={styles.miniProgressBar}>
                                  <div className={styles.miniProgressFillPrimary} style={{ width: `${item.companyNeed}%` }} />
                                </div>
                              </td>
                              <td>
                                <div>{item.industryDemand}%</div>
                                <div className={styles.miniProgressBar}>
                                  <div className={styles.miniProgressFillBlue} style={{ width: `${item.industryDemand}%` }} />
                                </div>
                              </td>
                              <td>
                                <div>{item.availableTalent}%</div>
                                <div className={styles.miniProgressBar}>
                                  <div className={styles.miniProgressFillGreen} style={{ width: `${item.availableTalent}%` }} />
                                </div>
                              </td>
                              <td>
                                {isNegative ? (
                                  <span className={styles.gapBadgeNegative}>
                                    <TrendingDown size={12} />
                                    {item.talentGap}%
                                  </span>
                                ) : (
                                  <span className={styles.gapBadgePositive}>
                                    <TrendingUp size={12} />
                                    +{item.talentGap}%
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ── "DON'T OVERLOOK" AI ENGINE SPOTLIGHT ── */}
              <div className={styles.overlookSection}>
                <div className={styles.panelHeader}>
                  <div>
                    <h3 className={styles.panelTitle} style={{ color: '#f472b6' }}>
                      <Sparkles size={20} color="#ec4899" />
                      "Don't Overlook" AI Engine
                    </h3>
                    <p className={styles.panelSubtitle}>
                      Candidates who are NOT exact matches, but possess high growth potential and fast role-readiness.
                    </p>
                  </div>
                  <span className={styles.badgeAi} style={{ background: 'rgba(236, 72, 153, 0.15)', borderColor: 'rgba(236, 72, 153, 0.4)', color: '#f472b6' }}>
                    {data.overlookedCandidates.length} High-Upside Candidates Detected
                  </span>
                </div>

                {data.overlookedCandidates.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No candidates currently in the overlooked category.
                  </div>
                ) : (
                  <div className={styles.overlookGrid}>
                    {data.overlookedCandidates.slice(0, 6).map(item => (
                      <div key={item.candidate.id} className={styles.overlookCard}>
                        <div className={styles.overlookCardTop}>
                          <div className={styles.candidateMeta}>
                            <span className={styles.candidateName}>{item.candidate.name}</span>
                            <span className={styles.candidateCollege}>{item.candidate.branch || 'Computer Engineering'} • {item.candidate.degree || 'B.Tech'}</span>
                          </div>
                          <div className={styles.potentialScoreBadge} title="Calculated Potential Score">
                            {item.potentialScore}/100 Potential
                          </div>
                        </div>

                        <div className={styles.matchScoresLine}>
                          <span>Current Match: <strong className={styles.scorePill}>{item.candidate.jobMatchScore}%</strong></span>
                          <span>CGPA: <strong>{item.candidate.cgpa}</strong></span>
                          <span>Projects: <strong>{item.candidate.relevantProjectsCount}</strong></span>
                        </div>

                        <div className={styles.overlookTagPills}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '100%' }}>Missing Gaps:</span>
                          {item.missingSkills.map(ms => (
                            <span key={ms} className={styles.tagMissing}>-{ms}</span>
                          ))}
                        </div>

                        <div className={styles.overlookTagPills}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '100%' }}>Core Strengths:</span>
                          {item.strengths.slice(0, 3).map(str => (
                            <span key={str} className={styles.tagStrength}>{str}</span>
                          ))}
                        </div>

                        <div className={styles.overlookAiQuote}>
                          "{item.aiInsight}"
                        </div>

                        <div className={styles.overlookActions}>
                          <button
                            className={`${styles.btnActionSm} ${styles.btnActionSmHighlight}`}
                            onClick={() => handleOpenRoadmap(item.candidate, item.missingSkills)}
                          >
                            <BookOpen size={13} />
                            <span>Prep Path</span>
                          </button>

                          <button
                            className={styles.btnActionSm}
                            onClick={() => {
                              setSelectedProfile(item.candidate)
                            }}
                          >
                            <Eye size={13} />
                            <span>Profile</span>
                          </button>

                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer', padding: '0 4px' }}>
                            <input
                              type="checkbox"
                              checked={selectedCandidateIds.includes(item.candidate.id)}
                              onChange={() => toggleCandidateForCompare(item.candidate.id)}
                            />
                            <span>Compare</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── DEPARTMENT / BRANCH TALENT COMPARISON ── */}
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <h3 className={styles.panelTitle}>
                      <GraduationCap size={19} color="#8b5cf6" />
                      Department & Branch Talent Comparison
                    </h3>
                    <p className={styles.panelSubtitle}>
                      Compare skill penetration and candidate concentration across academic branches
                    </p>
                  </div>

                  <div className={styles.collegeControls}>
                    <input
                      type="text"
                      placeholder="Search department or top skill..."
                      value={departmentSearch}
                      onChange={(e) => setDepartmentSearch(e.target.value)}
                      className={styles.searchInput}
                    />
                  </div>
                </div>

                <div className={styles.tableWrapper}>
                  <table className={styles.collegeTable}>
                    <thead>
                      <tr>
                        <th>Academic Department / Branch</th>
                        <th>Candidates</th>
                        {activeSkills.slice(0, 5).map(skill => (
                          <th key={skill} style={{ textAlign: 'center' }}>{skill}</th>
                        ))}
                        <th>Overall Talent Index</th>
                        <th>Top Concentration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedDepartments.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                            No departments match your filter.
                          </td>
                        </tr>
                      ) : (
                        displayedDepartments.map(dept => {
                          const pillClass =
                            dept.overallStrength >= 70
                              ? styles.strengthPillHigh
                              : dept.overallStrength >= 45
                                ? styles.strengthPillMedium
                                : styles.strengthPillLow

                          return (
                            <tr key={dept.departmentId}>
                              <td>
                                <div className={styles.collegeNameGroup}>
                                  <span className={styles.collegeName}>{dept.departmentName}</span>
                                </div>
                              </td>
                              <td>
                                <span style={{ fontWeight: 600 }}>{dept.studentCount}</span> students
                              </td>
                              {activeSkills.slice(0, 5).map(skill => {
                                const pct = dept.skillsStrength[skill] || 0
                                return (
                                  <td key={skill} style={{ textAlign: 'center' }}>
                                    <span style={{ fontWeight: 600, color: pct >= 60 ? '#34d399' : pct >= 30 ? '#cbd5e1' : '#94a3b8' }}>
                                      {pct}%
                                    </span>
                                  </td>
                                )
                              })}
                              <td>
                                <span className={`${styles.strengthPill} ${pillClass}`}>
                                  {dept.overallStrength}%
                                </span>
                              </td>
                              <td>
                                <span style={{ fontSize: '12px', color: '#c4b5fd', fontWeight: 500 }}>
                                  {dept.topSkill}
                                </span>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── HIRING OPPORTUNITIES DETECTOR ── */}
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <h3 className={styles.panelTitle}>
                      <TrendingUp size={19} color="#10b981" />
                      Hiring Opportunity Detector
                    </h3>
                    <p className={styles.panelSubtitle}>
                      Cross-role talent supply forecasting to plan recruitment drives
                    </p>
                  </div>
                </div>

                <div className={styles.opportunityGrid}>
                  {data.hiringOpportunities.map(opp => {
                    let cardBorderClass = styles.opportunityStatusModerate
                    let badgeClass = styles.statusBadgeModerate

                    if (opp.status === 'Strong Hiring Opportunity') {
                      cardBorderClass = styles.opportunityStatusStrong
                      badgeClass = styles.statusBadgeStrong
                    } else if (opp.status === 'Talent Shortage') {
                      cardBorderClass = styles.opportunityStatusShortage
                      badgeClass = styles.statusBadgeShortage
                    }

                    return (
                      <div key={opp.role} className={`${styles.opportunityCard} ${cardBorderClass}`}>
                        <div className={styles.opportunityTitleRow}>
                          <span className={styles.opportunityRole}>{opp.role}</span>
                          <span className={badgeClass}>{opp.status}</span>
                        </div>

                        <div className={styles.opportunityStatsLine}>
                          <div>
                            Exact Matches: <span className={styles.opportunityStatNum}>{opp.exactCount}</span>
                          </div>
                          <div>
                            Near Matches: <span className={styles.opportunityStatNum}>{opp.nearCount}</span>
                          </div>
                        </div>

                        <p className={styles.opportunityRec}>{opp.recommendation}</p>

                        <button
                          className={styles.btnActionSm}
                          style={{ marginTop: 'auto' }}
                          onClick={() => handleRoleChange(opp.role)}
                        >
                          <span>Analyze This Role</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* ── CANDIDATE MATCH INTELLIGENCE (TIERS) ── */}
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <h3 className={styles.panelTitle}>
                      <Users size={19} color="#a78bfa" />
                      Candidate Match Intelligence
                    </h3>
                    <p className={styles.panelSubtitle}>
                      Granular candidate verification, scoring, and matching status
                    </p>
                  </div>

                  {/* Filters Bar */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Filter candidates..."
                      value={candidateSearch}
                      onChange={(e) => setCandidateSearch(e.target.value)}
                      className={styles.searchInput}
                      style={{ minWidth: '180px' }}
                    />

                    <select
                      className={styles.selectRole}
                      value={selectedDepartmentFilter}
                      onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                    >
                      <option value="all">All Departments / Branches</option>
                      {uniqueDepartments.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>

                    <select
                      className={styles.selectRole}
                      value={minCgpaFilter}
                      onChange={(e) => setMinCgpaFilter(Number(e.target.value))}
                    >
                      <option value="0">Any CGPA</option>
                      <option value="7">CGPA ≥ 7.0</option>
                      <option value="8">CGPA ≥ 8.0</option>
                      <option value="8.5">CGPA ≥ 8.5</option>
                    </select>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={verifiedOnly}
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                      />
                      <span>Verified Only</span>
                    </label>
                  </div>
                </div>

                {/* Tier Tabs */}
                <div className={styles.tierTabs}>
                  <button
                    className={`${styles.tierTabBtn} ${activeTab === 'exact' ? styles.tierTabBtnActive : ''}`}
                    onClick={() => setActiveTab('exact')}
                  >
                    <span>Exact Matches</span>
                    <span className={styles.tierBadge}>{data.tiers.exactMatches.length}</span>
                  </button>

                  <button
                    className={`${styles.tierTabBtn} ${activeTab === 'near' ? styles.tierTabBtnActive : ''}`}
                    onClick={() => setActiveTab('near')}
                  >
                    <span>Near Matches</span>
                    <span className={styles.tierBadge}>{data.tiers.nearMatches.length}</span>
                  </button>

                  <button
                    className={`${styles.tierTabBtn} ${activeTab === 'potential' ? styles.tierTabBtnActive : ''}`}
                    onClick={() => setActiveTab('potential')}
                  >
                    <span>High Potential</span>
                    <span className={styles.tierBadge}>{data.tiers.potentialMatches.length}</span>
                  </button>

                  <button
                    className={`${styles.tierTabBtn} ${activeTab === 'all' ? styles.tierTabBtnActive : ''}`}
                    onClick={() => setActiveTab('all')}
                  >
                    <span>All Candidates</span>
                    <span className={styles.tierBadge}>{data.kpis.totalTalentPool}</span>
                  </button>
                </div>

                {/* Candidates Grid */}
                {displayedCandidates.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                    <Users size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                    <p style={{ fontWeight: 600, fontSize: '15px' }}>No candidates match the selected criteria.</p>
                    <p style={{ fontSize: '12px', marginTop: '4px' }}>Try adjusting your filters or expanding required skills.</p>
                  </div>
                ) : (
                  <div className={styles.candidateGrid}>
                    {displayedCandidates.map(cand => (
                      <div key={cand.id} className={styles.candidateCard}>
                        <div className={styles.candHeader}>
                          <div className={styles.candMainInfo}>
                            <div className={styles.candNameRow}>
                              <span className={styles.candName}>{cand.name}</span>
                              {cand.academicSummary?.cgpa?.isVerified && (
                                <span title="Verified Academic Credentials">
                                  <ShieldCheck size={16} className={styles.verifiedIcon} />
                                </span>
                              )}
                            </div>
                            <span className={styles.candSubDetails}>
                              {cand.branch || 'Computer Engineering'} • {cand.degree || 'B.Tech'}
                            </span>
                          </div>

                          <div className={styles.matchBadgeLarge}>
                            <span className={styles.matchScoreNum}>{cand.jobMatchScore}%</span>
                            <span className={styles.matchScoreLabel}>Match Score</span>
                          </div>
                        </div>

                        <div className={styles.candMetricsRow}>
                          <div className={styles.candMetricItem}>
                            <span className={styles.candMetricLbl}>CGPA</span>
                            <span className={styles.candMetricVal}>{cand.cgpa}</span>
                          </div>

                          <div className={styles.candMetricItem}>
                            <span className={styles.candMetricLbl}>Projects</span>
                            <span className={styles.candMetricVal}>{cand.relevantProjectsCount} Verified</span>
                          </div>

                          <div className={styles.candMetricItem}>
                            <span className={styles.candMetricLbl}>Internships</span>
                            <span className={styles.candMetricVal}>{cand.internshipsCount}</span>
                          </div>
                        </div>

                        {/* Top Matching Skills */}
                        <div className={styles.candSkillsSection}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Verified Skill Matches:</span>
                          <div className={styles.candSkillsRow}>
                            {cand.topSkills && cand.topSkills.length > 0 ? (
                              cand.topSkills.slice(0, 5).map(sk => (
                                <span key={sk.skill} className={styles.tagStrength}>
                                  {sk.skill}
                                </span>
                              ))
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Foundational CS</span>
                            )}
                          </div>
                        </div>

                        {/* Missing Skills if any */}
                        {cand.missingFactors && cand.missingFactors.length > 0 && (
                          <div className={styles.candSkillsSection}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Missing Factors:</span>
                            <div className={styles.candSkillsRow}>
                              {cand.missingFactors.slice(0, 3).map(mf => (
                                <span key={mf} className={styles.tagMissing}>
                                  {mf}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Candidate Actions */}
                        <div className={styles.candFooterActions}>
                          <button
                            className={styles.btnActionSm}
                            onClick={() => setSelectedProfile(cand)}
                          >
                            <Eye size={13} />
                            <span>View Profile</span>
                          </button>

                          {cand.jobMatchScore < 78 && (
                            <button
                              className={styles.btnActionSm}
                              onClick={() => handleOpenRoadmap(cand, cand.missingFactors || [])}
                            >
                              <BookOpen size={13} />
                              <span>Prep Path</span>
                            </button>
                          )}

                          <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={selectedCandidateIds.includes(cand.id)}
                              onChange={() => toggleCandidateForCompare(cand.id)}
                            />
                            <span>Compare</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>

        {/* ── FLOATING COMPARE BAR ── */}
        {selectedCandidateIds.length >= 2 && (
          <div className={styles.compareFloatingBar}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
              {selectedCandidateIds.length} Candidates Selected for Comparison
            </span>
            <button
              className={styles.btnPrimary}
              onClick={handleOpenComparison}
            >
              <Sparkles size={15} />
              <span>Compare Candidates</span>
            </button>
            <button
              onClick={() => setSelectedCandidateIds([])}
              style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── JOB DESCRIPTION ANALYZER MODAL ── */}
        {isJdModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsJdModalOpen(false)}>
            <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHead}>
                <h3 className={styles.modalTitle}>
                  <Sparkles size={20} color="#ec4899" />
                  Analyze Job Description with AI
                </h3>
                <button className={styles.closeBtn} onClick={() => setIsJdModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Paste any job posting or requirement document below. PlaceIQ's AI engine will extract the role title, core technical skills, and experience indicators.
              </p>

              <textarea
                className={styles.textareaJd}
                placeholder="Paste Job Description here (e.g. We are looking for a Senior Backend Engineer proficient in Node.js, PostgreSQL, Docker, AWS, microservices, and system architecture...)"
                value={jdInputText}
                onChange={(e) => setJdInputText(e.target.value)}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  className={styles.btnSecondary}
                  onClick={() => setIsJdModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.btnPrimary}
                  disabled={jdAnalyzing || !jdInputText.trim()}
                  onClick={handleAnalyzeJD}
                >
                  {jdAnalyzing ? (
                    <>
                      <RefreshCw size={15} className="spin" />
                      <span>Extracting Skills...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>Analyze & Load Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CANDIDATE COMPARISON MODAL ── */}
        {isCompareModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsCompareModalOpen(false)}>
            <div className={`${styles.modalBox} ${styles.modalBoxWide}`} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHead}>
                <h3 className={styles.modalTitle}>
                  <Users size={20} color="#8b5cf6" />
                  Side-by-Side Candidate Comparison
                </h3>
                <button className={styles.closeBtn} onClick={() => setIsCompareModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              {comparisonLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#a78bfa' }}>
                  <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px' }} />
                  <p>Running multi-dimensional candidate synthesis...</p>
                </div>
              ) : comparisonResult ? (
                <>
                  <div className={styles.compareAiBox}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#ec4899', fontWeight: 700 }}>
                      <Sparkles size={16} />
                      <span>AI Comparative Briefing</span>
                    </div>
                    <p>{comparisonResult.aiComparativeSynthesis}</p>
                  </div>

                  <div className={styles.compareGrid}>
                    {comparisonResult.metrics.map(cand => (
                      <div key={cand.candidateId} className={styles.compareColumn}>
                        <div>
                          <div className={styles.compareName}>{cand.candidateName}</div>
                          <div className={styles.compareCollege}>{cand.college}</div>
                        </div>

                        <div className={styles.compareRow}>
                          <span className={styles.compareLbl}>Job Match</span>
                          <span className={styles.compareVal} style={{ color: '#a78bfa', fontSize: '16px' }}>{cand.jobMatchScore}%</span>
                        </div>

                        <div className={styles.compareRow}>
                          <span className={styles.compareLbl}>Potential Score</span>
                          <span className={styles.compareVal} style={{ color: '#ec4899', fontSize: '16px' }}>{cand.potentialScore}/100</span>
                        </div>

                        <div className={styles.compareRow}>
                          <span className={styles.compareLbl}>CGPA</span>
                          <span className={styles.compareVal}>{cand.cgpa} {cand.isVerified ? ' (Verified)' : ''}</span>
                        </div>

                        <div className={styles.compareRow}>
                          <span className={styles.compareLbl}>Key Strengths</span>
                          <span className={styles.compareVal}>{cand.strengths.slice(0, 3).join(', ') || 'Core Programming'}</span>
                        </div>

                        <div className={styles.compareRow}>
                          <span className={styles.compareLbl}>Missing Skills</span>
                          <span className={styles.compareVal} style={{ color: '#f87171' }}>
                            {cand.missingSkills.length > 0 ? cand.missingSkills.slice(0, 3).join(', ') : 'None (Full Match)'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p>No comparison data available.</p>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button className={styles.btnSecondary} onClick={() => setIsCompareModalOpen(false)}>
                  Close Comparison
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CANDIDATE PREPARATION PATH MODAL ── */}
        {isRoadmapModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsRoadmapModalOpen(false)}>
            <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHead}>
                <h3 className={styles.modalTitle}>
                  <BookOpen size={20} color="#10b981" />
                  Candidate Micro-Bridge Preparation Path
                </h3>
                <button className={styles.closeBtn} onClick={() => setIsRoadmapModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              {roadmapLoading ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#10b981' }}>
                  <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px' }} />
                  <p>Generating personalized skill bridge curriculum...</p>
                </div>
              ) : roadmapData ? (
                <>
                  <div>
                    <h4 style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{roadmapData.candidateName}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Target Role: <strong>{roadmapData.targetRole}</strong> • Estimated Readiness: <strong>{roadmapData.estimatedTimeToReadinessWeeks} Weeks</strong>
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {roadmapData.curriculum.map(week => (
                      <div key={week.week} className={styles.roadmapWeekCard}>
                        <div className={styles.weekTitleRow}>
                          <span className={styles.weekSkill}>Week {week.week}: {week.focusSkill}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>~{week.estimatedHours} hrs</span>
                        </div>

                        <ul style={{ paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {week.learningObjectives.map((obj, i) => (
                            <li key={i}>{obj}</li>
                          ))}
                        </ul>

                        <div style={{ fontSize: '11px', color: '#c4b5fd', marginTop: '4px' }}>
                          <strong>Hands-on Project:</strong> {week.recommendedProjects[0]}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '12px', color: '#34d399' }}>
                    <strong>Verification Milestone:</strong> {roadmapData.assessmentMilestone}
                  </div>
                </>
              ) : (
                <p>Failed to load roadmap.</p>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button className={styles.btnSecondary} onClick={() => setIsRoadmapModalOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CANDIDATE PROFILE MODAL ── */}
        {selectedProfile && (
          <div className={styles.modalOverlay} onClick={() => setSelectedProfile(null)}>
            <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHead}>
                <h3 className={styles.modalTitle}>
                  <Users size={20} color="#8b5cf6" />
                  Candidate Profile Overview
                </h3>
                <button className={styles.closeBtn} onClick={() => setSelectedProfile(null)}>
                  <X size={18} />
                </button>
              </div>

              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 700 }}>{selectedProfile.name}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {selectedProfile.institutionName} • {selectedProfile.degree} ({selectedProfile.branch}) • Grad Year: {selectedProfile.graduationYear || 2026}
                </p>
              </div>

              <div className={styles.candMetricsRow}>
                <div className={styles.candMetricItem}>
                  <span className={styles.candMetricLbl}>CGPA</span>
                  <span className={styles.candMetricVal}>{selectedProfile.cgpa}</span>
                </div>
                <div className={styles.candMetricItem}>
                  <span className={styles.candMetricLbl}>10th Percentage</span>
                  <span className={styles.candMetricVal}>{selectedProfile.academicSummary?.tenth?.percentage || 'N/A'}%</span>
                </div>
                <div className={styles.candMetricItem}>
                  <span className={styles.candMetricLbl}>12th Percentage</span>
                  <span className={styles.candMetricVal}>{selectedProfile.academicSummary?.twelfth?.percentage || 'N/A'}%</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Verified Skills & Evidence:</span>
                <div className={styles.candSkillsRow}>
                  {selectedProfile.topSkills?.map(sk => (
                    <span key={sk.skill} className={styles.tagStrength}>
                      {sk.skill} ({sk.proficiencyLevel || 'Proficient'})
                    </span>
                  ))}
                </div>
              </div>

              {selectedProfile.relevantProjects && selectedProfile.relevantProjects.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Key Projects:</span>
                  {selectedProfile.relevantProjects.map(proj => (
                    <div key={proj.id} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{proj.title}</div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{proj.description}</p>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                        {proj.techStack?.map(t => (
                          <span key={t} className={styles.categoryBadge}>{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button className={styles.btnSecondary} onClick={() => setSelectedProfile(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

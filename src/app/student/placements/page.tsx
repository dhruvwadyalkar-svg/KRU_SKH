'use client'
import { useState, useEffect } from 'react'
import StudentSidebar from '@/components/StudentSidebar'
import BackButton from '@/components/BackButton'
import { MorphingInfinity } from '@/components/ui/morphing-infinity'
import { AmbientBlooms } from '@/components/ui/AmbientBlooms'
import styles from './placements.module.css'
import {
  GraduationCap,
  Rocket,
  Building2,
  Loader2,
  Search,
  CheckCircle2,
  Calendar,
  DollarSign,
  AlertCircle,
  Sparkles,
  X,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react'

export default function StudentPlacementsPage() {
  const [drives, setDrives] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'upcoming' | 'registered'>('all')
  const [appliedDriveIds, setAppliedDriveIds] = useState<Set<number>>(new Set())
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [blockedNotice, setBlockedNotice] = useState<string | null>(null)

  useEffect(() => {
    fetchDrives()
  }, [])

  const fetchDrives = async () => {
    try {
      const res = await fetch('/api/placements')
      const data = await res.json()
      if (data.drives) {
        setDrives(data.drives)
        const applied = new Set<number>()
        data.drives.forEach((d: any) => {
          if (d.hasApplied) applied.add(d.id)
        })
        setAppliedDriveIds(applied)
      }
    } catch (err) {
      console.error('Error fetching drives:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (drive: any) => {
    setApplying(drive.id)
    setNotification(null)

    try {
      const res = await fetch(`/api/placements/${drive.id}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      const data = await res.json()

      if (res.ok || data.success) {
        setAppliedDriveIds(prev => new Set(prev).add(drive.id))
        setNotification({
          type: 'success',
          message: `🎉 Successfully registered for ${drive.company_name || drive.title}! Your application profile has been submitted to the placement officer.`
        })
      } else {
        setNotification({
          type: 'error',
          message: data.error || data.details || 'Registration request could not be completed. Please try again.'
        })
      }
    } catch (err: any) {
      console.error(err)
      setNotification({
        type: 'error',
        message: err?.message || 'A network error occurred while registering for the placement drive.'
      })
    } finally {
      setApplying(null)
    }
  }

  if (loading) {
    return (
      <div className={styles.layout}>
        <StudentSidebar />
        <div className={styles.content}>
          <div style={{ padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <MorphingInfinity className="size-16" style={{ width: '64px', height: '64px', color: '#8b5cf6' }} />
            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Loading campus placement drives...</p>
          </div>
        </div>
        <AmbientBlooms />
      </div>
    )
  }

  const filteredDrives = drives.filter(d => {
    if (blockedNotice) return false
    
    // Filter tab
    if (filterTab === 'active' && d.status !== 'active') return false
    if (filterTab === 'upcoming' && d.status !== 'upcoming') return false
    if (filterTab === 'registered' && !appliedDriveIds.has(d.id)) return false

    // Search query
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      d.title?.toLowerCase().includes(q) ||
      d.company_name?.toLowerCase().includes(q) ||
      d.eligibilityCriteria?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q)
    )
  })

  const activeCount = drives.filter(d => d.status === 'active').length
  const upcomingCount = drives.filter(d => d.status === 'upcoming').length
  const registeredCount = appliedDriveIds.size

  return (
    <div className={styles.layout}>
      <StudentSidebar />
      <div className={styles.content}>
        <header className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <BackButton fallbackHref="/student/dashboard" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={26} strokeWidth={2} color="#8b5cf6" />
                <h1 className={styles.pageTitle}>Campus Placements</h1>
              </div>
              <p className={styles.pageSubtitle}>Official on-campus placement and mass recruitment drives organized by your institution</p>
            </div>
          </div>
        </header>

        <main className={styles.main}>
          {/* Notification banner */}
          {notification && (
            <div className={`${styles.bannerNotice} ${notification.type === 'success' ? styles.bannerSuccess : styles.bannerError}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {notification.type === 'success' ? (
                  <CheckCircle2 size={20} strokeWidth={2} color="#10b981" />
                ) : (
                  <AlertCircle size={20} strokeWidth={2} color="#ef4444" />
                )}
                <span>{notification.message}</span>
              </div>
              <button
                onClick={() => setNotification(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', padding: '4px' }}
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
          )}

          {/* Search Bar */}
          <div className={styles.searchBar}>
            <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
              <Search size={18} strokeWidth={2} />
            </span>
            <input
              type="text"
              placeholder="Search placement drives, role titles, target companies, or eligibility..."
              value={search}
              onChange={(e) => {
                const val = e.target.value
                setSearch(val)
                const offScopePatterns = /\b(latest movies?|celebrity news|gaming|cricket score|best phone|dating|casino|betting|random entertainment)\b/i
                if (offScopePatterns.test(val)) {
                  setBlockedNotice("This search is outside PlaceIQ's career and learning scope. Try searching for jobs, internships, placements, skills, or career preparation.")
                } else {
                  setBlockedNotice(null)
                }
              }}
              className={styles.searchInput}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex', alignItems: 'center' }}
              >
                <X size={16} strokeWidth={2} />
              </button>
            )}
          </div>

          {blockedNotice && (
            <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.4rem' }}>🎓</span>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fca5a5' }}>
                  Placement Search Notice
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {blockedNotice}
                </div>
              </div>
            </div>
          )}

          {/* Drives Panel */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Rocket size={20} strokeWidth={2} color="#8b5cf6" />
                <h2 className={styles.panelTitle}>Available Drives ({filteredDrives.length})</h2>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <button
                  onClick={() => setFilterTab('all')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: filterTab === 'all' ? 'var(--card)' : 'transparent',
                    color: filterTab === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    boxShadow: filterTab === 'all' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  All ({drives.length})
                </button>
                <button
                  onClick={() => setFilterTab('active')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: filterTab === 'active' ? 'var(--card)' : 'transparent',
                    color: filterTab === 'active' ? '#10b981' : 'var(--text-secondary)',
                    boxShadow: filterTab === 'active' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Active ({activeCount})
                </button>
                <button
                  onClick={() => setFilterTab('upcoming')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: filterTab === 'upcoming' ? 'var(--card)' : 'transparent',
                    color: filterTab === 'upcoming' ? '#6366f1' : 'var(--text-secondary)',
                    boxShadow: filterTab === 'upcoming' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Upcoming ({upcomingCount})
                </button>
                <button
                  onClick={() => setFilterTab('registered')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: filterTab === 'registered' ? 'var(--card)' : 'transparent',
                    color: filterTab === 'registered' ? '#8b5cf6' : 'var(--text-secondary)',
                    boxShadow: filterTab === 'registered' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  My Registered ({registeredCount})
                </button>
              </div>
            </div>

            {filteredDrives.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-secondary)' }}>
                <Building2 size={40} strokeWidth={1.5} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {blockedNotice ? 'No matching opportunities within learning scope' : 'No placement drives found'}
                </div>
                <div style={{ fontSize: '0.88rem' }}>
                  {filterTab === 'registered' ? "You haven't registered for any placement drives yet." : 'Check back regularly as your college placement cell publishes new drives.'}
                </div>
              </div>
            ) : (
              <div className={styles.drivesList}>
                {filteredDrives.map((drive) => {
                  const isRegistered = appliedDriveIds.has(drive.id)
                  const isCompleted = drive.status === 'completed'
                  const isApplying = applying === drive.id

                  const logoGradient = drive.company_name === 'Google'
                    ? 'linear-gradient(135deg, #4285F4, #34A853)'
                    : drive.company_name === 'Microsoft'
                    ? 'linear-gradient(135deg, #0078D4, #00BCF2)'
                    : drive.company_name === 'Amazon'
                    ? 'linear-gradient(135deg, #FF9900, #E47911)'
                    : 'linear-gradient(135deg, #8B5CF6, #3B82F6)'

                  return (
                    <div key={drive.id} className={styles.driveCard}>
                      <div className={styles.driveLogo} style={{ background: logoGradient }}>
                        {drive.company_name ? drive.company_name.charAt(0) : <Building2 size={24} />}
                      </div>

                      <div className={styles.driveInfo}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h3 className={styles.driveTitle}>{drive.title}</h3>
                          {isRegistered && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 600, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                              <Check size={12} strokeWidth={2.5} /> Registered
                            </span>
                          )}
                        </div>

                        <div className={styles.driveCompany}>
                          <Building2 size={14} strokeWidth={2} />
                          <span>{drive.company_name || 'Enterprise'} Placement Drive</span>
                        </div>

                        {drive.description && (
                          <div className={styles.driveDesc}>{drive.description}</div>
                        )}

                        <div className={styles.driveMeta}>
                          {drive.eligibilityCriteria && (
                            <span className={styles.metaPill}>
                              <GraduationCap size={13} strokeWidth={2} color="#8b5cf6" />
                              <span>{drive.eligibilityCriteria}</span>
                            </span>
                          )}

                          <span className={styles.metaPill}>
                            <ShieldCheck size={13} strokeWidth={2} color="#10b981" />
                            <span>Verified Campus Drive</span>
                          </span>

                          <span className={styles.metaPill}>
                            <Calendar size={13} strokeWidth={2} color="#3b82f6" />
                            <span>Batch of 2026</span>
                          </span>
                        </div>
                      </div>

                      <div className={styles.driveActions}>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: '12px',
                            textTransform: 'capitalize',
                            background:
                              drive.status === 'active'
                                ? 'rgba(16, 185, 129, 0.12)'
                                : drive.status === 'upcoming'
                                ? 'rgba(99, 102, 241, 0.12)'
                                : 'var(--bg-secondary)',
                            color:
                              drive.status === 'active'
                                ? '#10b981'
                                : drive.status === 'upcoming'
                                ? '#6366f1'
                                : 'var(--text-muted)',
                            border: `1px solid ${
                              drive.status === 'active'
                                ? 'rgba(16, 185, 129, 0.25)'
                                : drive.status === 'upcoming'
                                ? 'rgba(99, 102, 241, 0.25)'
                                : 'var(--border)'
                            }`
                          }}
                        >
                          {drive.status}
                        </span>

                        {isRegistered ? (
                          <div className={styles.appliedBtn}>
                            <CheckCircle2 size={16} strokeWidth={2.5} />
                            <span>Registered ✓</span>
                          </div>
                        ) : isCompleted ? (
                          <div className={styles.closedBtn}>
                            <span>Concluded</span>
                          </div>
                        ) : (
                          <button
                            className={styles.registerBtn}
                            onClick={() => handleApply(drive)}
                            disabled={isApplying}
                          >
                            {isApplying ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Registering...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles size={15} strokeWidth={2} />
                                <span>Register for Drive</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
      <AmbientBlooms />
    </div>
  )
}

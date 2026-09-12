'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import StudentSidebar from '@/components/StudentSidebar'
import { AmbientBlooms } from '@/components/ui/AmbientBlooms'
import BackButton from '@/components/BackButton'
import { MorphingInfinity } from '@/components/ui/morphing-infinity'
import styles from '../dashboard.module.css'
import Vapi from '@vapi-ai/web'
import {
  Brain,
  Video,
  Radio,
  Mic,
  Square,
  ListOrdered,
  MessageSquare,
  Bot,
  User,
  BarChart2,
  Download,
  FileCode,
  TrendingUp,
  FileText,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  RotateCcw,
  Clock,
  ShieldAlert,
  ArrowRight,
  Eye,
  Award
} from 'lucide-react'

export default function BehavioralAnalysis() {
  const [isInterviewActive, setIsInterviewActive] = useState(false)
  const [transcript, setTranscript] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisReport, setAnalysisReport] = useState<any>(null)
  const [videoPermission, setVideoPermission] = useState(false)
  const [interviewDuration, setInterviewDuration] = useState(0)
  const [savedInterview, setSavedInterview] = useState<any>(null)
  
  const vapiRef = useRef<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<any>(null)
  const videoSnapshotsRef = useRef<string[]>([])

  const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || ''
  const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || ''

  useEffect(() => {
    // Check for saved interview from mock simulator
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('placeiq_last_interview')
        if (stored) {
          const parsed = JSON.parse(stored)
          setSavedInterview(parsed)

          // Auto analyze if user came directly from mock interview
          const urlParams = new URLSearchParams(window.location.search)
          if (urlParams.get('source') === 'mock' && parsed.transcript?.length > 0) {
            generateAnalysis(parsed.transcript, parsed.duration || 120, parsed.role, parsed.company)
          }
        }
      } catch (e) {
        console.warn('Failed to read saved interview:', e)
      }
    }

    vapiRef.current = new Vapi(VAPI_PUBLIC_KEY)

    vapiRef.current.on('call-start', () => {
      console.log('Interview started')
      setIsInterviewActive(true)
      startTimer()
    })

    vapiRef.current.on('call-end', () => {
      console.log('Interview ended')
      setIsInterviewActive(false)
      stopTimer()
      stopRecording()
    })

    vapiRef.current.on('message', (message: any) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        setTranscript(prev => {
          const last = prev[prev.length - 1]
          if (last && last.text === message.transcript && last.role === message.role) {
            return prev
          }
          return [...prev, {
            role: message.role,
            text: message.transcript,
            timestamp: new Date().toISOString()
          }]
        })
      }
    })

    vapiRef.current.on('error', (error: any) => {
      console.error('VAPI Error:', error)
    })

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop()
      }
      stopRecording()
      stopTimer()
    }
  }, [])

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setInterviewDuration(prev => prev + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setVideoPermission(true)

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      })
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000)

      const snapshotInterval = setInterval(() => {
        captureSnapshot()
      }, 5000)

      await vapiRef.current.start(ASSISTANT_ID)
      return () => clearInterval(snapshotInterval)
    } catch (error) {
      console.error('Error starting interview:', error)
      alert('Please allow camera and microphone access')
    }
  }

  const captureSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        const snapshot = canvas.toDataURL('image/jpeg', 0.7)
        videoSnapshotsRef.current.push(snapshot)
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
  }

  const endInterview = async () => {
    if (vapiRef.current) {
      vapiRef.current.stop()
    }
    await new Promise(resolve => setTimeout(resolve, 1500))
    await generateAnalysis()
  }

  const generateAnalysis = async (
    customTranscript?: any[],
    customDuration?: number,
    customRole?: string,
    customCompany?: string
  ) => {
    setIsAnalyzing(true)
    try {
      const activeTranscript = customTranscript || transcript
      const activeDuration = customDuration !== undefined ? customDuration : interviewDuration

      const response = await fetch('/api/behavioral-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: activeTranscript,
          duration: activeDuration,
          videoSnapshots: videoSnapshotsRef.current.slice(0, 10),
          role: customRole || savedInterview?.role || 'Software Engineer',
          company: customCompany || savedInterview?.company || 'Target Company'
        })
      })
      
      const data = await response.json()
      if (data && data.analysis) {
        setAnalysisReport(data.analysis)
      }
    } catch (error) {
      console.error('Error generating analysis:', error)
      alert('Failed to generate analysis. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const downloadPDF = async () => {
    try {
      const response = await fetch('/api/behavioral-analysis/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis: analysisReport })
      })
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `behavioral-analysis-${Date.now()}.pdf`
      a.click()
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  const downloadHTML = () => {
    const htmlContent = generateHTMLReport()
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `behavioral-analysis-${Date.now()}.html`
    a.click()
  }

  const generateHTMLReport = () => {
    if (!analysisReport) return ''
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PlaceIQ Behavioral Analysis Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 32px; background: #0b1120; color: #f8fafc; }
    h1 { color: #38bdf8; font-size: 26px; }
    .score { font-size: 42px; font-weight: 900; color: #10b981; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 20px 0; }
    .card { background: #1e293b; padding: 16px; border-radius: 8px; border: 1px solid #334155; }
    .pill { display: inline-block; padding: 6px 12px; border-radius: 6px; background: rgba(16,185,129,0.15); color: #34d399; margin-bottom: 8px; }
  </style>
</head>
<body>
  <h1>PlaceIQ Behavioral & STAR Interview Analysis</h1>
  <div class="score">Overall Score: ${analysisReport.overallScore}/100</div>
  <p>${analysisReport.summary}</p>
  <h3>Competency Breakdown</h3>
  <div class="grid">
    ${Object.entries(analysisReport.scores || {}).map(([k, v]) => `
      <div class="card"><strong>${k.replace(/([A-Z])/g, ' $1')}:</strong> ${v}/10</div>
    `).join('')}
  </div>
  <h3>Strengths</h3>
  ${(analysisReport.strengths || []).map((s: string) => `<p>✓ ${s}</p>`).join('')}
  <h3>Improvements</h3>
  ${(analysisReport.improvements || []).map((i: string) => `<p>⚠ ${i}</p>`).join('')}
  <h3>STAR Method Assessment</h3>
  <p>${analysisReport.starMethodUsage || 'Evaluated against STAR parameters.'}</p>
</body>
</html>`
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
                <Brain size={24} strokeWidth={2} color="#8b5cf6" />
                <h1 className={styles.pageTitle}>Behavioral &amp; Tone Analysis</h1>
              </div>
              <p className={styles.pageSubtitle}>AI assessment of candidate STAR methodology, composure, and articulation</p>
            </div>
          </div>
        </header>

        <main className={styles.main}>
          {/* ================= SAVED INTERVIEW CALLOUT BANNER ================= */}
          {!analysisReport && savedInterview && savedInterview.transcript?.length > 0 && (
            <div className={`glass ${styles.panel}`} style={{
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(16, 185, 129, 0.06))',
              borderColor: 'rgba(37, 99, 235, 0.3)',
              padding: '20px 22px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Award size={18} color="var(--primary)" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Recent Mock Interview Session Found
                  </span>
                </div>
                <h3 style={{ margin: '2px 0 4px 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {savedInterview.company && savedInterview.company !== 'Not specified' ? `${savedInterview.company} · ` : ''}{savedInterview.role || 'Software Engineer'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Captured {savedInterview.transcript.length} dialog exchanges ({savedInterview.date || 'Recent'}).
                </p>
              </div>

              <button
                type="button"
                onClick={() => generateAnalysis(savedInterview.transcript, savedInterview.duration || 120, savedInterview.role, savedInterview.company)}
                disabled={isAnalyzing}
                className="btn btn-primary btn-lg"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
              >
                <Sparkles size={16} />
                <span>Analyze This Session with Behavioral AI</span>
              </button>
            </div>
          )}

          {!analysisReport ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '20px' }}>
              {/* Left Column: Live Camera / Mic Preview */}
              <div className={`glass ${styles.panel}`} style={{ padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  {isInterviewActive ? <Radio size={18} strokeWidth={2} color="#ef4444" /> : <Video size={18} strokeWidth={2} color="#8b5cf6" />}
                  <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {isInterviewActive ? 'Live Interview Session Active' : 'Live Webcam & Voice Interview'}
                  </h3>
                </div>
                
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: 'auto',
                    aspectRatio: '16/9',
                    maxHeight: '400px',
                    minHeight: '200px',
                    background: '#0B1120',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)'
                  }}
                />

                {isInterviewActive && (
                  <div style={{ 
                    marginTop: '16px', 
                    padding: '14px', 
                    background: 'rgba(239,68,68,0.08)', 
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid rgba(239, 68, 68, 0.25)'
                  }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Session Elapsed Time
                    </p>
                    <p style={{ fontSize: '2rem', fontWeight: '800', color: '#ef4444', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                      {formatTime(interviewDuration)}
                    </p>
                  </div>
                )}

                <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {!isInterviewActive ? (
                    <button onClick={startInterview} className="btn btn-primary btn-lg" style={{ minWidth: '220px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600 }}>
                      <Mic size={18} strokeWidth={2} />
                      <span>Start Video &amp; Voice Practice</span>
                    </button>
                  ) : (
                    <button onClick={endInterview} className="btn btn-secondary btn-lg" style={{ minWidth: '220px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                      <Square size={18} strokeWidth={2} />
                      <span>End &amp; Compute AI Report</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Instructions & Transcript Stream */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className={`glass ${styles.panel}`} style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <ListOrdered size={16} strokeWidth={2} color="#8b5cf6" />
                    <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Assessment Dimensions</h3>
                  </div>
                  <ul style={{ fontSize: '0.84rem', lineHeight: '1.75', color: 'var(--text-secondary)', paddingLeft: '18px', margin: 0 }}>
                    <li><strong>STAR Framework:</strong> Structure responses with Situation, Task, Action, and Result.</li>
                    <li><strong>Technical Depth:</strong> Articulate implementation trade-offs and design decisions.</li>
                    <li><strong>Composure &amp; Eye Contact:</strong> Maintain steady pace without excessive filler pauses.</li>
                    <li><strong>Real-time Evaluation:</strong> Once completed, our Groq model evaluates your spoken answers.</li>
                  </ul>
                </div>

                <div className={`glass ${styles.panel}`} style={{ padding: '22px', flex: 1, maxHeight: '380px', overflow: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <MessageSquare size={16} strokeWidth={2} color="var(--primary)" />
                    <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Live Spoken Transcript</h3>
                  </div>
                  {transcript.length === 0 ? (
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', textAlign: 'center', padding: '36px 0', margin: 0 }}>
                      Dialogue and candidate speech will stream here in real time.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {transcript.map((item, index) => (
                        <div 
                          key={index}
                          style={{
                            padding: '10px 14px',
                            background: item.role === 'assistant' ? 'rgba(124,58,237,0.08)' : 'rgba(16,185,129,0.08)',
                            borderRadius: '8px',
                            borderLeft: `3px solid ${item.role === 'assistant' ? '#7c3aed' : '#10b981'}`
                          }}
                        >
                          <div style={{ fontSize: '0.72rem', fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {item.role === 'assistant' ? <Bot size={13} strokeWidth={2} color="#7c3aed" /> : <User size={13} strokeWidth={2} color="#10b981" />}
                            <span>{item.role === 'assistant' ? 'AI Interviewer' : 'You (Candidate)'}</span>
                          </div>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>{item.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ================= COMPREHENSIVE BEHAVIORAL REPORT ================= */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className={`glass ${styles.panel}`} style={{ padding: '26px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BarChart2 size={22} strokeWidth={2.2} color="var(--primary)" />
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                        Behavioral &amp; Communication Assessment
                      </h2>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Analyzed directly from candidate speech</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={downloadPDF} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Download size={14} strokeWidth={2} />
                      <span>Download PDF</span>
                    </button>
                    <button onClick={downloadHTML} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <FileCode size={14} strokeWidth={2} />
                      <span>Export HTML</span>
                    </button>
                  </div>
                </div>

                {/* Overall Score Highlight */}
                <div style={{ 
                  padding: '28px 20px', 
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(37, 99, 235, 0.12))',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  textAlign: 'center',
                  marginBottom: '26px'
                }}>
                  <p style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 6px 0' }}>
                    Overall Placement Readiness Score
                  </p>
                  <p style={{ fontSize: 'clamp(44px, 8vw, 68px)', fontWeight: '900', color: analysisReport.overallScore >= 75 ? '#10b981' : '#f59e0b', margin: '0 0 6px 0', fontFamily: 'Outfit, sans-serif' }}>
                    {analysisReport.overallScore}<span style={{ fontSize: '0.5em', color: 'var(--text-muted)' }}>/100</span>
                  </p>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 14px',
                    borderRadius: '999px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    background: analysisReport.overallScore >= 75 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: analysisReport.overallScore >= 75 ? '#34d399' : '#fbbf24'
                  }}>
                    {analysisReport.overallScore >= 80 ? '✓ High Placement Readiness' : analysisReport.overallScore >= 65 ? 'Ready for Mock Rounds' : 'Developing Candidate'}
                  </span>
                </div>

                {/* Granular Competencies Grid */}
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <TrendingUp size={18} strokeWidth={2} color="var(--primary)" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Competency Scoring Matrix</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {Object.entries(analysisReport.scores || {}).map(([key, value]: any) => (
                      <div key={key} style={{ padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <strong style={{ fontSize: '0.92rem', color: Number(value) >= 8 ? '#10b981' : Number(value) >= 6 ? 'var(--primary)' : '#f59e0b' }}>
                            {value}/10
                          </strong>
                        </div>
                        <div style={{ height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(100, Number(value) * 10)}%`, background: 'linear-gradient(90deg, var(--primary), #10b981)', borderRadius: '3px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STAR Method & Quality Assessment */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                  <div style={{ padding: '18px 20px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Award size={18} strokeWidth={2.2} color="#10b981" />
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>STAR Method Evaluation</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {analysisReport.starMethodUsage || 'Strong adherence to Situation, Task, Action, Result framing observed.'}
                    </p>
                  </div>

                  <div style={{ padding: '18px 20px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Eye size={18} strokeWidth={2.2} color="var(--primary)" />
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>Vocal Dynamics &amp; Composure</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {analysisReport.bodyLanguage || 'Steady pacing, clear articulation, and calm presence sustained across answer rounds.'}
                    </p>
                  </div>
                </div>

                {/* Executive Summary */}
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <FileText size={18} strokeWidth={2} color="#8b5cf6" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Performance Summary</h3>
                  </div>
                  <div style={{ padding: '16px 18px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.88rem', lineHeight: '1.7', color: 'var(--text-secondary)', margin: 0 }}>
                      {analysisReport.summary}
                    </p>
                  </div>
                </div>

                {/* Observed Strengths */}
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <CheckCircle2 size={18} strokeWidth={2.2} color="#10b981" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#10b981' }}>Demonstrated Strengths</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(analysisReport.strengths || []).map((s: string, i: number) => (
                      <div key={i} style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckCircle2 size={16} strokeWidth={2.2} color="#10b981" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Areas for Improvement */}
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Lightbulb size={18} strokeWidth={2.2} color="#f59e0b" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#f59e0b' }}>Key Refinement Opportunities</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(analysisReport.improvements || []).map((i: string, idx: number) => (
                      <div key={idx} style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Lightbulb size={16} strokeWidth={2.2} color="#f59e0b" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{i}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Sparkles size={18} strokeWidth={2.2} color="var(--primary)" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Recruiter Coaching Advice</h3>
                  </div>
                  <div style={{ padding: '16px 18px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.88rem', lineHeight: '1.7', color: 'var(--text-secondary)', margin: 0 }}>
                      {analysisReport.recommendations}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => {
                    setAnalysisReport(null)
                    setTranscript([])
                    setInterviewDuration(0)
                  }} 
                  className="btn btn-secondary btn-lg"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
                >
                  <RotateCcw size={16} strokeWidth={2} />
                  <span>Start New Practice Session</span>
                </button>
                <Link
                  href="/student/mock-interview"
                  className="btn btn-primary btn-lg"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
                >
                  <Mic size={16} strokeWidth={2} />
                  <span>Open Voice Mock Simulator</span>
                </Link>
              </div>
            </div>
          )}

          {/* Analyzing Loading Modal */}
          {isAnalyzing && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div className="glass" style={{ padding: '40px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '420px', borderRadius: '20px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.12)', color: 'var(--primary)' }}>
                  <MorphingInfinity className="size-12" style={{ width: '44px', height: '44px', color: 'var(--primary)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>Evaluating Behavioral Outcome...</h3>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.86rem', lineHeight: 1.5 }}>
                    Processing candidate transcript, STAR structure, and vocal pacing indicators
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

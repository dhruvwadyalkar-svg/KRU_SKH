import axios from 'axios'
import {
  JobDescriptionAnalysis,
  CandidateComparisonMetric,
  CandidateComparisonResult,
  CandidateBridgeRoadmap,
  BridgeRoadmapWeek
} from './types'
import { CandidateCardData } from '@/lib/candidateIntelligenceService'

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const AI_MODEL = process.env.AI_MODEL || 'openai/gpt-oss-120b'

/**
 * 1. AI JOB DESCRIPTION ANALYZER
 * Extracts required skills, preferred skills, technical requirements, and soft skills from pasted text.
 */
export async function analyzeJobDescriptionWithAI(jdText: string): Promise<JobDescriptionAnalysis> {
  const fallback = extractJobDescriptionFallback(jdText)

  if (!GROQ_API_KEY) {
    return fallback
  }

  try {
    const prompt = `You are an expert technical talent recruiter and AI skill analyzer.
Analyze the following Job Description (JD) and extract the key hiring profile components in pure JSON format:

Job Description:
"""
${jdText.slice(0, 3000)}
"""

Return JSON in this EXACT structure (no markdown fences, no explanation outside JSON):
{
  "roleTitle": "Extracted or inferred role title (e.g. Backend Developer)",
  "requiredSkills": ["core skill 1", "core skill 2", "core skill 3"],
  "preferredSkills": ["good to have 1", "good to have 2"],
  "experienceIndicators": ["e.g. 0-2 years", "Strong problem solving"],
  "technicalRequirements": ["e.g. RESTful APIs", "Relational Databases", "Microservices architecture"],
  "softSkills": ["Collaboration", "Agile communication"]
}`

    const response = await axios.post(
      GROQ_API_URL,
      {
        messages: [{ role: 'user', content: prompt }],
        model: AI_MODEL,
        temperature: 0.2,
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    )

    const raw = response.data?.choices?.[0]?.message?.content || ''
    let jsonStr = raw.trim()
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) jsonStr = match[0]

    const parsed = JSON.parse(jsonStr)
    return {
      roleTitle: parsed.roleTitle || fallback.roleTitle,
      requiredSkills: Array.isArray(parsed.requiredSkills) && parsed.requiredSkills.length > 0 ? parsed.requiredSkills : fallback.requiredSkills,
      preferredSkills: Array.isArray(parsed.preferredSkills) ? parsed.preferredSkills : fallback.preferredSkills,
      experienceIndicators: Array.isArray(parsed.experienceIndicators) ? parsed.experienceIndicators : fallback.experienceIndicators,
      technicalRequirements: Array.isArray(parsed.technicalRequirements) ? parsed.technicalRequirements : fallback.technicalRequirements,
      softSkills: Array.isArray(parsed.softSkills) ? parsed.softSkills : fallback.softSkills
    }
  } catch (err: any) {
    console.warn('Groq JD analysis failed, using deterministic fallback:', err.message)
    return fallback
  }
}

function extractJobDescriptionFallback(text: string): JobDescriptionAnalysis {
  const lower = text.toLowerCase()
  const techDictionary = [
    'javascript', 'typescript', 'react', 'next.js', 'node.js', 'express', 'python',
    'java', 'c++', 'c#', 'sql', 'postgresql', 'mongodb', 'docker', 'kubernetes',
    'aws', 'gcp', 'azure', 'git', 'rest apis', 'graphql', 'system design',
    'ci/cd', 'linux', 'redis', 'kafka', 'tailwind'
  ]

  const foundSkills = techDictionary
    .filter(skill => lower.includes(skill))
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))

  let roleTitle = 'Software Engineer'
  if (lower.includes('backend')) roleTitle = 'Backend Developer'
  else if (lower.includes('frontend')) roleTitle = 'Frontend Developer'
  else if (lower.includes('full stack') || lower.includes('fullstack')) roleTitle = 'Full Stack Developer'
  else if (lower.includes('devops') || lower.includes('cloud')) roleTitle = 'DevOps & Cloud Engineer'
  else if (lower.includes('ai') || lower.includes('data scientist') || lower.includes('machine learning')) roleTitle = 'AI & Data Engineer'

  return {
    roleTitle,
    requiredSkills: foundSkills.length > 0 ? foundSkills.slice(0, 6) : ['JavaScript', 'React', 'Node.js', 'SQL', 'Git'],
    preferredSkills: foundSkills.slice(6, 10),
    experienceIndicators: ['Relevant academic coursework or internship experience', 'Strong CS fundamentals'],
    technicalRequirements: ['Solid understanding of data structures, algorithms, and clean code principles'],
    softSkills: ['Analytical Thinking', 'Team Collaboration', 'Effective Communication']
  }
}

/**
 * 2. AI CANDIDATE COMPARISON
 * Evaluates 2-4 candidates side by side and produces an actionable comparative trade-off narrative.
 */
export async function generateCandidateComparisonAI(
  candidates: CandidateCardData[],
  role: string,
  requiredSkills: string[]
): Promise<CandidateComparisonResult> {
  const metrics: CandidateComparisonMetric[] = candidates.map((cand, idx) => {
    const missing = cand.missingFactors || []
    const matched = Math.max(0, requiredSkills.length - missing.length)
    let potential = Math.round(cand.jobMatchScore * 0.7 + (cand.cgpa >= 8.5 ? 15 : 10) + (cand.relevantProjectsCount >= 2 ? 15 : 5))
    potential = Math.min(98, Math.max(50, potential))

    return {
      candidateId: cand.id,
      candidateName: cand.name,
      college: cand.branch || 'Computer Engineering',
      branch: cand.branch || 'Computer Engineering',
      cgpa: cand.cgpa,
      jobMatchScore: cand.jobMatchScore,
      potentialScore: potential,
      matchedSkillsCount: matched,
      missingSkills: missing,
      strengths: cand.topSkills?.map(s => s.skill).slice(0, 4) || [],
      codingScore: cand.academicSummary?.cgpa?.value ? Math.round(cand.academicSummary.cgpa.value * 10) : 80,
      interviewScore: null,
      isVerified: !!cand.academicSummary?.cgpa?.isVerified,
      overallRanking: idx + 1
    }
  })

  // Sort metrics by jobMatchScore descending
  metrics.sort((a, b) => b.jobMatchScore - a.jobMatchScore)
  metrics.forEach((m, i) => m.overallRanking = i + 1)

  const bestOverall = metrics[0]?.candidateName || 'Candidate 1'
  const highestPotential = [...metrics].sort((a, b) => b.potentialScore - a.potentialScore)[0]?.candidateName || bestOverall
  const immediateReady = metrics.find(m => m.missingSkills.length <= 1)?.candidateName || bestOverall

  let aiSynthesis = `${bestOverall} leads the cohort with an overall match of ${metrics[0]?.jobMatchScore || 85}%, demonstrating immediate command of ${metrics[0]?.strengths.slice(0, 2).join(', ')}. Meanwhile, ${highestPotential} displays exceptional growth potential (${metrics.find(m => m.candidateName === highestPotential)?.potentialScore || 90}/100) due to strong adjacent projects and academic consistency. Recommendation: Fast-track ${bestOverall} for primary technical evaluation, and include ${highestPotential} for high-upside potential consideration.`

  if (GROQ_API_KEY && candidates.length >= 2) {
    try {
      const summaryPrompt = `You are an executive technical recruiter comparing candidates for the role: "${role}".
Required Skills: ${requiredSkills.join(', ')}

Candidate Profiles:
${metrics.map(m => `- ${m.candidateName} (${m.college}): Match: ${m.jobMatchScore}%, Potential: ${m.potentialScore}%, CGPA: ${m.cgpa}, Strengths: ${m.strengths.join(', ')}, Missing: ${m.missingSkills.join(', ')}, Verified: ${m.isVerified}`).join('\n')}

Provide a concise 2-3 paragraph recruiter briefing:
1. Compare immediate readiness vs long-term upside.
2. Note any subtle trade-offs (e.g. adjacent skills or exceptional project depth).
3. Offer a clear hiring recommendation.`

      const response = await axios.post(
        GROQ_API_URL,
        {
          messages: [{ role: 'user', content: summaryPrompt }],
          model: AI_MODEL,
          temperature: 0.3,
          max_tokens: 800
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 8000
        }
      )
      const resText = response.data?.choices?.[0]?.message?.content
      if (resText && resText.length > 50) {
        aiSynthesis = resText.trim()
      }
    } catch (e: any) {
      console.warn('Groq candidate comparison fallback applied:', e.message)
    }
  }

  return {
    role,
    requiredSkills,
    metrics,
    aiComparativeSynthesis: aiSynthesis,
    tradeoffAnalysis: {
      bestOverall,
      highestPotential,
      immediateRoleReady: immediateReady
    }
  }
}

/**
 * 3. AI NEAR-MATCH BRIDGE ROADMAP GENERATOR
 * Builds a tailored 2-4 week micro-curriculum to bridge missing skills for high-potential candidates.
 */
export async function generateBridgeRoadmapAI(
  candidate: CandidateCardData,
  missingSkills: string[],
  role: string
): Promise<CandidateBridgeRoadmap> {
  const targetSkills = missingSkills.length > 0 ? missingSkills.slice(0, 3) : ['Docker', 'AWS']
  const weeksCount = Math.min(4, Math.max(2, targetSkills.length))

  const curriculum: BridgeRoadmapWeek[] = targetSkills.map((skill, idx) => {
    return {
      week: idx + 1,
      focusSkill: skill,
      learningObjectives: [
        `Understand core architecture and lifecycle of ${skill}`,
        `Integrate ${skill} into an existing ${role} project`,
        `Practice industry standard best practices and debugging techniques`
      ],
      recommendedProjects: [
        `Containerize a multi-service REST backend using ${skill}`,
        `Deploy and configure automated CI/CD validation pipeline with ${skill}`
      ],
      curatedSearchQuery: `${skill} full practical crash course for ${role} production guide`,
      estimatedHours: 12
    }
  })

  return {
    candidateId: candidate.id,
    candidateName: candidate.name,
    targetRole: role,
    missingSkills: targetSkills,
    estimatedTimeToReadinessWeeks: weeksCount,
    curriculum,
    assessmentMilestone: `Complete a 45-minute verified PlaceIQ coding judge test focusing on ${targetSkills.join(' & ')}.`
  }
}

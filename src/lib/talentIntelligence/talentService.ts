import { prisma } from '@/lib/prisma'
import {
  evaluateCandidatesForRequirement,
  CandidateCardData,
  CandidateFilterCriteria,
  ROLE_PRESET_SKILLS,
  SKILL_SYNONYMS
} from '@/lib/candidateIntelligenceService'
import {
  TalentIntelligenceDashboardData,
  TalentKPIs,
  SkillRadarItem,
  CollegeTalentComparison,
  CandidateTierClassification,
  OverlookedCandidate,
  HiringOpportunity,
  AITalentInsight
} from './types'

// Industry demand benchmark values for common tech skills based on market data
const INDUSTRY_DEMAND_BENCHMARKS: Record<string, number> = {
  'python': 91,
  'aws': 88,
  'docker': 83,
  'react': 78,
  'node.js': 82,
  'sql': 86,
  'postgresql': 84,
  'kubernetes': 80,
  'typescript': 85,
  'javascript': 88,
  'c++': 72,
  'java': 85,
  'mongodb': 74,
  'redis': 79,
  'system design': 87,
  'rest apis': 89,
  'git': 92,
  'ci/cd': 81,
  'machine learning': 89,
  'data structures': 90,
  'linux': 76,
  'graphql': 73,
  'microservices': 84,
  'cybersecurity': 86
}

function normalizeSkill(skill: string): string {
  const s = skill.trim().toLowerCase()
  for (const [canonical, synonyms] of Object.entries(SKILL_SYNONYMS)) {
    if (s === canonical || (synonyms as string[]).includes(s)) {
      return canonical
    }
  }
  return s
}

function candidateHasSkill(candidate: CandidateCardData, skillName: string): boolean {
  const normSkill = normalizeSkill(skillName)
  // Check topSkills
  const inTop = candidate.topSkills?.some(ts => {
    const tsNorm = normalizeSkill(ts.skill)
    return tsNorm === normSkill || ts.skill.toLowerCase().includes(normSkill) || normSkill.includes(ts.skill.toLowerCase())
  })
  if (inTop) return true

  // Check matchFactors
  const inFactors = candidate.matchFactors?.some(mf => {
    const mfNorm = normalizeSkill(mf)
    return mfNorm === normSkill || mf.toLowerCase().includes(normSkill)
  })
  if (inFactors) return true

  // Check relevant projects tech stack
  const inProjects = candidate.relevantProjects?.some(p =>
    p.techStack?.some(tech => normalizeSkill(tech) === normSkill || tech.toLowerCase().includes(normSkill))
  )
  if (inProjects) return true

  return false
}

export async function computeTalentIntelligenceDashboard(
  companyId: number = 1,
  role: string = 'Software Developer',
  customSkills?: string[],
  filters: Partial<CandidateFilterCriteria> = {}
): Promise<TalentIntelligenceDashboardData> {
  const requiredSkills = customSkills && customSkills.length > 0
    ? customSkills
    : (ROLE_PRESET_SKILLS[role] || ['JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'REST APIs'])

  const criteria: CandidateFilterCriteria = {
    role,
    requiredSkills,
    branch: filters.branch,
    degree: filters.degree,
    minCgpa: filters.minCgpa,
    graduationYear: filters.graduationYear,
    topLimit: 'all',
    sortBy: 'match',
    search: filters.search
  }

  // 1. Fetch real evaluated candidates from our robust candidate intelligence engine
  const evalResult = await evaluateCandidatesForRequirement(criteria, companyId)
  const allCandidates: CandidateCardData[] = [...evalResult.candidates, ...evalResult.ineligibleCandidates]
  const totalTalentPool = allCandidates.length

  // 2. Compute Market-to-Talent Radar Metrics
  const radarMetrics: SkillRadarItem[] = requiredSkills.map((skill, index) => {
    const norm = normalizeSkill(skill)
    // Company Need: Top 3 skills are weighted 90-95%, others 75-85%
    const companyNeed = Math.max(70, Math.min(95, 95 - index * 4))
    // Industry Demand from benchmarks or default to 80%
    const industryDemand = INDUSTRY_DEMAND_BENCHMARKS[norm] || 80

    // Available Talent % in our active database
    const candidatesWithSkill = allCandidates.filter(c => candidateHasSkill(c, skill)).length
    const availableTalent = totalTalentPool > 0
      ? Math.round((candidatesWithSkill / totalTalentPool) * 100)
      : 0

    const talentGap = availableTalent - companyNeed

    let category: SkillRadarItem['category'] = 'Other'
    if (['aws', 'docker', 'kubernetes', 'ci/cd', 'linux'].includes(norm)) category = 'Cloud/DevOps'
    else if (['sql', 'postgresql', 'mongodb', 'redis', 'database'].includes(norm)) category = 'Database'
    else if (['system design', 'rest apis', 'microservices'].includes(norm)) category = 'Architecture'
    else if (['python', 'java', 'c++', 'javascript', 'typescript'].includes(norm)) category = 'Languages'
    else category = 'Core'

    return {
      skill,
      companyNeed,
      industryDemand,
      availableTalent,
      talentGap,
      category
    }
  })

  // 3. Compute Department / Branch Talent Comparison Matrix
  const departmentGroups = new Map<string, CandidateCardData[]>()
  for (const cand of allCandidates) {
    const dept = cand.branch || 'Computer Engineering'
    if (!departmentGroups.has(dept)) {
      departmentGroups.set(dept, [])
    }
    departmentGroups.get(dept)!.push(cand)
  }

  const departmentComparisons: DepartmentTalentComparison[] = []
  for (const [departmentName, cands] of Array.from(departmentGroups.entries())) {
    const studentCount = cands.length
    const skillsStrength: Record<string, number> = {}
    let totalPct = 0

    for (const skill of requiredSkills) {
      const matchCount = cands.filter(c => candidateHasSkill(c, skill)).length
      const pct = studentCount > 0 ? Math.round((matchCount / studentCount) * 100) : 0
      skillsStrength[skill] = pct
      totalPct += pct
    }

    const overallStrength = requiredSkills.length > 0 ? Math.round(totalPct / requiredSkills.length) : 0

    // Find top skill for department
    let topSkill = requiredSkills[0] || 'General Tech'
    let highestPct = -1
    for (const [sk, pct] of Object.entries(skillsStrength)) {
      if (pct > highestPct) {
        highestPct = pct
        topSkill = sk
      }
    }

    departmentComparisons.push({
      departmentId: departmentName.replace(/\s+/g, '-').toLowerCase(),
      departmentName,
      studentCount,
      skillsStrength,
      overallStrength,
      topSkill
    })
  }

  // Sort departments by overall talent strength
  departmentComparisons.sort((a, b) => b.overallStrength - a.overallStrength)

  // 4. Candidate Classification into 4 Tiers
  const exactMatches: CandidateCardData[] = []
  const nearMatches: CandidateCardData[] = []
  const potentialMatches: CandidateCardData[] = []
  const lowMatches: CandidateCardData[] = []

  for (const cand of evalResult.candidates) {
    const score = cand.jobMatchScore
    const missingCount = cand.missingFactors?.length || 0

    if (score >= 78 || missingCount <= 1 && score >= 70) {
      exactMatches.push(cand)
    } else if (score >= 58 || (missingCount <= 2 && score >= 50)) {
      nearMatches.push(cand)
    } else if (score >= 38) {
      potentialMatches.push(cand)
    } else {
      lowMatches.push(cand)
    }
  }

  // 5. "Don't Overlook" AI Engine
  // Identify candidates who are NOT exact matches but possess exceptional potential score
  const overlookedCandidates: OverlookedCandidate[] = []
  const nonExactPool = [...nearMatches, ...potentialMatches]

  for (const cand of nonExactPool) {
    let potentialScore = 60 // Baseline

    // Positive indicators
    // A. Projects
    if (cand.relevantProjectsCount >= 2) potentialScore += 12
    else if (cand.relevantProjectsCount === 1) potentialScore += 6

    // B. Academic consistency
    if (cand.cgpa >= 8.5) potentialScore += 10
    else if (cand.cgpa >= 7.8) potentialScore += 5

    // C. Verification trust
    if (cand.academicSummary?.cgpa?.isVerified) potentialScore += 6

    // D. Internships or practical experience
    if (cand.internshipsCount >= 1) potentialScore += 8

    // E. Match breakdown strengths (role relevance and learning depth)
    if (cand.matchBreakdown?.roleRelevanceScore >= 14) potentialScore += 8

    potentialScore = Math.min(96, Math.max(50, potentialScore))

    // Determine standout factor and missing skills
    const missingSkills = cand.missingFactors && cand.missingFactors.length > 0
      ? cand.missingFactors.slice(0, 3)
      : ['Specific Framework Experience']

    const strengths = cand.topSkills?.map(s => s.skill).slice(0, 4) || ['Strong Fundamentals']

    let standoutFactor = 'Balanced Engineering Profile'
    if (cand.relevantProjectsCount >= 2) standoutFactor = 'High Project Portfolio Impact'
    else if (cand.cgpa >= 8.5) standoutFactor = 'Top Academic Distinction'
    else if (cand.internshipsCount >= 1) standoutFactor = 'Demonstrated Industry Experience'

    let recommendedAction = 'Interview / Upskill'
    if (potentialScore >= 88) recommendedAction = 'Fast-Track Technical Screen'
    else if (missingSkills.length === 1) recommendedAction = 'Targeted 2-Week Micro-Bridge'

    const aiInsight = `Strong candidate with high domain aptitude (${cand.jobMatchScore}% match). Missing only ${missingSkills.slice(0, 2).join(', ')}. Demonstrated strong competencies in ${strengths.slice(0, 2).join(', ')} indicating fast role-readiness.`

    overlookedCandidates.push({
      candidate: cand,
      potentialScore,
      missingSkills,
      strengths,
      aiInsight,
      recommendedAction,
      standoutFactor
    })
  }

  // Sort overlooked candidates by potentialScore descending
  overlookedCandidates.sort((a, b) => b.potentialScore - a.potentialScore)

  // 6. Compute Hiring Opportunities across key market roles
  const opportunityRoles = [
    'Software Developer',
    'Python Backend Developer',
    'Frontend Developer',
    'Full Stack Developer',
    'DevOps & Cloud Engineer',
    'Data Scientist / AI Engineer'
  ]

  const hiringOpportunities: HiringOpportunity[] = opportunityRoles.map(oppRole => {
    const oppSkills = ROLE_PRESET_SKILLS[oppRole] || ['Coding', 'Problem Solving']
    const exactCount = allCandidates.filter(c => {
      const matchCount = oppSkills.filter(s => candidateHasSkill(c, s)).length
      return matchCount >= Math.ceil(oppSkills.length * 0.75)
    }).length

    const nearCount = allCandidates.filter(c => {
      const matchCount = oppSkills.filter(s => candidateHasSkill(c, s)).length
      return matchCount >= Math.ceil(oppSkills.length * 0.45) && matchCount < Math.ceil(oppSkills.length * 0.75)
    }).length

    const totalQualified = exactCount + nearCount

    let status: HiringOpportunity['status'] = 'Moderate Pipeline'
    let recommendation = 'Standard drive rollout recommended.'

    if (exactCount >= 8 || totalQualified >= 16) {
      status = 'Strong Hiring Opportunity'
      recommendation = `Abundant talent pool (${exactCount} exact matches). High placement conversion expected.`
    } else if (exactCount <= 2 && nearCount <= 5) {
      status = 'Talent Shortage'
      recommendation = `Talent scarcity detected. Consider broadening criteria or offering a skill-bridge program.`
    }

    return {
      role: oppRole,
      exactCount,
      nearCount,
      totalQualified,
      status,
      recommendation,
      topSkillsInDemand: oppSkills.slice(0, 4)
    }
  })

  // 7. Top KPIs
  const topDept = departmentComparisons.length > 0 ? departmentComparisons[0].departmentName : 'Computer Engineering'
  const avgMatch = evalResult.candidates.length > 0
    ? Math.round(evalResult.candidates.reduce((acc, c) => acc + c.jobMatchScore, 0) / evalResult.candidates.length)
    : 0

  const kpis: TalentKPIs = {
    totalTalentPool,
    exactMatchesCount: exactMatches.length,
    nearMatchesCount: nearMatches.length,
    highPotentialCount: overlookedCandidates.filter(o => o.potentialScore >= 80).length,
    averageMatchScore: avgMatch,
    topTalentCollege: topDept,
    topDepartment: topDept
  }

  // 8. AI Talent Insight synthesis
  const surpluses = radarMetrics.filter(m => m.availableTalent >= 60).map(m => m.skill)
  const shortages = radarMetrics.filter(m => m.availableTalent < 40).map(m => m.skill)

  const aiInsight: AITalentInsight = {
    summary: `The talent pool demonstrates solid mastery in ${surpluses.slice(0, 2).join(', ') || 'core web frameworks'}, while ${shortages.slice(0, 2).join(', ') || 'advanced cloud & architecture'} present major hiring bottlenecks.`,
    keySurpluses: surpluses.length > 0 ? surpluses : ['Core Programming', 'Web Basics'],
    keyShortages: shortages.length > 0 ? shortages : ['Distributed Systems', 'Cloud DevOps'],
    nearMatchOpportunity: `${nearMatches.length} candidates are within 1–2 skills of satisfying your ${role} requirements.`,
    topDepartmentInsight: `${topDept} leads with the highest concentration of ${requiredSkills.slice(0, 2).join(' + ')} talent (${departmentComparisons[0]?.overallStrength || 75}% average density).`,
    topCollegeInsight: `${topDept} leads with highest concentration (${departmentComparisons[0]?.overallStrength || 75}%).`,
    strategicRecommendations: [
      `Prioritize technical recruitment within the ${topDept} cohort for immediate skill alignment.`,
      `Leverage the "Don't Overlook" list to interview candidates with high potential scores across branches (${kpis.highPotentialCount} candidates detected).`,
      `Offer a 2-week bridge module for missing skills like ${shortages[0] || 'Docker'} to unlock ${nearMatches.length} near-match candidates.`
    ]
  }

  return {
    role,
    skills: requiredSkills,
    kpis,
    radarMetrics,
    departmentComparisons,
    collegeComparisons: departmentComparisons, // Backward-compatible alias
    tiers: {
      exactMatches,
      nearMatches,
      potentialMatches,
      lowMatches
    },
    overlookedCandidates,
    hiringOpportunities,
    aiInsight,
    filtersApplied: {
      branch: filters.branch,
      degree: filters.degree,
      minCgpa: filters.minCgpa,
      graduationYear: filters.graduationYear
    }
  }
}

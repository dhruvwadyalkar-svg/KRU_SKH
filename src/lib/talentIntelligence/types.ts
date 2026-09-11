import { CandidateCardData } from '@/lib/candidateIntelligenceService'

export interface TalentKPIs {
  totalTalentPool: number
  exactMatchesCount: number
  nearMatchesCount: number
  highPotentialCount: number
  averageMatchScore: number
  topTalentCollege?: string
  topDepartment?: string
}

export interface SkillRadarItem {
  skill: string
  companyNeed: number     // 0 - 100%
  industryDemand: number  // 0 - 100%
  availableTalent: number // 0 - 100%
  talentGap: number       // availableTalent - companyNeed (-100% to +100%)
  category: 'Core' | 'Cloud/DevOps' | 'Database' | 'Architecture' | 'Languages' | 'Other'
}

export interface DepartmentTalentComparison {
  departmentId: string | number
  departmentName: string
  studentCount: number
  skillsStrength: Record<string, number> // skillName -> percentage 0-100
  overallStrength: number                 // 0-100%
  topSkill: string
}

// Backward-compatible alias
export type CollegeTalentComparison = DepartmentTalentComparison

export interface OverlookedCandidate {
  candidate: CandidateCardData
  potentialScore: number                  // 0 - 100
  missingSkills: string[]
  strengths: string[]
  aiInsight: string
  recommendedAction: string               // e.g. "Interview / Upskill", "Fast-track Technical Screen"
  standoutFactor: string                  // e.g. "Exceptional Coding Execution", "Strong Adjacent Tech Stack"
}

export interface CandidateTierClassification {
  exactMatches: CandidateCardData[]
  nearMatches: CandidateCardData[]
  potentialMatches: CandidateCardData[]
  lowMatches: CandidateCardData[]
}

export interface HiringOpportunity {
  role: string
  exactCount: number
  nearCount: number
  totalQualified: number
  status: 'Strong Hiring Opportunity' | 'Moderate Pipeline' | 'Talent Shortage'
  recommendation: string
  topSkillsInDemand: string[]
}

export interface AITalentInsight {
  summary: string
  keySurpluses: string[]
  keyShortages: string[]
  nearMatchOpportunity: string
  topDepartmentInsight: string
  topCollegeInsight?: string
  strategicRecommendations: string[]
}

export interface JobDescriptionAnalysis {
  roleTitle: string
  requiredSkills: string[]
  preferredSkills: string[]
  experienceIndicators: string[]
  technicalRequirements: string[]
  softSkills: string[]
}

export interface CandidateComparisonMetric {
  candidateId: number
  candidateName: string
  college: string
  branch?: string
  cgpa: number
  jobMatchScore: number
  potentialScore: number
  matchedSkillsCount: number
  missingSkills: string[]
  strengths: string[]
  codingScore: number | null
  interviewScore: number | null
  isVerified: boolean
  overallRanking: number
}

export interface CandidateComparisonResult {
  role: string
  requiredSkills: string[]
  metrics: CandidateComparisonMetric[]
  aiComparativeSynthesis: string
  tradeoffAnalysis: {
    bestOverall: string
    highestPotential: string
    immediateRoleReady: string
  }
}

export interface BridgeRoadmapWeek {
  week: number
  focusSkill: string
  learningObjectives: string[]
  recommendedProjects: string[]
  curatedSearchQuery: string
  estimatedHours: number
}

export interface CandidateBridgeRoadmap {
  candidateId: number
  candidateName: string
  targetRole: string
  missingSkills: string[]
  estimatedTimeToReadinessWeeks: number
  curriculum: BridgeRoadmapWeek[]
  assessmentMilestone: string
}

export interface TalentIntelligenceDashboardData {
  role: string
  skills: string[]
  kpis: TalentKPIs
  radarMetrics: SkillRadarItem[]
  departmentComparisons: DepartmentTalentComparison[]
  collegeComparisons: DepartmentTalentComparison[] // Alias for backward compatibility
  tiers: CandidateTierClassification
  overlookedCandidates: OverlookedCandidate[]
  hiringOpportunities: HiringOpportunity[]
  aiInsight: AITalentInsight
  filtersApplied: {
    branch?: string
    degree?: string
    minCgpa?: number
    graduationYear?: number | 'all'
    college?: string
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { evaluateCandidatesForRequirement, ROLE_PRESET_SKILLS } from '@/lib/candidateIntelligenceService'
import { generateBridgeRoadmapAI } from '@/lib/talentIntelligence/aiTalentService'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (session && session.role !== 'company' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Company access required.' }, { status: 403 })
    }

    const body = await request.json()
    const { candidateId, missingSkills, role = 'Software Developer' } = body

    if (!candidateId) {
      return NextResponse.json({ error: 'candidateId is required' }, { status: 400 })
    }

    const evalResult = await evaluateCandidatesForRequirement({
      role,
      requiredSkills: ROLE_PRESET_SKILLS[role] || ['Coding'],
      topLimit: 'all'
    }, session?.role === 'company' ? session.userId : 1)

    const candidate = evalResult.candidates.find(c => c.id === Number(candidateId)) ||
      evalResult.ineligibleCandidates.find(c => c.id === Number(candidateId))

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    const skillsToBridge = Array.isArray(missingSkills) && missingSkills.length > 0
      ? missingSkills
      : candidate.missingFactors && candidate.missingFactors.length > 0
        ? candidate.missingFactors
        : ['Advanced Cloud Architecture', 'Docker']

    const roadmap = await generateBridgeRoadmapAI(candidate, skillsToBridge, role)

    return NextResponse.json({
      success: true,
      roadmap
    })
  } catch (error: any) {
    console.error('Bridge Roadmap API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate bridge roadmap', details: error.message },
      { status: 500 }
    )
  }
}

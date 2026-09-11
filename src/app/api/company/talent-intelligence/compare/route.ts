import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { evaluateCandidatesForRequirement, ROLE_PRESET_SKILLS } from '@/lib/candidateIntelligenceService'
import { generateCandidateComparisonAI } from '@/lib/talentIntelligence/aiTalentService'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (session && session.role !== 'company' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Company access required.' }, { status: 403 })
    }

    const body = await request.json()
    const { candidateIds, role = 'Software Developer', requiredSkills } = body

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length < 2 || candidateIds.length > 4) {
      return NextResponse.json(
        { error: 'Please select between 2 and 4 candidates to compare.' },
        { status: 400 }
      )
    }

    const skillsToUse = requiredSkills && requiredSkills.length > 0
      ? requiredSkills
      : (ROLE_PRESET_SKILLS[role] || ['JavaScript', 'React', 'Node.js', 'SQL'])

    const evalResult = await evaluateCandidatesForRequirement({
      role,
      requiredSkills: skillsToUse,
      topLimit: 'all'
    }, session?.role === 'company' ? session.userId : 1)

    const allCandidates = [...evalResult.candidates, ...evalResult.ineligibleCandidates]
    const selected = allCandidates.filter(c => candidateIds.includes(c.id))

    if (selected.length < 2) {
      return NextResponse.json(
        { error: 'Could not locate all selected candidates in the talent pool.' },
        { status: 404 }
      )
    }

    const comparison = await generateCandidateComparisonAI(selected, role, skillsToUse)

    return NextResponse.json({
      success: true,
      comparison
    })
  } catch (error: any) {
    console.error('Candidate Comparison API error:', error)
    return NextResponse.json(
      { error: 'Failed to compare candidates', details: error.message },
      { status: 500 }
    )
  }
}

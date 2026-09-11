import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { analyzeJobDescriptionWithAI } from '@/lib/talentIntelligence/aiTalentService'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (session && session.role !== 'company' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Company access required.' }, { status: 403 })
    }

    const body = await request.json()
    const { jobDescription } = body

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 20) {
      return NextResponse.json(
        { error: 'Please provide a valid job description with at least 20 characters.' },
        { status: 400 }
      )
    }

    const analysis = await analyzeJobDescriptionWithAI(jobDescription)

    return NextResponse.json({
      success: true,
      analysis
    })
  } catch (error: any) {
    console.error('Analyze JD API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze job description', details: error.message },
      { status: 500 }
    )
  }
}

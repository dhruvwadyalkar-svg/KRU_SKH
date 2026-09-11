import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { computeTalentIntelligenceDashboard } from '@/lib/talentIntelligence/talentService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    // Authorization check: Only company or admin allowed, with fallback in dev
    const isCompany = session?.role === 'company'
    const companyId = isCompany ? session.userId : 1

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') || 'Software Developer'
    const skillsParam = searchParams.get('skills')
    const customSkills = skillsParam
      ? skillsParam.split(',').map(s => s.trim()).filter(Boolean)
      : undefined

    const branch = searchParams.get('branch') || undefined
    const degree = searchParams.get('degree') || undefined
    const minCgpa = searchParams.get('minCgpa') ? parseFloat(searchParams.get('minCgpa')!) : undefined
    const graduationYear = searchParams.get('graduationYear')
      ? searchParams.get('graduationYear') === 'all'
        ? 'all'
        : parseInt(searchParams.get('graduationYear')!)
      : undefined
    const search = searchParams.get('search') || undefined

    const filters = {
      branch,
      degree,
      minCgpa,
      graduationYear,
      search
    }

    const data = await computeTalentIntelligenceDashboard(
      companyId,
      role,
      customSkills,
      filters
    )

    return NextResponse.json({
      success: true,
      data
    }, {
      headers: { 'Cache-Control': 'no-store' }
    })
  } catch (error: any) {
    console.error('Talent Intelligence Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to compute talent intelligence data', details: error.message },
      { status: 500 }
    )
  }
}

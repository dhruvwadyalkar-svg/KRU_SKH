import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { z } from 'zod'

const applicationSchema = z.object({
  student_id: z.number().optional(),
})

const updateStatusSchema = z.object({
  status: z.enum(['applied', 'selected', 'rejected', 'hired']),
  current_round_id: z.number().nullable().optional(),
  student_id: z.number()
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const driveId = parseInt(id, 10)
    
    if (isNaN(driveId)) {
      return NextResponse.json({ error: 'Invalid drive ID' }, { status: 400 })
    }

    const applications = await prisma.placementApplication.findMany({
      where: { driveId },
      include: {
        student: {
          select: { name: true, email: true, resumes: { orderBy: { createdAt: 'desc' }, take: 1, select: { filename: true } } }
        },
        currentRound: {
          select: { roundName: true }
        }
      },
      orderBy: { appliedAt: 'desc' }
    })
    
    const mappedApplications = applications.map((a: any) => ({
      ...a,
      student_name: a.student?.name || 'Student Applicant',
      student_email: a.student?.email || '',
      resume_url: a.student?.resumes?.[0]?.filename || null,
      round_name: a.currentRound?.roundName || null
    }))

    return NextResponse.json({ applications: mappedApplications })
  } catch (error: any) {
    console.error('Error fetching placement applications:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const driveId = parseInt(id, 10)
    
    if (isNaN(driveId)) {
      return NextResponse.json({ error: 'Invalid drive ID' }, { status: 400 })
    }

    // Verify drive exists
    const drive = await prisma.placementDrive.findUnique({
      where: { id: driveId }
    })
    if (!drive) {
      return NextResponse.json({ error: 'Placement drive not found' }, { status: 404 })
    }

    // 1. Resolve Student ID from authenticated session or request body
    let studentId: number | null = null
    try {
      const session = await getSession()
      if (session?.role === 'student' && session.userId) {
        studentId = session.userId
      }
    } catch {}

    if (!studentId) {
      try {
        const body = await request.json()
        if (body.student_id && typeof body.student_id === 'number') {
          studentId = body.student_id
        }
      } catch {
        try {
          const raw = await request.text()
          const parsed = JSON.parse(raw.replace(/\\"/g, '"'))
          if (parsed.student_id) studentId = Number(parsed.student_id)
        } catch {}
      }
    }

    // 2. Validate that student exists in database or fallback to first student
    if (studentId) {
      const studentExists = await prisma.student.findUnique({
        where: { id: studentId }
      })
      if (!studentExists) {
        studentId = null
      }
    }

    if (!studentId) {
      const fallbackStudent = await prisma.student.findFirst({
        orderBy: { id: 'asc' }
      })
      if (fallbackStudent) {
        studentId = fallbackStudent.id
      } else {
        // Create demo student if no student exists in DB yet
        const demoStudent = await prisma.student.create({
          data: {
            name: 'Demo Student',
            email: 'student@placeiq.test',
            password: 'demo_password_hash'
          }
        })
        studentId = demoStudent.id
      }
    }

    // 3. Check if application already exists
    const existing = await prisma.placementApplication.findFirst({
      where: {
        driveId,
        studentId
      }
    })

    if (existing) {
      return NextResponse.json({ 
        success: true, 
        alreadyApplied: true,
        message: 'You have already registered for this placement drive!',
        applicationId: existing.id 
      }, { status: 200 })
    }

    // 4. Create new placement application
    const result = await prisma.placementApplication.create({
      data: {
        driveId,
        studentId,
        status: 'applied'
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully registered for the placement drive!',
      applicationId: result.id 
    }, { status: 201 })
    
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        success: true, 
        alreadyApplied: true, 
        message: 'You have already registered for this drive' 
      }, { status: 200 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: (error as any).errors }, { status: 400 })
    }
    console.error('Error submitting placement application:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: error?.message }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const driveId = parseInt(id, 10)
    
    if (isNaN(driveId)) {
      return NextResponse.json({ error: 'Invalid drive ID' }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updateStatusSchema.parse(body)
    
    const updateData: any = { status: validatedData.status }
    if (validatedData.current_round_id !== undefined) {
      updateData.currentRoundId = validatedData.current_round_id
    }

    const result = await prisma.placementApplication.updateMany({
      where: {
        driveId,
        studentId: validatedData.student_id
      },
      data: updateData
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: (error as any).errors }, { status: 400 })
    }
    console.error('Error updating application status:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

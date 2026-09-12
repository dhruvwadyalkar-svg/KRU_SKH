import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    let realName = session.name
    let realEmail = session.email

    if (session.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { id: session.userId },
        select: { name: true, email: true }
      })
      if (student) {
        realName = student.name || realName
        realEmail = student.email || realEmail
      }
    } else if (session.role === 'company') {
      const company = await prisma.company.findUnique({
        where: { id: session.userId },
        select: { name: true, email: true }
      })
      if (company) {
        realName = company.name || realName
        realEmail = company.email || realEmail
      }
    } else if (session.role === 'trainer') {
      const trainer = await prisma.trainer.findUnique({
        where: { id: session.userId },
        select: { name: true, email: true }
      })
      if (trainer) {
        realName = trainer.name || realName
        realEmail = trainer.email || realEmail
      }
    } else if (session.role === 'institution-admin') {
      const admin = await prisma.institutionAdmin.findUnique({
        where: { id: session.userId },
        select: { name: true, email: true }
      })
      if (admin) {
        realName = admin.name || realName
        realEmail = admin.email || realEmail
      }
    }

    return NextResponse.json({
      user: {
        id: session.userId,
        role: session.role,
        name: realName || (realEmail ? realEmail.split('@')[0] : 'User'),
        email: realEmail || ''
      }
    })
  } catch (error: any) {
    console.error('Fetch auth me error:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

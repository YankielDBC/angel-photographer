import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const blockedDates = await prisma.blockedDate.findMany({
      orderBy: { date: 'asc' }
    })
    return NextResponse.json(blockedDates)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blocked dates' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { date, reason } = body

    // Check if already blocked
    const existing = await prisma.blockedDate.findUnique({
      where: { date: new Date(date) }
    })

    if (existing) {
      return NextResponse.json({ error: 'Date already blocked' }, { status: 400 })
    }

    const blockedDate = await prisma.blockedDate.create({
      data: {
        date: new Date(date),
        reason: reason || null
      }
    })

    return NextResponse.json(blockedDate, { status: 201 })
  } catch (error) {
    console.error('Block date error:', error)
    return NextResponse.json({ error: 'Failed to block date' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    if (!date) {
      return NextResponse.json({ error: 'Date required' }, { status: 400 })
    }

    await prisma.blockedDate.delete({
      where: { date: new Date(date) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to unblock date' }, { status: 500 })
  }
}

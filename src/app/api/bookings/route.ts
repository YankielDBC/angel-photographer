import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { date: 'asc' }
    })
    return NextResponse.json(bookings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clientName, clientEmail, clientPhone, date, serviceType, notes } = body

    // Allow multiple bookings per day - no date check needed
    // (User pays the fee, so they can book multiple days)

    // The fee is $50, which counts towards the selected package
    const prices: Record<string, number> = {
      portraits: 150,
      events: 300,
      editorial: 250
    }

    const booking = await prisma.booking.create({
      data: {
        clientName,
        clientEmail,
        clientPhone,
        date: new Date(date),
        serviceType,
        notes,
        status: 'pending',
        amount: 50 // $50 fee, counts towards package
      }
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}

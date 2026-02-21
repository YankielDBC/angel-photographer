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

    // Check if date is already booked
    const existingBooking = await prisma.booking.findUnique({
      where: { date: new Date(date) }
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Esta fecha ya está reservada. Por favor elige otra.' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.create({
      data: {
        clientName,
        clientEmail,
        clientPhone,
        date: new Date(date),
        serviceType,
        notes,
        status: 'pending'
      }
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}

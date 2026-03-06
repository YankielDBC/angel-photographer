import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' })
const docClient = DynamoDBDocumentClient.from(client)
const BOOKINGS_TABLE = 'angel-bookings'
const BLOCKED_TABLE = 'angel-blocked'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    // Get all bookings (except cancelled)
    const bookingsResult = await docClient.send(new ScanCommand({ TableName: BOOKINGS_TABLE }))
    const bookings = (bookingsResult.Items || []).filter((b: any) => b.status !== 'cancelled')
    
    // Get all blocked
    const blockedResult = await docClient.send(new ScanCommand({ TableName: BLOCKED_TABLE }))
    const blocked = blockedResult.Items || []
    
    const blockedDaysSet = new Set(
      blocked.filter((b: any) => b.type === 'day').map((b: any) => b.date)
    )
    
    const blockedSlotsByDate: Record<string, string[]> = {}
    blocked.filter((b: any) => b.type === 'slot').forEach((slot: any) => {
      if (!blockedSlotsByDate[slot.date]) blockedSlotsByDate[slot.date] = []
      blockedSlotsByDate[slot.date].push(slot.time)
    })

    const bookingsByDate: Record<string, string[]> = {}
    bookings.forEach((booking: any) => {
      if (booking.sessionDate) {
        if (!bookingsByDate[booking.sessionDate]) bookingsByDate[booking.sessionDate] = []
        bookingsByDate[booking.sessionDate].push(booking.sessionTime)
      }
    })

    const unavailableDates: string[] = []
    const allTimes = ['9:30', '11:30', '14:00', '16:00', '18:00']
    
    const allDates = new Set<string>([...blockedDaysSet])
    Object.keys(bookingsByDate).forEach(d => allDates.add(d))

    for (const dateKey of allDates) {
      const blocked = blockedSlotsByDate[dateKey] || []
      const booked = bookingsByDate[dateKey] || []
      const occupied = [...new Set([...blocked, ...booked])]
      
      if (occupied.length >= allTimes.length) {
        unavailableDates.push(dateKey)
      }
    }

    return NextResponse.json({
      unavailableDates,
      blockedDays: Array.from(blockedDaysSet),
      details: { blockedSlotsByDate, bookingsByDate }
    })
  } catch (error) {
    console.error('Availability error:', error)
    return NextResponse.json({
      unavailableDates: [],
      blockedDays: [],
      details: { blockedSlotsByDate: {}, bookingsByDate: {} }
    })
  }
}

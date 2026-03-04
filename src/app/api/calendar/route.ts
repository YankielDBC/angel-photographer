import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION || 'us-east-1',
})

const docClient = DynamoDBDocumentClient.from(client)
const BOOKINGS_TABLE = 'angel-bookings'

// Horarios disponibles
const TIME_SLOTS = ['9:30', '11:30', '14:00', '16:00', '18:00']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month') // YYYY-MM
  const startDate = searchParams.get('startDate') // YYYY-MM-DD
  const endDate = searchParams.get('endDate') // YYYY-MM-DD
  
  try {
    // 1. Obtener todas las reservas
    const bookingsResult = await docClient.send(new ScanCommand({
      TableName: BOOKINGS_TABLE
    }))
    const bookings = (bookingsResult.Items || []).filter((b: any) => b.status !== 'cancelled')
    
    // 2. Calcular disponibilidad por día
    const availability: Record<string, any> = {}
    
    // Filtrar por rango si se especifica
    let datesToCheck: string[] = []
    
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const current = new Date(start)
      while (current <= end) {
        datesToCheck.push(current.toISOString().split('T')[0])
        current.setDate(current.getDate() + 1)
      }
    } else if (month) {
      const [year, m] = month.split('-').map(Number)
      const daysInMonth = new Date(year, m, 0).getDate()
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, m - 1, day)
        datesToCheck.push(date.toISOString().split('T')[0])
      }
    } else {
      // Mes actual por defecto
      const now = new Date()
      const year = now.getFullYear()
      const monthNum = now.getMonth() + 1
      const daysInMonth = new Date(year, monthNum, 0).getDate()
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, monthNum - 1, day)
        datesToCheck.push(date.toISOString().split('T')[0])
      }
    }
    
    for (const date of datesToCheck) {
      const dateBookings = bookings.filter((b: any) => b.sessionDate === date)
      
      const bookedTimes = dateBookings.map((b: any) => b.sessionTime)
      
      // Calcular estado de cada horario
      const slots = TIME_SLOTS.map(time => {
        const booking = dateBookings.find((b: any) => b.sessionTime === time)
        
        if (booking) {
          return {
            time,
            status: 'booked',
            booking: {
              id: booking.id,
              clientName: booking.clientName,
              serviceType: booking.serviceType,
              serviceTier: booking.serviceTier,
              status: booking.status
            }
          }
        }
        
        return { time, status: 'available' }
      })
      
      const availableSlots = slots.filter((s: any) => s.status === 'available').length
      const bookedSlots = slots.filter((s: any) => s.status === 'booked').length
      
      // Determinar estado del día
      let dayStatus: string
      if (availableSlots === 0 && bookedSlots > 0) {
        dayStatus = 'full' // Rojo - día completo
      } else if (bookedSlots > 0) {
        dayStatus = 'has_bookings' // Amarillo - tiene reservas
      } else if (availableSlots === TIME_SLOTS.length) {
        dayStatus = 'available' // Verde - 100% disponible
      } else {
        dayStatus = 'partial' // Parcialmente disponible
      }
      
      availability[date] = {
        date,
        status: dayStatus,
        slots,
        summary: {
          total: TIME_SLOTS.length,
          available: availableSlots,
          booked: bookedSlots,
          blocked: 0
        },
        bookings: dateBookings.map((b: any) => ({
          id: b.id,
          clientName: b.clientName,
          serviceType: b.serviceType,
          serviceTier: b.serviceTier,
          sessionTime: b.sessionTime,
          status: b.status,
          totalAmount: b.totalAmount
        }))
      }
    }
    
    return NextResponse.json({
      month: month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      timeSlots: TIME_SLOTS,
      availability
    })
    
  } catch (error) {
    console.error('Error fetching calendar:', error)
    return NextResponse.json({ error: 'Error al obtener calendario' }, { status: 500 })
  }
}

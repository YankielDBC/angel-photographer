import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { sendReminderEmail } from '@/app/api/utils/email'

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION || 'us-east-1',
})

const docClient = DynamoDBDocumentClient.from(client)
const TABLE_NAME = 'angel-bookings'

// GET /api/cron/reminders
// Este endpoint debe ejecutarse cada hora via cron
// Envía recordatorios 24h antes (o 12h si la cita es <24h desde ahora)
export async function GET() {
  try {
    console.log('Running reminder cron job...')
    
    // Obtener todas las reservas confirmed/pending (no canceladas, no completadas)
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: '#status IN (:pending, :confirmed)',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':pending': 'pending',
        ':confirmed': 'confirmed'
      }
    }))

    const bookings = result.Items || []
    const now = new Date()
    const sentReminders: string[] = []
    const errors: string[] = []

    for (const booking of bookings) {
      // Skip if already sent reminder
      if (booking.reminderSent) continue
      
      // Parse session date and time
      const sessionDateTime = new Date(`${booking.sessionDate}T${booking.sessionTime}:00`)
      const hoursUntilSession = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
      
      // Solo enviar si falta 24h o menos (pero más de 2h para dar tiempo)
      if (hoursUntilSession <= 24 && hoursUntilSession > 2) {
        // Si falta <=12h, esperar hasta 12h; si falta >12h, esperar hasta 24h
        const targetHours = hoursUntilSession <= 12 ? 12 : 24
        
        // Solo enviar si falta aproximadamente la cantidad de horas correcta (±30 min)
        if (Math.abs(hoursUntilSession - targetHours) <= 0.5) {
          try {
            await sendReminderEmail({
              id: booking.id,
              clientName: booking.clientName,
              clientEmail: booking.clientEmail,
              clientPhone: booking.clientPhone,
              serviceType: booking.serviceType,
              serviceTier: booking.serviceTier,
              sessionDate: booking.sessionDate,
              sessionTime: booking.sessionTime,
              totalAmount: booking.totalAmount,
              depositPaid: booking.depositPaid,
              remainingPaid: booking.remainingPaid
            }, hoursUntilSession)
            
            // Marcar como enviado
            await docClient.send(new UpdateCommand({
              TableName: TABLE_NAME,
              Key: { id: booking.id },
              UpdateExpression: 'SET reminderSent = :sent, reminderSentAt = :sentAt',
              ExpressionAttributeValues: {
                ':sent': true,
                ':sentAt': new Date().toISOString()
              }
            }))
            
            sentReminders.push(booking.id)
            console.log(`Reminder sent for booking ${booking.id}`)
          } catch (err) {
            errors.push(`Failed to send reminder for ${booking.id}: ${err}`)
            console.error(`Error sending reminder for ${booking.id}:`, err)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: bookings.length,
      sent: sentReminders.length,
      sentIds: sentReminders,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Error in reminder cron:', error)
    return NextResponse.json(
      { error: 'Error processing reminders', details: String(error) },
      { status: 500 }
    )
  }
}

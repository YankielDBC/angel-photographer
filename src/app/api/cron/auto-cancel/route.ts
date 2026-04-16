import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { sendCancellationEmail } from '../../utils/email'

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION || 'us-east-1',
})

const docClient = DynamoDBDocumentClient.from(client)
const TABLE_NAME = 'angel-bookings'

// POST /api/cron/auto-cancel
// Cancela reservas pending que ya pasaron de fecha (NO confirmed)
// Reglas:
// 1. Solo reservas en estado "pending"
// 2. Solo si la fecha de la sesión ya pasó
// 3. NO cancelar si ya tiene paymentCompletedAt (ya pagó el depósito)
export async function POST() {
  try {
    console.log('Running auto-cancel cron...')
    
    // Obtener todas las reservas pending
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: '#status = :pending',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':pending': 'pending' }
    }))

    const bookings = result.Items || []
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const cancelled: string[] = []
    const errors: string[] = []
    const skippedPaid: string[] = []

    for (const booking of bookings) {
      // Verificar si ya tiene pago (depósito pagado) - NO cancelar
      if (booking.paymentCompletedAt) {
        console.log(`Skipping ${booking.id} - already paid deposit`)
        skippedPaid.push(booking.id)
        continue
      }
      
      // Verificar si la fecha de la sesión ya pasó
      const sessionDateParts = booking.sessionDate.split('-')
      const sessionDate = new Date(
        parseInt(sessionDateParts[0]), 
        parseInt(sessionDateParts[1]) - 1, 
        parseInt(sessionDateParts[2])
      )
      
      // Solo cancelar si la fecha de la sesión ya pasó (es anterior a hoy)
      if (sessionDate < today) {
        try {
          await docClient.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { id: booking.id },
            UpdateExpression: 'SET #status = :cancelled, updatedAt = :updatedAt, autoCancelledAt = :autoCancelledAt',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: {
              ':cancelled': 'cancelled',
              ':updatedAt': new Date().toISOString(),
              ':autoCancelledAt': new Date().toISOString()
            }
          }))
          cancelled.push(booking.id)
          console.log(`Auto-cancelled: ${booking.id} (session date ${booking.sessionDate} has passed)`)
          
          // Enviar email de cancelación
          try {
            await sendCancellationEmail({
              id: booking.id,
              clientName: booking.clientName || booking.client?.name || '',
              clientEmail: booking.clientEmail || booking.client?.email || '',
              clientPhone: booking.clientPhone || booking.client?.phone || '',
              serviceType: booking.serviceType || '',
              serviceTier: booking.serviceTier || '',
              sessionDate: booking.sessionDate || '',
              sessionTime: booking.sessionTime || '',
              totalAmount: typeof booking.totalAmount === 'number' ? booking.totalAmount : parseInt(booking.totalAmount) || 0,
              depositPaid: 100,
              remainingPaid: 0,
            })
          } catch (emailErr) {
            console.error(`Failed to send cancellation email for ${booking.id}:`, emailErr)
          }
          
        } catch (err) {
          errors.push(`Failed to cancel ${booking.id}: ${err}`)
        }
      } else {
        console.log(`Skipping ${booking.id} - session date ${booking.sessionDate} is in the future`)
      }
    }

    return NextResponse.json({
      success: true,
      checked: bookings.length,
      cancelled: cancelled.length,
      cancelledIds: cancelled,
      skippedPaid: skippedPaid.length,
      skippedPaidIds: skippedPaid,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Error in auto-cancel:', error)
    return NextResponse.json(
      { error: 'Error in auto-cancel', details: String(error) },
      { status: 500 }
    )
  }
}

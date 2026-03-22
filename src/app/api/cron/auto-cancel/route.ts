import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION || 'us-east-1',
})

const docClient = DynamoDBDocumentClient.from(client)
const TABLE_NAME = 'angel-bookings'

// POST /api/cron/auto-cancel
// Cancela reservas pending con más de 24h desde su cita
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
    const cancelled: string[] = []
    const errors: string[] = []

    for (const booking of bookings) {
      // Combinar fecha Y hora de la sesión
      const sessionDateTime = new Date(`${booking.sessionDate}T${booking.sessionTime || '00:00'}:00`)
      const diffHours = (now.getTime() - sessionDateTime.getTime()) / (1000 * 60 * 60)
      
      if (diffHours > 24) {
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
          console.log(`Auto-cancelled: ${booking.id} (${diffHours.toFixed(1)}h old)`)
        } catch (err) {
          errors.push(`Failed to cancel ${booking.id}: ${err}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      checked: bookings.length,
      cancelled: cancelled.length,
      cancelledIds: cancelled,
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

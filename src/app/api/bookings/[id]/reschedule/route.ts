import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { sendRescheduleConfirmation } from '@/app/api/utils/email'

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION || 'us-east-1',
})

const docClient = DynamoDBDocumentClient.from(client)
const TABLE_NAME = 'angel-bookings'

// POST /api/bookings/[id]/reschedule
// Body: { newDate: "2026-03-15", newTime: "14:00" }
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { newDate, newTime } = body

    if (!newDate || !newTime) {
      return NextResponse.json(
        { error: 'Fecha y hora son requeridos' },
        { status: 400 }
      )
    }

    // 1. Obtener booking actual
    const getResult = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'id = :id',
      ExpressionAttributeValues: { ':id': id }
    }))

    const currentBooking = getResult.Items?.[0]
    if (!currentBooking) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    const oldDate = currentBooking.sessionDate
    const oldTime = currentBooking.sessionTime

    // 2. Verificar disponibilidad en la nueva fecha/hora
    const availabilityCheck = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'sessionDate = :date AND sessionTime = :time AND #status <> :cancelled AND id <> :id',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':date': newDate,
        ':time': newTime,
        ':cancelled': 'cancelled',
        ':id': id
      }
    }))

    if (availabilityCheck.Items && availabilityCheck.Items.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe una reserva para esa fecha y hora' },
        { status: 409 }
      )
    }

    // 3. Actualizar la reserva con la nueva fecha/hora
    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: 'SET sessionDate = :newDate, sessionTime = :newTime, updatedAt = :updatedAt, rescheduleHistory = list_append(if_not_exists(rescheduleHistory, :emptyList), :historyEntry)',
      ExpressionAttributeValues: {
        ':newDate': newDate,
        ':newTime': newTime,
        ':updatedAt': new Date().toISOString(),
        ':emptyList': [],
        ':historyEntry': [{
          oldDate,
          oldTime,
          newDate,
          newTime,
          rescheduledAt: new Date().toISOString()
        }]
      },
      ReturnValues: 'ALL_NEW'
    }))

    // 4. Enviar email de confirmación al cliente
    const updatedBooking = result.Attributes
    if (updatedBooking?.clientEmail) {
      await sendRescheduleConfirmation({
        id: updatedBooking.id,
        clientName: updatedBooking.clientName,
        clientEmail: updatedBooking.clientEmail,
        clientPhone: updatedBooking.clientPhone,
        serviceType: updatedBooking.serviceType,
        serviceTier: updatedBooking.serviceTier,
        sessionDate: updatedBooking.sessionDate,
        sessionTime: updatedBooking.sessionTime,
        totalAmount: updatedBooking.totalAmount,
        depositPaid: updatedBooking.depositPaid,
        remainingPaid: updatedBooking.remainingPaid
      }, oldDate, oldTime)
    }

    return NextResponse.json({
      success: true,
      booking: result.Attributes,
      previousDate: oldDate,
      previousTime: oldTime
    })

  } catch (error) {
    console.error('Error rescheduling booking:', error)
    return NextResponse.json(
      { error: 'Error al reagendar reserva', details: String(error) },
      { status: 500 }
    )
  }
}

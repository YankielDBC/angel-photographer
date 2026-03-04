import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION || 'us-east-1',
})

const docClient = DynamoDBDocumentClient.from(client)
const TABLE_NAME = 'angel-bookings'

// PATCH - Actualizar reserva
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    
    // Verificar que la reserva existe
    const existing = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id }
    }))
    
    if (!existing.Item) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }
    
    // Campos permitidos para actualizar
    const allowedFields = [
      'clientName', 'clientEmail', 'clientPhone',
      'serviceType', 'serviceTier', 'sessionDate', 'sessionTime',
      'totalAmount', 'depositPaid', 'remainingPaid', 'paymentStatus',
      'status', 'sessionCost', 'stripeSessionId', 'notes'
    ]
    
    // Construir actualización
    const updateExpressions = ['updatedAt = :updatedAt']
    const expressionValues: Record<string, any> = {
      ':updatedAt': new Date().toISOString()
    }
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateExpressions.push(`${key} = :${key}`)
        expressionValues[`:${key}`] = typeof value === 'number' ? value : value
      }
    }
    
    // Recalcular remainingPaid si cambia totalAmount o depositPaid
    if (updates.totalAmount !== undefined || updates.depositPaid !== undefined) {
      const total = updates.totalAmount ?? existing.Item.totalAmount
      const deposit = updates.depositPaid ?? existing.Item.depositPaid
      updateExpressions.push('remainingPaid = :remainingPaid')
      expressionValues[':remainingPaid'] = total - deposit
    }
    
    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: 'SET ' + updateExpressions.join(', '),
      ExpressionAttributeValues: expressionValues,
      ReturnValues: 'ALL_NEW'
    }))
    
    return NextResponse.json({ success: true, booking: result.Attributes })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Error al actualizar reserva' }, { status: 500 })
  }
}

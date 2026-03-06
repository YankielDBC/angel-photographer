import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb'

export const dynamic = 'force-dynamic'

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION || 'us-east-1',
})

const docClient = DynamoDBDocumentClient.from(client)
const TABLE_NAME = 'angel-bookings'

// GET - Obtener una reserva por ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id }
    }))
    
    if (!result.Item) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }
    
    return NextResponse.json(result.Item)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json({ error: 'Error al obtener reserva' }, { status: 500 })
  }
}

// PATCH - Actualizar reserva por ID en la URL
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    
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
    
    // Campos permitidos
    const allowedFields = [
      'clientName', 'clientEmail', 'clientPhone',
      'serviceType', 'serviceTier', 'sessionDate', 'sessionTime',
      'totalAmount', 'depositPaid', 'remainingPaid', 'paymentStatus',
      'status', 'sessionCost', 'stripeSessionId', 'notes',
      'clientAge', 'clientNotes', 'family2', 'family4', 'hairMakeup',
      'outdoor', 'outdoorLocation', 'additionalServicesCost',
      'expenses'
    ]
    
    // Construir actualización
    const updateExpressions = ['updatedAt = :updatedAt']
    const expressionValues: Record<string, any> = {
      ':updatedAt': new Date().toISOString()
    }
    const expressionAttributeNames: Record<string, string> = {}
    
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key) && value !== undefined) {
        const attrName = ['status', 'type', 'date', 'name'].includes(key) ? `#${key}` : key
        if (['status', 'type', 'date', 'name'].includes(key)) {
          expressionAttributeNames[`#${key}`] = key
        }
        updateExpressions.push(`${attrName} = :${key}`)
        expressionValues[`:${key}`] = value
      }
    }
    
    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: 'SET ' + updateExpressions.join(', '),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionValues,
      ReturnValues: 'ALL_NEW'
    }))
    
    return NextResponse.json({ success: true, booking: result.Attributes })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Error al actualizar reserva' }, { status: 500 })
  }
}

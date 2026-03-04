import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION || 'us-east-1',
})

const docClient = DynamoDBDocumentClient.from(client)
const TABLE_NAME = 'angel-bookings'

// GET - Listar todas las reservas
export async function GET() {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      ScanFilter: {
        status: { ComparisonOperator: 'NE', AttributeValueList: ['cancelled'] }
      }
    }))
    
    return NextResponse.json(result.Items || [])
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Error al obtener reservas' }, { status: 500 })
  }
}

// POST - Crear nueva reserva
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validar campos requeridos
    const required = ['clientName', 'clientEmail', 'clientPhone', 'serviceType', 'serviceTier', 'sessionDate', 'sessionTime', 'totalAmount']
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `Falta campo requerido: ${field}` }, { status: 400 })
      }
    }
    
    // Generar ID único
    const id = 'bk_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    
    // Calcular pagos
    const totalAmount = parseFloat(body.totalAmount)
    const depositPaid = 100 // Siempre $100
    const remainingPaid = totalAmount - depositPaid
    
    const booking = {
      id,
      // Cliente
      clientName: body.clientName.trim(),
      clientEmail: body.clientEmail.trim().toLowerCase(),
      clientPhone: body.clientPhone.trim(),
      
      // Sesión
      serviceType: body.serviceType,
      serviceTier: body.serviceTier,
      sessionDate: body.sessionDate,
      sessionTime: body.sessionTime,
      
      // Pagos
      totalAmount,
      depositPaid,
      remainingPaid,
      paymentStatus: 'pending',
      
      // Estado
      status: 'pending',
      
      // Costos de sesión
      sessionCost: 0,
      
      // Metadata
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stripeSessionId: null,
      notes: ''
    }
    
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: booking
    }))
    
    return NextResponse.json({ success: true, id, booking })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Error al crear reserva' }, { status: 500 })
  }
}

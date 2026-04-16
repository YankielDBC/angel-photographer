import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { sendManualBookingEmail } from '../../utils/email'

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION || 'us-east-1',
})

const docClient = DynamoDBDocumentClient.from(client)
const TABLE_NAME = 'angel-bookings'

// POST - Crear reserva manual (sin pago)
export async function POST(request: Request) {
  console.log('POST /api/bookings/manual called');
  try {
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body));
    
    // Validar campos requeridos
    const required = ['clientName', 'clientEmail', 'clientPhone', 'serviceType', 'serviceTier', 'sessionDate', 'sessionTime', 'totalAmount']
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `Falta campo requerido: ${field}` }, { status: 400 })
      }
    }

    // Validar monto mínimo
    const totalAmount = parseFloat(body.totalAmount)
    if (isNaN(totalAmount) || totalAmount < 100) {
      return NextResponse.json({ error: 'El monto mínimo de reserva es $100' }, { status: 400 })
    }

    // Validar que la fecha no sea pasada
    const sessionDateObj = new Date(body.sessionDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (sessionDateObj < today) {
      return NextResponse.json({ error: 'No se pueden crear reservas en fechas pasadas' }, { status: 400 })
    }
    
    // Verificar si ya existe reserva para ese horario
    const existingCheck = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'sessionDate = :date AND sessionTime = :time AND #status <> :cancelled',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':date': body.sessionDate,
        ':time': body.sessionTime,
        ':cancelled': 'cancelled'
      }
    }))
    
    if (existingCheck.Items && existingCheck.Items.length > 0) {
      return NextResponse.json({ error: 'Ya existe una reserva para este horario' }, { status: 409 })
    }
    
    // Generar ID único
    const id = 'bk_manual_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    
    // Reserva manual: pending, $0 deposit, debe todo
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
      
      // Pagos - MANUAL: $0 deposit, debe todo
      totalAmount: totalAmount,
      depositPaid: 0,
      remainingPaid: totalAmount,
      paymentStatus: 'pending',
      
      // Estado - pending (pendiente de pago)
      status: 'pending',
      
      // Indicar que es reserva manual
      isManual: true,
      manualCreatedAt: new Date().toISOString(),
      
      // Costos de sesión
      sessionCost: 0,
      
      // Campos adicionales
      clientAge: body.clientAge || null,
      clientNotes: body.clientNotes || '',
      family2: body.family2 || false,
      family4: body.family4 || false,
      hairMakeup: body.hairMakeup || false,
      outdoor: body.outdoor || false,
      outdoorLocation: body.outdoorLocation || null,
      additionalServicesCost: body.additionalServicesCost || 0,
      
      // Metadata
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stripeSessionId: null,
      notes: body.notes || ''
    }
    
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: booking
    }))
    
    console.log('Booking created:', id);
    
    // Enviar email al cliente
    try {
      await sendManualBookingEmail(booking)
      console.log('Email sent to:', booking.clientEmail)
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      // No fallar la reserva si el email falla
    }
    
    return NextResponse.json({ 
      success: true, 
      booking,
      message: 'Reserva creada exitosamente. Se ha enviado un email al cliente.'
    })
    
  } catch (error) {
    console.error('Error creating manual booking:', JSON.stringify(error))
    return NextResponse.json({ error: 'Error al crear reserva', details: String(error) }, { status: 500 })
  }
}

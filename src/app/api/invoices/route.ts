import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import jsPDF from 'jspdf'

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION || 'us-east-1',
})

const docClient = DynamoDBDocumentClient.from(client)
const TABLE_NAME = 'angel-bookings'

// GET - Generar factura PDF por ID de reserva
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    
    // Obtener reserva
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id }
    }))
    
    const booking = result.Item
    
    if (!booking) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }
    
    // Generar PDF
    const doc = new jsPDF()
    
    // Encabezado
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('FACTURA', 105, 20, { align: 'center' })
    
    // Datos empresa
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Angel Photography Miami', 20, 35)
    doc.setFontSize(10)
    doc.text('Miami, Florida, USA', 20, 42)
    
    // Número de factura
    doc.setFontSize(10)
    doc.text(`Factura #: ${booking.id}`, 140, 35)
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-US')}`, 140, 42)
    
    // Estado del servicio
    const statusColors: Record<string, string> = {
      pending: 'Pendiente de Pago',
      confirmed: 'Confirmada / Pagada',
      completed: 'Completada',
      cancelled: 'Cancelada'
    }
    
    // Información del cliente
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Cliente:', 20, 55)
    doc.setFont('helvetica', 'normal')
    doc.text(booking.clientName || 'N/A', 20, 62)
    doc.text(booking.clientEmail || '', 20, 69)
    doc.text(booking.clientPhone || '', 20, 76)
    
    // Información de la sesión
    doc.setFont('helvetica', 'bold')
    doc.text('Servicio:', 110, 55)
    doc.setFont('helvetica', 'normal')
    doc.text(`${booking.serviceType} - ${booking.serviceTier}`, 110, 62)
    doc.text(`Fecha: ${booking.sessionDate} ${booking.sessionTime || ''}`, 110, 69)
    
    // Estado
    doc.setFont('helvetica', 'bold')
    doc.text('Estado:', 110, 76)
    doc.setFont('helvetica', 'normal')
    const statusLabel = statusColors[booking.status] || booking.status
    doc.text(statusLabel, 110, 83)
    
    // Línea separadora
    doc.setLineWidth(0.5)
    doc.line(20, 90, 190, 90)
    
    // Tabla de conceptos
    let yPos = 100
    
    // Encabezado tabla
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('Concepto', 20, yPos)
    doc.text('Monto', 170, yPos, { align: 'right' })
    
    yPos += 8
    
    // Filas según estado
    doc.setFont('helvetica', 'normal')
    
    // Sesión de fotos
    const servicePrices: Record<string, number> = {
      'maternity': 250,
      'newborn': 250,
      'family': 250,
      'portrait': 200,
      'children': 200,
      'pregnant gold': 350,
      'pregnant silver': 250
    }
    const servicePrice = servicePrices[booking.serviceTier?.toLowerCase()] || booking.totalAmount || 250
    
    // Si tiene sessionCost, usarlo
    const sessionPrice = booking.sessionCost || servicePrice
    
    doc.text('Sesión de Fotos', 20, yPos)
    doc.text(`$${sessionPrice.toFixed(2)}`, 170, yPos, { align: 'right' })
    yPos += 8
    
    // Servicios adicionales
    if (booking.family2 || booking.family4) {
      const familyCost = booking.family4 ? 75 : 50
      doc.text('Sesión Familiar (2/4 personas)', 20, yPos)
      doc.text(`$${familyCost.toFixed(2)}`, 170, yPos, { align: 'right' })
      yPos += 8
    }
    
    if (booking.hairMakeup) {
      doc.text('Peinado y Maquillaje', 20, yPos)
      doc.text('$75.00', 170, yPos, { align: 'right' })
      yPos += 8
    }
    
    if (booking.outdoor) {
      doc.text('Locación Exterior', 20, yPos)
      doc.text('$50.00', 170, yPos, { align: 'right' })
      yPos += 8
    }
    
    // Servicios adicionales del booking
    if (booking.additionalServicesCost > 0) {
      doc.text('Servicios Adicionales', 20, yPos)
      doc.text(`$${booking.additionalServicesCost.toFixed(2)}`, 170, yPos, { align: 'right' })
      yPos += 8
    }
    
    // Línea separadora antes de totales
    yPos += 5
    doc.line(20, yPos, 190, yPos)
    yPos += 10
    
    // Calcular según estado
    const deposit = parseFloat(booking.depositPaid) || 100
    const total = parseFloat(booking.totalAmount) || sessionPrice
    
    // Totales
    doc.setFont('helvetica', 'bold')
    doc.text('Total:', 130, yPos)
    doc.text(`$${total.toFixed(2)}`, 170, yPos, { align: 'right' })
    yPos += 8
    
    // Depósito
    doc.setFont('helvetica', 'normal')
    doc.text('Depósito Pagado:', 130, yPos)
    doc.text(`$${deposit.toFixed(2)}`, 170, yPos, { align: 'right' })
    yPos += 8
    
    // Pendiente
    const remaining = total - deposit
    if (remaining > 0) {
      doc.setTextColor(200, 100, 0)
      doc.text('Pendiente:', 130, yPos)
      doc.text(`$${remaining.toFixed(2)}`, 170, yPos, { align: 'right' })
      doc.setTextColor(0, 0, 0)
    } else if (booking.status === 'confirmed' || booking.status === 'completed') {
      doc.setTextColor(0, 128, 0)
      doc.text('PAGADO', 130, yPos)
      doc.setTextColor(0, 0, 0)
    }
    
    // Footer
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text('Gracias por confiar en Angel Photography Miami', 105, 280, { align: 'center' })
    
    // Convertir a base64
    const pdfBase64 = doc.output('datauristring')
    
    return NextResponse.json({
      success: true,
      pdf: pdfBase64,
      filename: `factura-${booking.id}.pdf`
    })
    
  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json({ error: 'Error al generar factura' }, { status: 500 })
  }
}

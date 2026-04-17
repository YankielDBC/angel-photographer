import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION || 'us-east-1',
})

const docClient = DynamoDBDocumentClient.from(client)
const TABLE_NAME = 'angel-bookings'

// GET - Generar P&L Report PDF
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // MM
    const year = searchParams.get('year')   // YYYY
    
    // Obtener todas las reservas
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME
    }))
    
    const bookings = result.Items || []
    
    // Filtrar por mes/año si se especifica
    const filteredBookings = bookings.filter((b: any) => {
      if (!b.sessionDate) return false
      //sessionDate format: YYYY-MM-DD
      const parts = b.sessionDate.split('-')
      const y = parts[0]
      const m = parseInt(parts[1], 10) // convierte a número (quita leading zeros automáticamente)
      const monthNum = month ? parseInt(month, 10) : null
      console.log('Booking:', b.sessionDate, '-> m:', m, 'month:', monthNum, 'match:', monthNum === m)
      if (monthNum && m !== monthNum) return false
      if (year && y !== String(year)) return false
      return true
    })
    console.log('Total bookings:', bookings.length, 'Filtered:', filteredBookings.length)
    
    // Calcular INGRESOS
    let totalIncome = 0
    let pendingDeposits = 0
    let confirmedTotal = 0
    let completedTotal = 0
    let cancelledDeposits = 0
    
    const incomeDetails: { status: string; client: string; date: string; amount: number }[] = []
    
    // Función para obtener ingresos extras (propinas) de una reserva
    const getExtraIncome = (booking: any) => {
      const expenses = booking.expenses || []
      return expenses.filter((e: any) => e.isIncome).reduce((s: number, e: any) => s + (parseFloat(e.amount) || 0), 0)
    }

    filteredBookings.forEach((booking: any) => {
      const total = parseFloat(booking.totalAmount) || 0
      const deposit = parseFloat(booking.depositPaid) || 100
      const status = booking.status || 'unknown'
      const extraIncome = getExtraIncome(booking)
      
      if (status === 'pending') {
        pendingDeposits += deposit
        totalIncome += deposit + extraIncome
        incomeDetails.push({
          status: 'Pendiente',
          client: booking.clientName || 'N/A',
          date: booking.sessionDate || '',
          amount: deposit + extraIncome
        })
      } else if (status === 'confirmed') {
        confirmedTotal += total
        totalIncome += total + extraIncome
        incomeDetails.push({
          status: 'Confirmado',
          client: booking.clientName || 'N/A',
          date: booking.sessionDate || '',
          amount: total + extraIncome
        })
      } else if (status === 'completed') {
        completedTotal += total
        totalIncome += total + extraIncome
        incomeDetails.push({
          status: 'Completado',
          client: booking.clientName || 'N/A',
          date: booking.sessionDate || '',
          amount: total + extraIncome
        })
      } else if (status === 'cancelled') {
        // Canceladas solo cuentan el depósito ($100), no el resto pendiente
        cancelledDeposits += deposit
        totalIncome += deposit + extraIncome
        incomeDetails.push({
          status: 'Cancelado',
          client: booking.clientName || 'N/A',
          date: booking.sessionDate || '',
          amount: deposit + extraIncome
        })
      }
    })
    
    // Calcular GASTOS (expenses de cada reserva - EXCLUIR ingresos extras)
    let totalExpenses = 0
    const expenseDetails: { category: string; description: string; amount: number }[] = []
    
    filteredBookings.forEach((booking: any) => {
      const expenses = booking.expenses || []
      // Solo sumar expenses que NO son ingresos extras (isIncome !== true)
      expenses.filter((e: any) => !e.isIncome).forEach((exp: any) => {
        const amount = parseFloat(exp.amount) || 0
        totalExpenses += amount
        expenseDetails.push({
          category: exp.category || 'Otro',
          description: exp.description || '',
          amount: amount
        })
      })
    })
    
// GASTOS FIJOS MENSUALES (solo si hay sesiones reales)
    const hasRealSessions = filteredBookings.filter((b: any) => 
      b.status === 'completed' || b.status === 'confirmed'
    ).length > 0
    
    const fixedExpenses = hasRealSessions ? [
      { category: 'Payroll', description: 'Nómina mensual', amount: 2500 },
      { category: 'Publicidad', description: 'Ads Facebook/Instagram', amount: 800 },
      { category: 'Electricidad', description: 'Servicio eléctrico', amount: 120 },
      { category: 'Internet', description: 'internet mensual', amount: 55 },
      { category: 'Suscripciones', description: 'SaaS y software', amount: 100 },
      { category: 'Lavandería', description: 'Lavado de mantas y accesorios', amount: 100 },
      { category: 'Empaques', description: 'Material de empaque', amount: 50 },
      { category: 'Permisos', description: 'Permisos y licencias', amount: 11 },
      { category: 'Transporte', description: 'Gasolina', amount: 100 }
    ] : []
    
    // Agregar gastos fijos solo si hay sesiones
    fixedExpenses.forEach(exp => {
      totalExpenses += exp.amount
      expenseDetails.push(exp)
    })
    
    // Calcular NETO
    const netIncome = totalIncome - totalExpenses
    
    // Generar PDF
    const doc = new jsPDF()
    
    // Título
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('Angel Photography Miami', 105, 20, { align: 'center' })
    
    doc.setFontSize(18)
    doc.text('Estado de Resultados (P&L)', 105, 30, { align: 'center' })
    
    // Período
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    const periodMonth = month ? monthNames[parseInt(month) - 1] : 'Todos'
    const periodYear = year || 'Todos'
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Período: ${periodMonth} ${periodYear}`, 105, 40, { align: 'center' })
    
    doc.setFontSize(10)
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-US')}`, 105, 47, { align: 'center' })
    
    // Resumen ejecutivo
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('RESUMEN EJECUTIVO', 20, 60)
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    
    let yPos = 70
    
    // Ingresos
    doc.setTextColor(0, 100, 0)
    doc.text(`Ingresos Totales: $${totalIncome.toFixed(2)}`, 25, yPos)
    yPos += 7
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(9)
    doc.text(`  - Depósitos pendientes: $${pendingDeposits.toFixed(2)}`, 25, yPos)
    yPos += 6
    doc.text(`  - Reservas confirmadas: $${confirmedTotal.toFixed(2)}`, 25, yPos)
    yPos += 6
    doc.text(`  - Sesiones completadas: $${completedTotal.toFixed(2)}`, 25, yPos)
    yPos += 6
    doc.text(`  - Depósitos cancelados: $${cancelledDeposits.toFixed(2)}`, 25, yPos)
    yPos += 12
    
    // Gastos
    doc.setTextColor(200, 0, 0)
    doc.setFontSize(11)
    doc.text(`Gastos Totales: $${totalExpenses.toFixed(2)}`, 25, yPos)
    yPos += 12
    
    // Neto
    doc.setFontSize(14)
    if (netIncome >= 0) {
      doc.setTextColor(0, 128, 0)
    } else {
      doc.setTextColor(200, 0, 0)
    }
    doc.setFont('helvetica', 'bold')
    doc.text(`GANANCIA NETA: $${netIncome.toFixed(2)}`, 25, yPos)
    doc.setTextColor(0, 0, 0)
    
    // Tabla de INGRESOS
    if (incomeDetails.length > 0) {
      doc.addPage()
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('DETALLE DE INGRESOS', 20, 20)
      
      autoTable(doc, {
        startY: 25,
        head: [['Cliente', 'Fecha', 'Estado', 'Monto']],
        body: incomeDetails.map(i => [i.client, i.date, i.status, `$${i.amount.toFixed(2)}`]),
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] }
      })
    }
    
    // Tabla de GASTOS
    doc.addPage()
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('DETALLE DE GASTOS', 20, 20)
    
    if (expenseDetails.length > 0) {
      autoTable(doc, {
        startY: 25,
        head: [['Categoría', 'Descripción', 'Monto']],
        body: expenseDetails.map(e => [e.category, e.description, `$${e.amount.toFixed(2)}`]),
        theme: 'striped',
        headStyles: { fillColor: [185, 41, 41] }
      })
    }
    
    // Footer en última página
    const pageCount = doc.getNumberOfPages()
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' })
      doc.text('Angel Photography Miami - Estado de Resultados', 105, 295, { align: 'center' })
    }
    
    // Convertir a base64
    const pdfBase64 = doc.output('datauristring')
    
    return NextResponse.json({
      success: true,
      pdf: pdfBase64,
      summary: {
        totalIncome: totalIncome.toFixed(2),
        totalExpenses: totalExpenses.toFixed(2),
        netIncome: netIncome.toFixed(2),
        pendingDeposits: pendingDeposits.toFixed(2),
        confirmedTotal: confirmedTotal.toFixed(2),
        completedTotal: completedTotal.toFixed(2),
        cancelledDeposits: cancelledDeposits.toFixed(2),
        period: `${periodMonth} ${periodYear}`,
        bookingsCount: filteredBookings.length,
        expenseCount: expenseDetails.length
      },
      filename: `PL-${periodMonth}-${periodYear}.pdf`
    })
    
  } catch (error) {
    console.error('Error generating P&L:', error)
    return NextResponse.json({ error: 'Error al generar P&L' }, { status: 500 })
  }
}

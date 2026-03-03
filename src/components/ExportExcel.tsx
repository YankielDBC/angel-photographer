'use client'

import { useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

interface Booking {
  id: string
  client: { name: string; email: string; phone: string }
  serviceType: string
  serviceTier: string
  sessionDate: string
  sessionTime: string
  totalAmount: number
  depositPaid: number
  remainingPaid: number
  sessionCost: number
  status: string
}

interface ExportExcelProps {
  bookings: Booking[]
  monthName: string
  year: number
}

export default function ExportExcel({ bookings, monthName, year }: ExportExcelProps) {
  const [exporting, setExporting] = useState(false)

  const excelData = useMemo(() => {
    return bookings.map(b => ({
      'Fecha': new Date(b.sessionDate).toLocaleDateString('es-ES'),
      'Hora': b.sessionTime,
      'Cliente': b.client.name,
      'Email': b.client.email,
      'Teléfono': b.client.phone,
      'Tipo': b.serviceType,
      'Plan': b.serviceTier,
      'Total': b.totalAmount,
      'Depósito': b.depositPaid,
      'Restante': b.remainingPaid,
      'Costo': b.sessionCost || 0,
      'Ingreso': b.status === 'completed' || b.status === 'confirmed' ? b.totalAmount : 0,
      'Beneficio': b.status === 'completed' || b.status === 'confirmed' ? (b.totalAmount - (b.sessionCost || 0)) : 0,
      'Estado': b.status
    }))
  }, [bookings])

  const handleExport = async () => {
    setExporting(true)
    
    // Create workbook
    const wb = XLSX.utils.book_new()
    
    // Main sheet
    const ws = XLSX.utils.json_to_sheet(excelData)
    
    // Auto-size columns
    const colWidths = Object.keys(excelData[0] || {}).map(key => ({
      wch: Math.max(key.length, ...excelData.map(row => String(row[key as keyof typeof row]).length))
    }))
    ws['!cols'] = colWidths
    
    XLSX.utils.book_append_sheet(wb, ws, 'Reservas')
    
    // Summary sheet
    const completed = bookings.filter(b => b.status === 'completed' || b.status === 'confirmed')
    const pending = bookings.filter(b => b.status === 'pending')
    const totalRevenue = completed.reduce((sum, b) => sum + b.totalAmount, 0)
    const totalCost = completed.reduce((sum, b) => sum + (b.sessionCost || 0), 0)
    const totalProfit = totalRevenue - totalCost
    
    const summaryData = [
      { 'Concepto': 'Ingresos (completadas)', 'Valor': totalRevenue },
      { 'Concepto': 'Costos', 'Valor': -totalCost },
      { 'Concepto': 'Beneficio Neto', 'Valor': totalProfit },
      { 'Concepto': '', 'Valor': '' },
      { 'Concepto': 'Reservas Completadas', 'Valor': completed.length },
      { 'Concepto': 'Reservas Pendientes', 'Valor': pending.length },
      { 'Concepto': 'Total Reservas', 'Valor': bookings.length }
    ]
    
    const wsSummary = XLSX.utils.json_to_sheet(summaryData)
    wsSummary['!cols'] = [{ wch: 25 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen')
    
    // Generate and download
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    const fileName = `angel-photography-${year}-${monthName.toLowerCase()}.xlsx`
    saveAs(blob, fileName)
    
    setExporting(false)
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting || bookings.length === 0}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {exporting ? 'Exportando...' : 'Exportar a Excel'}
    </button>
  )
}

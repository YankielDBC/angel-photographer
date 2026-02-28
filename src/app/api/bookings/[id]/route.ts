import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const booking = await prisma.booking.findUnique({
      where: { id }
    })
    
    if (!booking) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }
    
    return NextResponse.json(booking)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener reserva' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, paymentMethod } = body

    const validStatuses = ['pending', 'confirmed', 'completed', 'no_show', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado invalido' }, { status: 400 })
    }

    const validPaymentMethods = ['stripe', 'paypal', 'cashapp', 'zelle', 'cash']
    if (paymentMethod && !validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json({ error: 'Metodo de pago invalido' }, { status: 400 })
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (paymentMethod) updateData.paymentMethod = paymentMethod

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json({ error: 'Error al actualizar reserva' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.booking.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar reserva' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-01-28.clover'
})

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  }
})

async function sendNotificationEmail(booking: any) {
  const adminEmail = process.env.ADMIN_EMAIL
  
  if (!adminEmail || !process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
    console.log('Email not configured, skipping notification')
    return
  }

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: adminEmail,
      subject: '📸 Nueva Reserva Confirmada - Angel Photographer',
      html: `
        <h2>¡Nueva reserva confirmada!</h2>
        <p><strong>Cliente:</strong> ${booking.clientName}</p>
        <p><strong>Email:</strong> ${booking.clientEmail}</p>
        <p><strong>Teléfono:</strong> ${booking.clientPhone}</p>
        <p><strong>Fecha:</strong> ${new Date(booking.date).toLocaleDateString('es-ES', { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        })}</p>
        <p><strong>Servicio:</strong> ${booking.serviceType}</p>
        <p><strong>Monto:</strong> $${booking.amount}</p>
        ${booking.notes ? `<p><strong>Notas:</strong> ${booking.notes}</p>` : ''}
      `
    })
    console.log('Notification email sent')
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const bookingId = session.metadata?.bookingId

    if (bookingId) {
      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'paid',
          stripeSessionId: session.id
        }
      })

      // Send notification
      await sendNotificationEmail(booking)
    }
  }

  return NextResponse.json({ received: true })
}

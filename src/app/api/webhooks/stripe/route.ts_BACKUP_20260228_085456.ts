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

async function sendClientConfirmationEmail(booking: any) {
  const clientEmail = booking.clientEmail
  const clientName = booking.clientName
  
  if (!clientEmail || !process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
    console.log('Client email not configured, skipping')
    return
  }

  const formattedDate = new Date(booking.date).toLocaleDateString('es-ES', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  })

  try {
    await transporter.sendMail({
      from: `"Angel Photographer" <${process.env.GMAIL_EMAIL}>`,
      to: clientEmail,
      subject: '📸 ¡Tu sesión de fotos está confirmada! - Angel Photographer',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Reserva</title>
</head>
<body style="margin:0;padding:0;background-color:#1a1a2e;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a2e;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:20px;overflow:hidden;">
          <!-- Header with gradient -->
          <tr>
            <td style="background:linear-gradient(135deg,#e94560 0%,#ff6b6b 100%);padding:40px 40px 60px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:700;">📸</h1>
              <h2 style="margin:10px 0 0;color:#ffffff;font-size:28px;font-weight:600;">¡Reserva Confirmada!</h2>
              <p style="margin:10px 0 0;color:rgba(255,255,255,0.9);font-size:16px;">Tu sesión de fotos está programada</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 20px;color:#333333;font-size:18px;line-height:1.6;">
                Hola <strong>${clientName}</strong>, 👋
              </p>
              <p style="margin:0 0 30px;color:#666666;font-size:16px;line-height:1.6;">
                Tu pago ha sido procesado exitosamente. Tu sesión de fotos con <strong>Angel Photographer</strong> ha sido confirmada.
              </p>
              
              <!-- Booking Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:16px;margin-bottom:30px;">
                <tr>
                  <td style="padding:30px;">
                    <h3 style="margin:0 0 20px;color:#1a1a2e;font-size:18px;font-weight:600;border-bottom:2px solid #e94560;padding-bottom:10px;">
                      📅 Detalles de tu Reserva
                    </h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #eeeeee;">
                          <span style="color:#999999;font-size:14px;">📆 Fecha</span><br>
                          <span style="color:#1a1a2e;font-size:16px;font-weight:500;">${formattedDate}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #eeeeee;">
                          <span style="color:#999999;font-size:14px;">💰 Monto Pagado</span><br>
                          <span style="color:#27ae60;font-size:18px;font-weight:600;">$${booking.amount} USD</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;">
                          <span style="color:#999999;font-size:14px;">🆔 Código de Reserva</span><br>
                          <span style="color:#1a1a2e;font-size:14px;font-family:monospace;">${booking.id.slice(0,8).toUpperCase()}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- What to bring -->
              <div style="background-color:#fff5f5;border-left:4px solid #e94560;padding:20px;border-radius:0 12px 12px 0;margin-bottom:30px;">
                <h4 style="margin:0 0 10px;color:#e94560;font-size:16px;font-weight:600;">💡 Recomendaciones para tu sesión</h4>
                <ul style="margin:0;padding-left:20px;color:#666666;font-size:14px;line-height:1.8;">
                  <li>Llega 10-15 minutos antes</li>
                  <li>Trae diferentes outfits (2-3)</li>
                  <li>Evita ropa con logos grandes</li>
                  <li> hydrated y descansado/a</li>
                </ul>
              </div>
              
              <!-- Contact CTA -->
              <p style="margin:0 0 20px;color:#666666;font-size:16px;line-height:1.6;">
                ¿Tienes alguna pregunta? ¡Escríbenos!
              </p>
              <a href="https://wa.me/17863184596" style="display:inline-block;background-color:#e94560;color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:50px;font-size:16px;font-weight:600;margin-bottom:30px;">
                💬 Chatear en WhatsApp
              </a>
              
              <p style="margin:0;color:#999999;font-size:14px;text-align:center;">
                Gracias por confiar en <strong>Angel Photographer</strong> 📸
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color:#1a1a2e;padding:30px;text-align:center;">
              <p style="margin:0;color:rgba(255,255,255,0.6);font-size:12px;">
                © 2026 Angel Photographer. Todos los derechos reservados.
              </p>
              <p style="margin:10px 0 0;color:rgba(255,255,255,0.4);font-size:11px;">
                Este email fue enviado automáticamente. Por favor no responder a este mensaje.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    })
    console.log('Client confirmation email sent to:', clientEmail)
  } catch (error) {
    console.error('Failed to send client email:', error)
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

      // Send notification to admin
      await sendNotificationEmail(booking)
      
      // Send confirmation to client
      await sendClientConfirmationEmail(booking)
    }
  }

  return NextResponse.json({ received: true })
}

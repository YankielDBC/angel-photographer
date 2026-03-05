import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { DynamoDBClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { sendBookingConfirmation } from '../utils/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia'
})

const client = new DynamoDBClient({ region: 'us-east-1' })
const TABLE_NAME = 'angel-bookings'

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
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const bookingId = session.metadata?.bookingId

    if (bookingId) {
      console.log('Payment completed for booking:', bookingId)
      
      // Update booking status in DynamoDB
      await client.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: bookingId },
        UpdateExpression: 'SET #status = :status, stripeSessionId = :stripeSessionId, paymentCompletedAt = :paymentCompletedAt',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':status': 'confirmed',
          ':stripeSessionId': session.id,
          ':paymentCompletedAt': new Date().toISOString()
        }
      }))

      // Get the full booking to send confirmation email
      const { DynamoDBDocumentClient, GetCommand } = await import('@aws-sdk/lib-dynamodb')
      const docClient = DynamoDBDocumentClient.from(client)
      
      const bookingResult = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: bookingId }
      }))
      
      const booking = bookingResult.Item

      if (booking) {
        // Send confirmation email to client
        await sendBookingConfirmation(booking)
        console.log('Confirmation email sent for booking:', bookingId)
      }
    }
  }

  return NextResponse.json({ received: true })
}

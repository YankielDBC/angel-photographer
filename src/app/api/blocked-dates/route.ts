import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, PutCommand, DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' })
const docClient = DynamoDBDocumentClient.from(client)
const BLOCKED_TABLE = 'angel-blocked'

export async function GET() {
  try {
    const result = await docClient.send(new ScanCommand({ 
      TableName: BLOCKED_TABLE,
      FilterExpression: '#type = :dayType',
      ExpressionAttributeNames: { '#type': 'type' },
      ExpressionAttributeValues: { ':dayType': 'day' }
    }))
    const blockedDates = (result.Items || []).map((item: any) => ({
      id: item.id,
      date: item.date,
      reason: item.reason,
      type: item.type
    })).sort((a: any, b: any) => a.date.localeCompare(b.date))
    
    return NextResponse.json(blockedDates)
  } catch (error) {
    console.error('Error fetching blocked dates:', error)
    return NextResponse.json({ error: 'Failed to fetch blocked dates' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { date, reason } = body

    if (!date) {
      return NextResponse.json({ error: 'Date required' }, { status: 400 })
    }

    const id = `day_${date}`
    
    // Check if already blocked
    const existing = await docClient.send(new GetCommand({ 
      TableName: BLOCKED_TABLE,
      Key: { id }
    }))

    if (existing.Item) {
      return NextResponse.json({ error: 'Date already blocked' }, { status: 400 })
    }

    const blockedDate = {
      id,
      type: 'day',
      date,
      reason: reason || 'Día bloqueado',
      createdAt: new Date().toISOString()
    }

    await docClient.send(new PutCommand({
      TableName: BLOCKED_TABLE,
      Item: blockedDate
    }))

    return NextResponse.json(blockedDate, { status: 201 })
  } catch (error) {
    console.error('Block date error:', error)
    return NextResponse.json({ error: 'Failed to block date' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    if (!date) {
      return NextResponse.json({ error: 'Date required' }, { status: 400 })
    }

    const id = `day_${date}`

    await docClient.send(new DeleteCommand({
      TableName: BLOCKED_TABLE,
      Key: { id }
    }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unblock date error:', error)
    return NextResponse.json({ error: 'Failed to unblock date' }, { status: 500 })
  }
}

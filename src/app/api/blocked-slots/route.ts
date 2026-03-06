import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, PutCommand, DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' })
const docClient = DynamoDBDocumentClient.from(client)
const BLOCKED_TABLE = 'angel-blocked'

// GET: Obtener todos los slots bloqueados
export async function GET() {
  try {
    const result = await docClient.send(new ScanCommand({ 
      TableName: BLOCKED_TABLE,
      FilterExpression: '#type = :slotType',
      ExpressionAttributeNames: { '#type': 'type' },
      ExpressionAttributeValues: { ':slotType': 'slot' }
    }))
    
    const blockedSlots = (result.Items || []).map((item: any) => ({
      id: item.id,
      date: item.date,
      time: item.time,
      reason: item.reason,
      type: item.type
    })).sort((a: any, b: any) => a.date.localeCompare(b.date))
    
    return NextResponse.json(blockedSlots)
  } catch (error) {
    console.error('Error fetching blocked slots:', error)
    return NextResponse.json({ error: 'Failed to fetch blocked slots' }, { status: 500 })
  }
}

// POST: Bloquear un horario específico
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { date, time, reason } = body

    if (!date || !time) {
      return NextResponse.json({ error: 'Date and time required' }, { status: 400 })
    }

    const id = `slot_${date}_${time}`
    
    // Check if already blocked
    const existing = await docClient.send(new GetCommand({ 
      TableName: BLOCKED_TABLE,
      Key: { id }
    }))

    if (existing.Item) {
      if (existing.Item.type === 'slot') {
        return NextResponse.json({ error: 'Slot already blocked' }, { status: 400 })
      }
    }

    const blockedSlot = {
      id,
      type: 'slot',
      date,
      time,
      reason: reason || 'Bloqueado por admin',
      createdAt: new Date().toISOString()
    }

    await docClient.send(new PutCommand({
      TableName: BLOCKED_TABLE,
      Item: blockedSlot
    }))

    return NextResponse.json(blockedSlot, { status: 201 })
  } catch (error) {
    console.error('Block slot error:', error)
    return NextResponse.json({ error: 'Failed to block slot' }, { status: 500 })
  }
}

// DELETE: Desbloquear un horario
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    
    if (!date || !time) {
      return NextResponse.json({ error: 'Date and time required' }, { status: 400 })
    }

    const id = `slot_${date}_${time}`

    await docClient.send(new DeleteCommand({
      TableName: BLOCKED_TABLE,
      Key: { id }
    }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unblock slot error:', error)
    return NextResponse.json({ error: 'Failed to unblock slot' }, { status: 500 })
  }
}

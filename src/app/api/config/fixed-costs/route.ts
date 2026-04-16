import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION || 'us-east-1',
})

const docClient = DynamoDBDocumentClient.from(client)
const TABLE_NAME = 'angel-bookings'
const CONFIG_ID = 'system_config'

// GET - Obtener configuración de gastos fijos
export async function GET() {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id: CONFIG_ID }
    }))

    const defaultCosts = [
      { name: 'Renta Oficina', amount: 250 },
      { name: 'Internet', amount: 80 },
      { name: 'Teléfono', amount: 50 },
      { name: 'Software/Apps', amount: 50 },
      { name: 'Hosting/Dominio', amount: 20 },
      { name: 'Marketing', amount: 100 },
      { name: 'Seguro', amount: 50 },
      { name: 'Equipos', amount: 100 },
    ]

    const fixedCosts = result.Item?.fixedCosts || defaultCosts
    const total = fixedCosts.reduce((sum: number, c: any) => sum + (c.amount || 0), 0)

    return NextResponse.json({
      fixedCosts,
      total,
      isDefault: !result.Item?.fixedCosts
    })
  } catch (error) {
    console.error('Error fetching fixed costs:', error)
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 })
  }
}

// PUT - Actualizar gastos fijos
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { fixedCosts } = body

    if (!Array.isArray(fixedCosts)) {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
    }

    // Validar cada costo
    for (const cost of fixedCosts) {
      if (!cost.name || typeof cost.amount !== 'number') {
        return NextResponse.json({ error: 'Cada costo debe tener name y amount' }, { status: 400 })
      }
    }

    const total = fixedCosts.reduce((sum: number, c: any) => sum + c.amount, 0)

    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id: CONFIG_ID },
      UpdateExpression: 'SET fixedCosts = :fixedCosts, fixedCostsTotal = :total, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':fixedCosts': fixedCosts,
        ':total': total,
        ':updatedAt': new Date().toISOString()
      }
    }))

    return NextResponse.json({
      success: true,
      fixedCosts,
      total
    })
  } catch (error) {
    console.error('Error updating fixed costs:', error)
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Debug: return what we received
    return NextResponse.json({ 
      received: { email, password }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Auth failed'
    }, { status: 500 })
  }
}

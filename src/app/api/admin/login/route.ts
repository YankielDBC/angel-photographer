import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Force throw to see error
    throw new Error('DEBUG: email=' + email + ' password=' + password)
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Auth failed',
      received: body 
    }, { status: 500 })
  }
}

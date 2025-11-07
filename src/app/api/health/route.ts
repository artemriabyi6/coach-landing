import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'

export async function GET() {
  try {
    // Швидкий тест з'єднання
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
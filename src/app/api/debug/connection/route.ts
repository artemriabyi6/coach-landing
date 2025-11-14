import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'

export async function GET() {
  try {
    console.log('🔍 Testing database connection...')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    
    // Простий тест з'єднання
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Basic connection test passed:', result)

    return NextResponse.json({
      success: true,
      database: 'connected',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    
    return NextResponse.json({
      success: false,
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      database_url: process.env.DATABASE_URL ? 'set' : 'not_set',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
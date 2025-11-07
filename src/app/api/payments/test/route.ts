import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'

export async function GET() {
  try {
    console.log('🧪 Testing payments endpoint...')
    
    // Перевірка бази даних
    await prisma.$queryRaw`SELECT 1`
    
    // Перевірка наявності курсів
    const courses = await prisma.course.findMany({
      take: 1,
      select: { id: true, title: true, price: true }
    })
    
    return NextResponse.json({
      status: 'payments_working',
      database: 'connected',
      has_courses: courses.length > 0,
      sample_course: courses[0] || null,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Payments test failed:', error)
    
    return NextResponse.json({
      status: 'payments_error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
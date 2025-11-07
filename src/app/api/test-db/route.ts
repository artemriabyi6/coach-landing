import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'

interface TableInfo {
  table_name: string
}

interface DatabaseError {
  message: string
  code?: string
  meta?: unknown
}

export async function GET() {
  try {
    console.log('🔍 Testing database connection on Vercel...')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('NODE_ENV:', process.env.NODE_ENV)
    
    // Тест 1: Базове з'єднання
    const connectionTest = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Basic connection test passed')
    
    // Тест 2: Перевірка всіх таблиць
    const tables = await prisma.$queryRaw<TableInfo[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    console.log('📊 Available tables:', tables)
    
    // Тест 3: Перевірка кількості записів в основних таблицях
    const [coursesCount, usersCount, contactsCount, paymentsCount] = await Promise.all([
      prisma.course.count(),
      prisma.user.count(),
      prisma.contact.count(),
      prisma.payment.count()
    ])
    
    console.log('📈 Records count:', {
      courses: coursesCount,
      users: usersCount,
      contacts: contactsCount,
      payments: paymentsCount
    })
    
    // Тест 4: Отримати перші 3 курси
    const courses = await prisma.course.findMany({
      take: 3,
      select: {
        id: true,
        title: true,
        price: true
      }
    })
    console.log('🎯 Sample courses:', courses)

    return NextResponse.json({
      status: 'success',
      database: 'connected',
      environment: process.env.NODE_ENV,
      tests: {
        basic_connection: 'passed',
        tables: tables,
        records_count: {
          courses: coursesCount,
          users: usersCount,
          contacts: contactsCount,
          payments: paymentsCount
        },
        sample_courses: courses
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    const dbError = error as DatabaseError
    
    console.error('❌ Database connection failed:', {
      message: dbError.message,
      code: dbError.code,
      meta: dbError.meta
    })
    
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      environment: process.env.NODE_ENV,
      database_url: process.env.DATABASE_URL ? 'set' : 'not_set',
      error: {
        message: dbError.message,
        code: dbError.code,
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
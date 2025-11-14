import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET() {
  let client;
  try {
    console.log('🔍 Testing database connection...')
    console.log('📊 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
    
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL environment variable is not set'
      }, { status: 500 })
    }

    // Створюємо нове підключення
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { 
        rejectUnauthorized: false 
      },
      connectionTimeoutMillis: 10000, // 10 секунд
      idleTimeoutMillis: 30000,
    })

    client = await pool.connect()
    console.log('✅ Database client connected')

    // Тестуємо базовий запит
    const versionResult = await client.query('SELECT version()')
    console.log('✅ Version query successful')

    // Тестуємо запит до таблиці (якщо вона існує)
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      LIMIT 5
    `)
    console.log('✅ Tables query successful')

    // Перевіряємо таблицю Course
    let coursesResult;
    try {
      coursesResult = await client.query('SELECT id, title, price FROM "Course" LIMIT 3')
      console.log('✅ Courses query successful')
    } catch (courseError) {
      console.log('⚠️ Courses table might not exist:', courseError instanceof Error ? courseError.message : 'Unknown error')
    }

    return NextResponse.json({
      success: true,
      postgresVersion: versionResult.rows[0]?.version,
      tables: tablesResult.rows,
      courses: coursesResult?.rows || [],
      connection: 'Database connection successful',
      environment: process.env.NODE_ENV
    })

  } catch (error) {
    console.error('❌ Database connection error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error instanceof Error ? error.stack : undefined
      } : undefined,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      environment: process.env.NODE_ENV
    }, { status: 500 })
  } finally {
    // Завжди звільняємо клієнт
    if (client) {
      client.release()
      console.log('🔒 Database client released')
    }
  }
}
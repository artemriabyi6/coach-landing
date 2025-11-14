// Додайте цей endpoint для перевірки конкретного курсу
// app/api/check-specific-course/route.ts
import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function POST(request: Request) {
  let client;
  try {
    const { courseId } = await request.json()
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })

    client = await pool.connect()
    
    const result = await client.query(
      'SELECT * FROM courses WHERE id = $1',
      [courseId]
    )

    return NextResponse.json({
      exists: result.rows.length > 0,
      course: result.rows[0] || null
    })

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    if (client) client.release()
  }
}
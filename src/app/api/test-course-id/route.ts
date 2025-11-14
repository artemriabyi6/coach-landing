// app/api/test-course-id/route.ts
import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function POST(request: Request) {
  let client;
  try {
    const { courseId } = await request.json()
    
    // Тестуємо різні варіанти ID
    const testIds = [
      courseId, // оригінальний
      courseId.replace(/'/g, ''), // без лапок
      courseId.trim(), // без пробілів
      courseId.replace(/'/g, '').trim() // очищений
    ]
    
    console.log('Testing IDs:', testIds)

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })

    client = await pool.connect()

    const results = []
    for (const testId of testIds) {
      const result = await client.query(
        'SELECT id, title FROM courses WHERE id = $1',
        [testId]
      )
      results.push({
        testedId: testId,
        found: result.rows.length > 0,
        course: result.rows[0] || null
      })
    }

    const allCourses = await client.query('SELECT id, title FROM courses')
    
    return NextResponse.json({
      testResults: results,
      allCourses: allCourses.rows
    })

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    if (client) client.release()
  }
}
// app/api/list-courses/route.ts
import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET() {
  let client;
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })

    client = await pool.connect()

    const courses = await client.query(`
      SELECT id, title, price, description 
      FROM courses 
      ORDER BY "createdAt" DESC
    `)

    return NextResponse.json({
      success: true,
      courses: courses.rows,
      total: courses.rows.length
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    if (client) client.release()
  }
}
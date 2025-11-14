// app/api/test-db/route.ts
import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET() {
  let client
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })

    client = await pool.connect()
    const result = await client.query('SELECT version(), NOW() as time')
    
    return NextResponse.json({
      success: true,
      postgresVersion: result.rows[0].version,
      currentTime: result.rows[0].time
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      databaseUrl: process.env.DATABASE_URL ? 'set' : 'not set'
    }, { status: 500 })
  } finally {
    if (client) client.release()
  }
}
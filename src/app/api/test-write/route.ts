import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET() {
  let client
  try {
    console.log('🔍 Testing database write operation...')
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })

    client = await pool.connect()

    // Створюємо тестовий запис
    const testResult = await client.query(`
      INSERT INTO "Payment" (
        amount, "customerEmail", "customerName", "courseId", 
        status, "stripeId", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, "customerEmail", amount, status
    `, [
      100,
      'test@example.com',
      'Test User',
      'test-course',
      'pending',
      `test_${Date.now()}`
    ])

    console.log('✅ Write test successful')

    return NextResponse.json({
      success: true,
      operation: 'write',
      createdRecord: testResult.rows[0],
      message: 'Database write test successful'
    })

  } catch (error) {
    console.error('❌ Write test error:', error)
    
    return NextResponse.json({
      success: false,
      operation: 'write',
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Check if Payment table exists and has correct structure'
    }, { status: 500 })
  } finally {
    if (client) client.release()
  }
}
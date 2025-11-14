// app/api/payments/simple-checkout/route.ts
import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function POST(request: Request) {
  let client;
  try {
    console.log('=== SIMPLE CHECKOUT START ===')
    const body = await request.json()
    console.log('Body:', body)

    // Проста валідація
    if (!body.courseId || !body.customerEmail || !body.customerName) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Підключення до бази
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })

    client = await pool.connect()
    console.log('✅ DB connected')

    // Пошук курсу
    const courseResult = await client.query(
      'SELECT * FROM courses WHERE id = $1',
      [body.courseId]
    )

    if (courseResult.rows.length === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const course = courseResult.rows[0]
    console.log('✅ Course found')

    // Створення платежу
    const paymentResult = await client.query(
      `INSERT INTO payments 
       (amount, currency, status, "courseId", "customerEmail", "customerName", "stripeId", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
       RETURNING id`,
      [
        course.price,
        'UAH',
        'pending',
        body.courseId,
        body.customerEmail,
        body.customerName,
        `test_${Date.now()}`
      ]
    )

    console.log('✅ Payment created:', paymentResult.rows[0].id)

    // Проста відповідь без LiqPay
    return NextResponse.json({
      success: true,
      paymentId: paymentResult.rows[0].id,
      course: {
        title: course.title,
        price: course.price
      },
      message: 'Тест успішний - платіж створено в базі'
    })

  } catch (error) {
    console.error('❌ ERROR:', error)
    return NextResponse.json(
      { 
        error: 'Помилка',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    if (client) client.release()
  }
}
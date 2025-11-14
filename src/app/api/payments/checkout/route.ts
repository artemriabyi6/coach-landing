// Оновіть ваш checkout API - додайте більше логування
// app/api/payments/checkout/route.ts
import { NextResponse } from 'next/server'
import { Pool } from 'pg'
import CryptoJS from 'crypto-js'

export async function POST(request: Request) {
  let client;
  try {
    console.log('=== CHECKOUT START ===')
    const body = await request.json()
    console.log('Raw request body:', body)
    console.log('CourseId from request:', body.courseId)
    console.log('CourseId type:', typeof body.courseId)

    // Спроба очистити ID від можливих зайвих символів
    const cleanCourseId = body.courseId.replace(/'/g, '').trim()
    console.log('Cleaned courseId:', cleanCourseId)

    if (!cleanCourseId || !body.customerEmail || !body.customerName) {
      return NextResponse.json(
        { error: 'Відсутні обов\'язкові поля' },
        { status: 400 }
      )
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })

    client = await pool.connect()

    // Додамо декілька варіантів пошуку курсу
    console.log('Searching for course with ID:', cleanCourseId)
    
    let courseResult;
    try {
      // Спроба 1: точний пошук
      courseResult = await client.query(
        'SELECT * FROM courses WHERE id = $1',
        [cleanCourseId]
      )
      console.log('Exact match result:', courseResult.rows)
      
      // Спроба 2: пошук по частині ID
      if (courseResult.rows.length === 0) {
        console.log('Trying partial match...')
        courseResult = await client.query(
          'SELECT * FROM courses WHERE id LIKE $1',
          [`%${cleanCourseId}%`]
        )
        console.log('Partial match result:', courseResult.rows)
      }
      
      // Спроба 3: отримати всі курси для дебагу
      if (courseResult.rows.length === 0) {
        console.log('Getting all courses for debug...')
        const allCourses = await client.query('SELECT id, title FROM courses LIMIT 10')
        console.log('All available courses:', allCourses.rows)
      }
      
    } catch (dbError) {
      console.error('Database query error:', dbError)
      throw dbError
    }

    if (courseResult.rows.length === 0) {
      console.error('❌ No course found with any method')
      return NextResponse.json(
        { error: 'Курс не знайдено' },
        { status: 404 }
      )
    }

    const course = courseResult.rows[0]
    console.log('✅ Course found:', course)

    // Решта коду без змін...
    const paymentResult = await client.query(
      `INSERT INTO payments 
       (amount, currency, status, "courseId", "customerEmail", "customerName", "stripeId", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
       RETURNING *`,
      [
        course.price,
        'UAH',
        'pending',
        cleanCourseId,
        body.customerEmail,
        body.customerName,
        `liqpay_${Date.now()}`
      ]
    )

    console.log('✅ Payment created')

    // LiqPay логіка...
    const LIQPAY_PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY
    const LIQPAY_PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY

    if (!LIQPAY_PUBLIC_KEY || !LIQPAY_PRIVATE_KEY) {
      throw new Error('LiqPay keys missing')
    }

    const liqpayData = {
      public_key: LIQPAY_PUBLIC_KEY,
      version: '3',
      action: 'pay',
      amount: course.price,
      currency: 'UAH',
      description: `Оплата курсу: ${course.title}`,
      order_id: paymentResult.rows[0].id,
      result_url: `${process.env.NEXTAUTH_URL}/payment/success?payment_id=${paymentResult.rows[0].id}`,
      server_url: `${process.env.NEXTAUTH_URL}/api/payments/webhook`,
      language: 'uk',
      customer: body.customerEmail,
      product_category: 'education',
      product_description: course.description || '',
      product_name: course.title
    }

    const dataString = Buffer.from(JSON.stringify(liqpayData)).toString('base64')
    const signatureString = LIQPAY_PRIVATE_KEY + dataString + LIQPAY_PRIVATE_KEY
    const signature = CryptoJS.SHA1(signatureString).toString(CryptoJS.enc.Base64)

    console.log('=== CHECKOUT SUCCESS ===')
    
    return NextResponse.json({
      success: true,
      paymentId: paymentResult.rows[0].id,
      paymentUrl: 'https://www.liqpay.ua/api/3/checkout',
      formData: dataString,
      signature: signature,
      course: {
        id: course.id,
        title: course.title,
        price: course.price
      }
    })

  } catch (error) {
    console.error('=== CHECKOUT ERROR ===', error)
    return NextResponse.json(
      { 
        error: 'Помилка сервера',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
      },
      { status: 500 }
    )
  } finally {
    if (client) {
      client.release()
      console.log('Database client released')
    }
  }
}
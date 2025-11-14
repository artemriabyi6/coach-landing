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

    // ФІКС: Видаляємо лапки з courseId
    const rawCourseId = body.courseId
    const cleanCourseId = typeof rawCourseId === 'string' 
      ? rawCourseId.replace(/'/g, '').trim()
      : String(rawCourseId).replace(/'/g, '').trim()
    
    console.log('Original courseId:', rawCourseId)
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

    // Пошук курсу по очищеному ID
    console.log('Searching for course with cleaned ID:', cleanCourseId)
    
    const courseResult = await client.query(
      'SELECT * FROM courses WHERE id = $1',
      [cleanCourseId]
    )

    console.log('Courses found:', courseResult.rows.length)
    
    if (courseResult.rows.length === 0) {
      // Додаткова інформація для дебагу
      const allCourses = await client.query('SELECT id, title FROM courses LIMIT 10')
      console.log('All available courses:', allCourses.rows)
      
      return NextResponse.json(
        { 
          error: 'Курс не знайдено',
          debug: {
            requestedId: cleanCourseId,
            availableCourses: allCourses.rows
          }
        },
        { status: 404 }
      )
    }

    const course = courseResult.rows[0]
    console.log('✅ Course found:', course.id, course.title, course.price)

    // Створення платежу
    const paymentResult = await client.query(
      `INSERT INTO payments 
       (amount, currency, status, "courseId", "customerEmail", "customerName", "stripeId", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
       RETURNING *`,
      [
        course.price,
        'UAH',
        'pending',
        cleanCourseId, // Використовуємо очищений ID
        body.customerEmail,
        body.customerName,
        `liqpay_${Date.now()}`
      ]
    )

    const payment = paymentResult.rows[0]
    console.log('✅ Payment created:', payment.id)

    // LiqPay
    const LIQPAY_PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY
    const LIQPAY_PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY
    const NEXTAUTH_URL = process.env.NEXTAUTH_URL

    if (!LIQPAY_PUBLIC_KEY || !LIQPAY_PRIVATE_KEY) {
      throw new Error('LiqPay keys not configured')
    }

    if (!NEXTAUTH_URL) {
      throw new Error('NEXTAUTH_URL not configured')
    }

    const liqpayData = {
      public_key: LIQPAY_PUBLIC_KEY,
      version: '3',
      action: 'pay',
      amount: course.price,
      currency: 'UAH',
      description: `Оплата курсу: ${course.title}`,
      order_id: payment.id,
      result_url: `${NEXTAUTH_URL}/payment/success?payment_id=${payment.id}`,
      server_url: `${NEXTAUTH_URL}/api/payments/webhook`,
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
      paymentId: payment.id,
      paymentUrl: 'https://www.liqpay.ua/api/3/checkout',
      formData: dataString,
      signature: signature,
      course: {
        id: course.id,
        title: course.title,
        price: course.price
      },
      message: 'Платіж успішно ініціалізовано'
    })

  } catch (error) {
    console.error('=== CHECKOUT ERROR ===', error)
    
    return NextResponse.json(
      { 
        error: 'Помилка сервера',
        details: process.env.NODE_ENV === 'development' ? {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        } : undefined
      },
      { status: 500 }
    )
  } finally {
    if (client) {
      client.release()
    }
  }
}
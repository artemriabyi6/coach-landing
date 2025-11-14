// app/api/payments/checkout/route.ts
import { NextResponse } from 'next/server'
import { Pool } from 'pg'
import CryptoJS from 'crypto-js'

interface CheckoutRequest {
  courseId: string
  customerEmail: string
  customerName: string
}

export async function POST(request: Request) {
  let client;
  try {
    console.log('🔄 Processing checkout request...')
    
    const body: CheckoutRequest = await request.json()
    console.log('📦 Checkout data:', body)

    // Перевірка обов'язкових полів
    if (!body.courseId || !body.customerEmail || !body.customerName) {
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

    // Пошук курсу в таблиці courses (нижній регістр)
    console.log('🔍 Searching for course:', body.courseId)
    
    const courseResult = await client.query(
      'SELECT * FROM courses WHERE id = $1',
      [body.courseId]
    )

    if (courseResult.rows.length === 0) {
      console.error('❌ Course not found:', body.courseId)
      return NextResponse.json(
        { error: 'Курс не знайдено' },
        { status: 404 }
      )
    }

    const course = courseResult.rows[0]
    console.log('✅ Course found:', course.title)

    // Створення запису про платіж в таблиці payments (нижній регістр)
    console.log('💾 Creating payment record...')
    
    const paymentResult = await client.query(
      `INSERT INTO payments 
       (amount, currency, status, "courseId", "customerEmail", "customerName", "stripeId", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
       RETURNING *`,
      [
        course.price,
        'UAH', // Додаємо валюту
        'pending',
        body.courseId,
        body.customerEmail,
        body.customerName,
        `liqpay_${Date.now()}`
      ]
    )

    const payment = paymentResult.rows[0]
    console.log('✅ Payment record created:', payment.id)

    // Налаштування LiqPay
    const LIQPAY_PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY
    const LIQPAY_PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY

    if (!LIQPAY_PUBLIC_KEY || !LIQPAY_PRIVATE_KEY) {
      console.error('❌ LiqPay keys not configured')
      return NextResponse.json(
        { error: 'Платіжна система не налаштована' },
        { status: 500 }
      )
    }

    const liqpayData = {
      public_key: LIQPAY_PUBLIC_KEY,
      version: '3',
      action: 'pay',
      amount: course.price,
      currency: 'UAH',
      description: `Оплата курсу: ${course.title}`,
      order_id: payment.id,
      result_url: `${process.env.NEXTAUTH_URL}/payment/success?payment_id=${payment.id}`,
      server_url: `${process.env.NEXTAUTH_URL}/api/payments/webhook`,
      language: 'uk',
      customer: body.customerEmail,
      product_category: 'education',
      product_description: course.description || '',
      product_name: course.title
    }

    console.log('📦 LiqPay data prepared:', liqpayData)

    const dataString = Buffer.from(JSON.stringify(liqpayData)).toString('base64')
    const signatureString = LIQPAY_PRIVATE_KEY + dataString + LIQPAY_PRIVATE_KEY
    const signature = CryptoJS.SHA1(signatureString).toString(CryptoJS.enc.Base64)

    console.log('✅ LiqPay data and signature created')

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
    console.error('❌ Checkout error:', error)
    
    return NextResponse.json(
      { 
        error: 'Помилка підключення до бази даних',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    )
  } finally {
    if (client) client.release()
  }
}
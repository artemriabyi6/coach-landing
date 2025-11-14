// app/api/payments/checkout/route.ts
import { NextResponse } from 'next/server'
import { Pool } from 'pg'
import CryptoJS from 'crypto-js'

export async function POST(request: Request) {
  let client;
  try {
    console.log('🔄 === CHECKOUT START ===')
    const body = await request.json()
    console.log('📦 Request body:', JSON.stringify(body, null, 2))

    const courseId = body.courseId
    console.log('🎯 Course ID:', courseId)

    if (!courseId || !body.customerEmail || !body.customerName) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { error: 'Відсутні обов\'язкові поля' },
        { status: 400 }
      )
    }

    // Отримуємо базовий URL (fallback якщо NEXTAUTH_URL не встановлено)
    const getBaseUrl = () => {
      if (process.env.NEXTAUTH_URL) {
        return process.env.NEXTAUTH_URL
      }
      // Fallback для Vercel
      if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`
      }
      // Fallback для продакшену
      return 'https://coach-landing-git-old-version-artems-projects-a8384fd0.vercel.app'
    }

    const baseUrl = getBaseUrl()
    console.log('🌐 Base URL:', baseUrl)

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    })

    console.log('🔌 Connecting to database...')
    client = await pool.connect()
    console.log('✅ Database connected')

    // Пошук курсу
    console.log('🔍 Searching for course:', courseId)
    const courseResult = await client.query(
      'SELECT * FROM courses WHERE id = $1',
      [courseId]
    )

    console.log(`📊 Found ${courseResult.rows.length} courses`)
    
    if (courseResult.rows.length === 0) {
      console.log('❌ Course not found')
      return NextResponse.json(
        { error: 'Курс не знайдено' },
        { status: 404 }
      )
    }

    const course = courseResult.rows[0]
    console.log('✅ Course found:', {
      id: course.id,
      title: course.title,
      price: course.price
    })

    // Створення платежу
    console.log('💳 Creating payment record...')
    const stripeId = `liqpay_${Date.now()}`
    
    const paymentResult = await client.query(
      `INSERT INTO payments 
       (amount, currency, status, "courseId", "customerEmail", "customerName", "stripeId", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
       RETURNING *`,
      [
        course.price,
        'UAH',
        'pending',
        courseId,
        body.customerEmail,
        body.customerName,
        stripeId
      ]
    )

    const payment = paymentResult.rows[0]
    console.log('✅ Payment created:', payment.id)

    // Перевірка LiqPay ключів
    const LIQPAY_PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY
    const LIQPAY_PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY

    console.log('🔐 Checking LiqPay keys...')
    if (!LIQPAY_PUBLIC_KEY) {
      throw new Error('LIQPAY_PUBLIC_KEY is missing')
    }
    if (!LIQPAY_PRIVATE_KEY) {
      throw new Error('LIQPAY_PRIVATE_KEY is missing')
    }

    console.log('✅ All required environment variables are set')

    // Підготовка LiqPay даних
    console.log('📦 Preparing LiqPay data...')
    const liqpayData = {
      public_key: LIQPAY_PUBLIC_KEY,
      version: '3',
      action: 'pay',
      amount: course.price,
      currency: 'UAH',
      description: `Оплата курсу: ${course.title}`,
      order_id: payment.id,
      result_url: `${baseUrl}/payment/success?payment_id=${payment.id}`,
      server_url: `${baseUrl}/api/payments/webhook`,
      language: 'uk',
      customer: body.customerEmail,
      product_category: 'education',
      product_description: course.description || '',
      product_name: course.title
    }

    console.log('📄 LiqPay data prepared')

    // Генерація підпису
    console.log('🔐 Generating signature...')
    const dataString = Buffer.from(JSON.stringify(liqpayData)).toString('base64')
    const signatureString = LIQPAY_PRIVATE_KEY + dataString + LIQPAY_PRIVATE_KEY
    const signature = CryptoJS.SHA1(signatureString).toString(CryptoJS.enc.Base64)
    console.log('✅ Signature generated')

    console.log('🎉 === CHECKOUT SUCCESS ===')
    
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
    console.error('💥 === CHECKOUT ERROR ===')
    console.error('Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Помилка сервера',
        details: process.env.NODE_ENV === 'development' ? {
          message: error instanceof Error ? error.message : 'Unknown error'
        } : undefined
      },
      { status: 500 }
    )
  } finally {
    if (client) {
      console.log('🔒 Releasing database client')
      client.release()
    }
  }
}
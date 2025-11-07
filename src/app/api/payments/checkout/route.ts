import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import CryptoJS from 'crypto-js'

interface CheckoutRequest {
  courseId: string
  customerEmail: string
  customerName: string
}

export async function POST(request: Request) {
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

    // Перевірка з'єднання з базою даних
    console.log('🔍 Testing database connection...')
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')

    // Пошук курсу в базі даних
    console.log('🔍 Searching for course:', body.courseId)
    const course = await prisma.course.findUnique({
      where: { id: body.courseId }
    })

    if (!course) {
      console.error('❌ Course not found:', body.courseId)
      return NextResponse.json(
        { error: 'Курс не знайдено' },
        { status: 404 }
      )
    }

    console.log('✅ Course found:', course.title)

    // Створення запису про платіж в базі даних
    console.log('💾 Creating payment record...')
    const payment = await prisma.payment.create({
      data: {
        amount: course.price,
        customerEmail: body.customerEmail,
        customerName: body.customerName,
        courseId: body.courseId,
        status: 'pending',
        stripeId: `liqpay_${Date.now()}`
      }
    })

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

    // Параметри для LiqPay
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
      product_description: course.description,
      product_name: course.title
    }

    console.log('📦 LiqPay data prepared:', liqpayData)

    // Кодування даних для LiqPay
    const dataString = Buffer.from(JSON.stringify(liqpayData)).toString('base64')
    
    // Створення підпису
    const signatureString = LIQPAY_PRIVATE_KEY + dataString + LIQPAY_PRIVATE_KEY
    const signature = CryptoJS.SHA1(signatureString).toString(CryptoJS.enc.Base64)

    console.log('✅ LiqPay data and signature created')

    // Повертаємо дані для клієнта
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
    
    const errorMessage = error instanceof Error ? error.message : 'Невідома помилка'
    
    return NextResponse.json(
      { 
        error: 'Помилка підключення до бази даних',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma, testConnection } from '../../../../lib/db'
import { liqpayService } from '../../../../lib/liqpay'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Starting LiqPay checkout process ===')
    
    const dbConnected = await testConnection()
    if (!dbConnected) {
      return NextResponse.json(
        { error: 'Помилка підключення до бази даних' },
        { status: 500 }
      )
    }

    const body = await request.json()
    console.log('Request body:', body)
    
    const { courseId, customerEmail, customerName } = body

    if (!courseId || !customerEmail || !customerName) {
      return NextResponse.json(
        { 
          error: 'Відсутні обов\'язкові поля',
          required: ['courseId', 'customerEmail', 'customerName'],
          received: { courseId, customerEmail, customerName }
        },
        { status: 400 }
      )
    }

    // Додамо debug інформацію про всі курси
    const allCourses = await prisma.course.findMany({
      select: { id: true, title: true }
    })
    console.log('📊 All available courses:', allCourses)

    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      console.error('❌ Course not found:', courseId)
      return NextResponse.json(
        { 
          error: 'Курс не знайдено',
          requestedId: courseId,
          availableCourses: allCourses.map(c => ({ id: c.id, title: c.title }))
        },
        { status: 404 }
      )
    }

    console.log('✅ Course found:', { id: course.id, title: course.title, price: course.price })

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const paymentResult = await liqpayService.createPayment({
      amount: course.price,
      currency: 'UAH',
      orderId: orderId,
      description: `Оплата курсу: ${course.title}`,
      productName: course.title,
      customerEmail: customerEmail,
      customerName: customerName
    })

    console.log('✅ LiqPay payment created:', paymentResult)

    try {
      const payment = await prisma.payment.create({
        data: {
          stripeId: orderId,
          amount: course.price,
          currency: 'UAH',
          status: 'pending',
          courseId: course.id,
          customerEmail,
          customerName,
          userId: null,
          metadata: {
            liqpayOrderId: orderId,
            paymentData: paymentResult.data,
            paymentSignature: paymentResult.signature
          }
        }
      })
      console.log('✅ Payment record created:', payment.id)
    } catch (dbError) {
      console.error('❌ Error creating payment record:', dbError)
    }

    console.log('=== LiqPay checkout process completed successfully ===')

    return NextResponse.json({ 
      success: true,
      orderId: orderId,
      paymentUrl: paymentResult.payment_url,
      formData: paymentResult.data,
      signature: paymentResult.signature
    })

  } catch (error) {
    console.error('❌ Error creating LiqPay payment:', error)
    
    let errorMessage = 'Невідома помилка'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Помилка при створенні платежу',
        message: errorMessage
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Payments checkout endpoint is working',
    timestamp: new Date().toISOString()
  })
}
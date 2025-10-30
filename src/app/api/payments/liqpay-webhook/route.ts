import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import { liqpayService } from '../../../../lib/liqpay'

// Типи для даних LiqPay
interface LiqPayWebhookData {
  order_id: string
  status: string
  amount: number
  currency: string
  transaction_id?: string
  liqpay_order_id?: string
  [key: string]: unknown // Для інших полів, які можуть бути в майбутньому
}

// Тип для метаданих, сумісний з Prisma Json
type PaymentMetadata = {
  liqpayTransactionId?: string
  liqpayOrderId?: string
  webhookReceivedAt: string
  [key: string]: unknown
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 LiqPay webhook called')
    
    // LiqPay надсилає дані як form-data
    const formData = await request.formData()
    const data = formData.get('data') as string
    const signature = formData.get('signature') as string

    console.log('📦 Raw webhook data:', { 
      data: data ? 'present' : 'missing', 
      signature: signature ? 'present' : 'missing' 
    })

    if (!data || !signature) {
      console.error('❌ Missing data or signature in LiqPay webhook')
      return NextResponse.json({ error: 'Missing data or signature' }, { status: 400 })
    }

    // Перевіряємо підпис
    const isValidSignature = liqpayService.verifySignature(data, signature)
    if (!isValidSignature) {
      console.error('❌ Invalid LiqPay signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Декодуємо дані
    const paymentData: LiqPayWebhookData = liqpayService.decodeParams(data)
    console.log('📦 Decoded LiqPay webhook data:', paymentData)

    const { order_id, status, transaction_id, liqpay_order_id } = paymentData

    if (!order_id) {
      console.error('❌ Missing order_id in webhook data')
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
    }

    // Оновлюємо статус платежу в базі
    let paymentStatus = 'pending'
    
    switch (status) {
      case 'success':
      case 'sandbox': // Тестовий режим
        paymentStatus = 'succeeded'
        break
      case 'failure':
      case 'error':
        paymentStatus = 'failed'
        break
      case 'wait_accept':
        paymentStatus = 'processing'
        break
      case 'wait_secure':
        paymentStatus = 'waiting_3ds'
        break
      case 'wait_lc':
        paymentStatus = 'waiting_funds'
        break
      case 'reversed':
        paymentStatus = 'refunded'
        break
      default:
        paymentStatus = status
    }

    console.log(`🔄 Updating payment ${order_id} to status: ${paymentStatus}`)

    // Створюємо metadata об'єкт
    const metadata: PaymentMetadata = {
      ...paymentData,
      liqpayTransactionId: transaction_id,
      liqpayOrderId: liqpay_order_id,
      webhookReceivedAt: new Date().toISOString()
    }

    // Оновлюємо платіж в базі
    const updatedPayment = await prisma.payment.update({
      where: { stripeId: order_id },
      data: { 
        status: paymentStatus,
        updatedAt: new Date(),
        metadata: metadata as any // Prisma потребує any для Json полів
      },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    console.log(`✅ Payment ${order_id} updated to status: ${paymentStatus}`)

    // Додаткова логіка для успішних платежів
    if (paymentStatus === 'succeeded') {
      await handleSuccessfulPayment(updatedPayment, paymentData)
    }

    return NextResponse.json({ 
      received: true, 
      status: 'processed',
      paymentId: order_id,
      paymentStatus: paymentStatus
    })

  } catch (error) {
    console.error('❌ LiqPay webhook processing error:', error)
    
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function handleSuccessfulPayment(
  payment: any, // Використовуємо any для Prisma результату
  paymentData: LiqPayWebhookData
): Promise<void> {
  try {
    console.log(`🎉 Handling successful payment for order: ${payment.stripeId}`)

    // Перевіряємо, чи доступ до курсу вже надано
    const existingAccess = await prisma.courseAccess.findFirst({
      where: {
        paymentId: payment.id
      }
    })

    if (existingAccess) {
      console.log(`ℹ️ Course access already exists for payment: ${payment.id}`)
      return
    }

    // Створюємо запис про доступ до курсу
    const courseAccess = await prisma.courseAccess.create({
      data: {
        userId: payment.userId,
        courseId: payment.courseId,
        customerEmail: payment.customerEmail,
        customerName: payment.customerName,
        paymentId: payment.id,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 рік
        metadata: {
          activatedAt: new Date().toISOString(),
          liqpayTransactionId: paymentData.transaction_id
        } as any // Prisma потребує any для Json полів
      }
    })

    console.log(`✅ Course access created: ${courseAccess.id} for ${payment.customerEmail}`)

    // Тут можна додати додаткову логіку:
    // - Надіслати email підтвердження
    // - Додати користувача до Telegram групи
    // - Створити запис в CRM
    // - Надіслати сповіщення адміністратору

    // Приклад логування для майбутньої інтеграції
    console.log(`📧 Would send confirmation email to: ${payment.customerEmail}`)
    console.log(`💻 Would activate course: ${payment.course?.title || 'Unknown'}`)

  } catch (error) {
    console.error('❌ Error handling successful payment:', error)
    // Не кидаємо помилку далі, щоб не впливати на вебхук
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'LiqPay webhook endpoint is working',
    timestamp: new Date().toISOString(),
    instructions: 'This endpoint should receive POST requests from LiqPay with form-data'
  })
}
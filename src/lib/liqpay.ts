import crypto from 'crypto'

export interface LiqPayConfig {
  publicKey: string
  privateKey: string
}

export interface CreatePaymentParams {
  amount: number
  currency: string
  orderId: string
  description: string
  productName: string
  customerEmail: string
  customerName: string
}

export interface LiqPayResponse {
  data: string
  signature: string
  payment_url: string
}

class LiqPayService {
  private publicKey: string
  private privateKey: string
  private baseUrl = 'https://www.liqpay.ua/api/3/checkout'

  constructor(config: LiqPayConfig) {
    this.publicKey = config.publicKey
    this.privateKey = config.privateKey
  }

  private generateSignature(data: string): string {
    return crypto
      .createHash('sha1')
      .update(this.privateKey + data + this.privateKey)
      .digest('base64')
  }

  private encodeParams(params: object): string {
    const jsonString = JSON.stringify(params)
    return Buffer.from(jsonString).toString('base64')
  }

  decodeParams(data: string): any {
    try {
      const jsonString = Buffer.from(data, 'base64').toString('utf-8')
      return JSON.parse(jsonString)
    } catch (error) {
      throw new Error('Invalid LiqPay data format')
    }
  }

  async createPayment(params: CreatePaymentParams): Promise<LiqPayResponse> {
    const { amount, currency, orderId, description, productName, customerEmail, customerName } = params

    const paymentParams = {
      public_key: this.publicKey,
      version: '3',
      action: 'pay',
      amount: amount,
      currency: currency.toUpperCase(),
      description: description,
      order_id: orderId,
      result_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      server_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/liqpay-webhook`,
      customer: customerEmail,
      customer_name: customerName,
      product_name: productName,
      language: 'uk',
      sandbox: process.env.NODE_ENV === 'development' ? 1 : 0
    }

    const data = this.encodeParams(paymentParams)
    const signature = this.generateSignature(data)

    return {
      data,
      signature,
      payment_url: this.baseUrl
    }
  }

  verifySignature(data: string, signature: string): boolean {
    const expectedSignature = this.generateSignature(data)
    return expectedSignature === signature
  }

  generateForm(params: CreatePaymentParams): string {
    const { data, signature } = this.createPaymentSync(params)

    return `
      <form method="POST" action="${this.baseUrl}" accept-charset="utf-8" id="liqpay-form">
        <input type="hidden" name="data" value="${data}" />
        <input type="hidden" name="signature" value="${signature}" />
        <button type="submit" style="background: #00A650; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
          💳 Сплатити через LiqPay
        </button>
      </form>
    `
  }

  private createPaymentSync(params: CreatePaymentParams): { data: string; signature: string } {
    const { amount, currency, orderId, description, productName, customerEmail, customerName } = params

    const paymentParams = {
      public_key: this.publicKey,
      version: '3',
      action: 'pay',
      amount: amount,
      currency: currency.toUpperCase(),
      description: description,
      order_id: orderId,
      result_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      server_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/liqpay-webhook`,
      customer: customerEmail,
      customer_name: customerName,
      product_name: productName,
      language: 'uk',
      sandbox: process.env.NODE_ENV === 'development' ? 1 : 0
    }

    const data = this.encodeParams(paymentParams)
    const signature = this.generateSignature(data)

    return { data, signature }
  }
}

if (!process.env.LIQPAY_PUBLIC_KEY || !process.env.LIQPAY_PRIVATE_KEY) {
  throw new Error('LiqPay keys are not configured in environment variables')
}

export const liqpayService = new LiqPayService({
  publicKey: process.env.LIQPAY_PUBLIC_KEY,
  privateKey: process.env.LIQPAY_PRIVATE_KEY
})

export { LiqPayService }
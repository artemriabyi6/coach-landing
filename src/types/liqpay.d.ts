declare module 'liqpay' {
  interface LiqPayParams {
    [key: string]: any
  }

  interface LiqPayCallback {
    (json: any, error: any): void
  }

  class LiqPay {
    constructor(publicKey: string, privateKey: string)
    
    api(method: string, params: LiqPayParams, callback?: LiqPayCallback): void
    cnb_form(params: LiqPayParams): string
    cnb_formdata(params: LiqPayParams): { data: string; signature: string }
    cnb_signature(params: LiqPayParams): string
    str_to_sign(str: string): string
  }

  export default LiqPay
}
// app/api/debug-env/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    environment: {
      DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
      LIQPAY_PUBLIC_KEY: process.env.LIQPAY_PUBLIC_KEY ? '✅ Set' : '❌ Missing', 
      LIQPAY_PRIVATE_KEY: process.env.LIQPAY_PRIVATE_KEY ? '✅ Set' : '❌ Missing',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ Missing',
      NODE_ENV: process.env.NODE_ENV
    }
  })
}
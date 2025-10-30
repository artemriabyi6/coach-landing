'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SuccessContentWithParams() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  const sessionId = searchParams.get('session_id')

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Оплата успішна! 🎉</h1>
        <p className="text-gray-600 mb-6 text-lg">
          Дякуємо за ваше замовлення! Доступ до курсу активовано.
        </p>

        {/* Показуємо ID транзакції, якщо є */}
        {(orderId || sessionId) && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              ID транзакції: {orderId || sessionId}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition duration-200 font-semibold text-lg"
          >
            На головну
          </Link>
          
          <Link
            href="/courses"
            className="block w-full border border-gray-300 text-gray-700 py-4 px-6 rounded-lg hover:bg-gray-50 transition duration-200 font-semibold"
          >
            Перейти до курсів
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Якщо виникли питання, звертайтесь до{' '}
            <a href="mailto:support@coach.com" className="text-blue-600 hover:underline">
              нашої підтримки
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження...</p>
        </div>
      </div>
    }>
      <SuccessContentWithParams />
    </Suspense>
  )
}
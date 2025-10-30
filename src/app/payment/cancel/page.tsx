import { Suspense } from 'react'
import Link from 'next/link'

function CancelContent() {
  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Оплату скасовано</h1>
        <p className="text-gray-600 mb-6">
          Ваш платіж було скасовано. Ви можете спробувати ще раз.
        </p>

        <div className="space-y-3">
          <Link
            href="/courses"
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Повернутися до курсів
          </Link>
          <Link
            href="/"
            className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition duration-200"
          >
            На головну
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentCancel() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження...</p>
        </div>
      </div>
    }>
      <CancelContent />
    </Suspense>
  )
}
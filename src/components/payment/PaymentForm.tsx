'use client'

import { useState } from 'react'
import { Course } from '../../types'
import { Button } from '../ui/Button'

interface PaymentFormProps {
  course: Course
  onSuccess: () => void
  onCancel: () => void
}

interface FormData {
  name: string
  email: string
  phone: string
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
}

export default function PaymentForm({ course, onSuccess, onCancel }: PaymentFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string>('')

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Ім'я обов'язкове"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Ім'я має містити принаймні 2 символи"
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = "Email обов'язковий"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Введіть коректний email"
    }

    const phoneRegex = /^(\+38)?0\d{9}$/
    const cleanPhone = formData.phone.replace(/\s/g, '')
    if (!formData.phone.trim()) {
      newErrors.phone = "Телефон обов'язковий"
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = "Введіть коректний номер у форматі +380 XX XXX XX XX"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    
    if (serverError) {
      setServerError('')
    }
  }

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.startsWith('380')) {
      return `+${numbers}`
    } else if (numbers.startsWith('0')) {
      return `+38${numbers}`
    } else if (numbers.length <= 3) {
      return `+${numbers}`
    } else if (numbers.length <= 6) {
      return `+${numbers.slice(0, 3)} ${numbers.slice(3)}`
    } else if (numbers.length <= 9) {
      return `+${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6)}`
    } else {
      return `+${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 9)} ${numbers.slice(9, 11)}`
    }
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    handleInputChange('phone', formatted)
  }

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setServerError('')

  if (!validateForm()) {
    return
  }

  setLoading(true)

  try {
    console.log('🔄 Creating LiqPay payment for course:', {
      courseId: course.id,
      courseTitle: course.title,
      customerEmail: formData.email,
      customerName: formData.name
    })

    // Додамо debug інформацію
    console.log('📊 Course object from props:', course)
    console.log('🔍 Course ID being sent:', course.id)
    console.log('🔍 Course title:', course.title)

    const response = await fetch('/api/payments/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId: course.id,
        customerEmail: formData.email,
        customerName: formData.name,
      }),
    })

    const data = await response.json()

    console.log('📨 API Response:', data)

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Помилка сервера')
    }

    if (data.paymentUrl && data.formData && data.signature) {
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = data.paymentUrl
      form.style.display = 'none'

      const dataInput = document.createElement('input')
      dataInput.type = 'hidden'
      dataInput.name = 'data'
      dataInput.value = data.formData
      form.appendChild(dataInput)

      const signatureInput = document.createElement('input')
      signatureInput.type = 'hidden'
      signatureInput.name = 'signature'
      signatureInput.value = data.signature
      form.appendChild(signatureInput)

      document.body.appendChild(form)
      form.submit()
    } else {
      throw new Error('Не отримано дані для оплати')
    }
  } catch (error) {
    console.error('❌ Error creating payment:', error)
    setServerError(
      error instanceof Error 
        ? error.message 
        : 'Помилка при створенні платежу. Спробуйте ще раз.'
    )
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4 border">
        <h3 className="font-semibold mb-2">Деталі замовлення</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold text-lg">{course.title}</p>
            <p className="text-gray-600 text-sm">{course.duration}</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{course.price} грн</p>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">🚀 Миттєвий доступ</h4>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Доступ до матеріалів відразу після оплати</li>
          <li>• Безпечна оплата через LiqPay</li>
          <li>• Підтримка основних платіжних систем</li>
        </ul>
      </div>

      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Помилка:</p>
          <p className="text-red-700 text-sm">{serverError}</p>
        </div>
      )}

      <div className="mb-4">
        <button
          type="button"
          onClick={() => {
            setFormData({
              name: 'Тестовий Користувач',
              email: 'test@example.com',
              phone: '+380 00 000 00 00'
            })
          }}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          📋 Заповнити тестові дані
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ім&apos;я та прізвище *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Введіть ваше ім'я"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Телефон *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+380 XX XXX XX XX"
          />
          {errors.phone && (
            <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        <div className="flex space-x-3 pt-4">
          <Button 
            type="submit" 
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-lg py-3"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Обробка...
              </span>
            ) : (
              `💳 Сплатити ${course.price} грн`
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="py-3"
          >
            Скасувати
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Натискаючи `&quot;`Сплатити`&qout;`, ви погоджуєтесь з нашими умовами обробки даних
        </p>
      </form>
    </div>
  )
}
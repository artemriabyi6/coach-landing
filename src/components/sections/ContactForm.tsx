'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../ui/Button'
import { contactFormSchema, type ContactFormData } from '../../lib/validation'

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema)
  })

  const onSubmit = async (data: ContactFormData) => {
  setIsSubmitting(true)
  setSubmitStatus('idle')

  try {
    console.log('🔄 Sending form data:', data)
    
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()
    console.log('📬 API response:', result)

    if (result.success) {
      setSubmitStatus('success')
      reset()
    } else {
      setSubmitStatus('error')
      console.error('❌ API returned error:', result.error)
    }
  } catch (error) {
    console.error('🚨 Network error:', error)
    setSubmitStatus('error')
  } finally {
    setIsSubmitting(false)
  }
}

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Зв&apos;яжіться з нами</h2>
          <p className="text-gray-600 text-center mb-12">
            Заповніть форму і ми зв&apos;яжемося з вами для консультації
          </p>

          {/* Статус повідомлення */}
          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                ✅ Дякуємо за заявку! Ми зв&apos;яжемося з вами найближчим часом.
              </p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">
                ❌ Сталася помилка. Будь ласка, спробуйте ще раз або зв&apos;яжіться з нами напряму.
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Ім'я */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Ім&apos;я *
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ваше ім'я"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              
              {/* Телефон */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Телефон *
                </label>
                <input
                  type="tel"
                  id="phone"
                  {...register('phone')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+380 XX XXX XX XX"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
              
              {/* Курс */}
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
                  Цікавить курс
                </label>
                <select
                  id="course"
                  {...register('course')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Оберіть курс</option>
                  <option value="basic">Базовий курс</option>
                  <option value="advanced">Просунутий курс</option>
                  <option value="other">Інше</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Повідомлення */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Повідомлення *
                </label>
                <textarea
                  id="message"
                  rows={8}
                  {...register('message')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    errors.message ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Розкажіть про ваші цілі та досвід..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                )}
                <div className="mt-1 text-sm text-gray-500">
                  {errors.message ? `${errors.message.message}` : 'Мінімум 10 символів'}
                </div>
              </div>
              
              {/* Кнопка відправки */}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Відправка...' : 'Надіслати заявку'}
              </Button>
              
              <p className="text-sm text-gray-500 text-center">
                Натискаючи кнопку, ви погоджуєтесь з обробкою ваших персональних даних
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
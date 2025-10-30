'use client'

import { useState, useEffect } from 'react'
import { Course } from '../../types'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import PaymentForm from '../payment/PaymentForm'

interface FeaturesSectionProps {
  courses: Course[]
}

export function FeaturesSection({ courses }: FeaturesSectionProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // Якщо courses передаються як пропс, використовуємо їх
  // Якщо ні - можемо зафетчити самостійно
  const [coursesData, setCoursesData] = useState<Course[]>(courses || [])

  // Якщо courses не передані як пропс, фетчимо їх
  useEffect(() => {
    if (!courses || courses.length === 0) {
      fetchCourses()
    }
  }, [courses])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/courses')
      if (!response.ok) {
        throw new Error('Не вдалося завантажити курси')
      }
      
      const data = await response.json()
      if (data.success) {
        setCoursesData(data.courses)
      } else {
        throw new Error(data.error || 'Помилка завантаження курсів')
      }
    } catch (err) {
      console.error('Error fetching courses:', err)
      setError(err instanceof Error ? err.message : 'Помилка завантаження')
    } finally {
      setLoading(false)
    }
  }

  const handleBuyClick = (course: Course) => {
    setSelectedCourse(course)
    setShowPaymentForm(true)
  }

  const handleDetailsClick = (course: Course) => {
    setSelectedCourse(course)
    setShowDetailsModal(true)
  }

  const handleContactClick = () => {
    setShowDetailsModal(false)
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading) {
    return (
      <section id="courses" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Завантаження курсів...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="courses" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-red-800 font-medium">Помилка завантаження</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <Button 
                onClick={fetchCourses}
                className="mt-3 bg-red-600 hover:bg-red-700"
              >
                Спробувати знову
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!coursesData || coursesData.length === 0) {
    return (
      <section id="courses" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">Наразі курси не доступні</p>
            <Button 
              onClick={fetchCourses}
              className="mt-3"
            >
              Оновити
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="courses" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Доступні курси</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Оберіть програму тренувань, яка найкраще підходить для ваших цілей та рівня підготовки
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {coursesData.map((course) => (
            <div key={course.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow flex flex-col">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-4">{course.description}</p>
                <div className="mb-4">
                  {course.features && course.features.map((feature, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-auto">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold text-gray-900">{course.price} грн</span>
                  <div className="text-sm text-gray-500">
                    Тривалість: {course.duration}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleDetailsClick(course)}
                    variant="outline"
                    className="flex-1"
                  >
                    Детальніше
                  </Button>
                  <Button 
                    onClick={() => handleBuyClick(course)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Купити зараз
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Додаткова інформація про оплату */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💳 Безпечна онлайн-оплата</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { name: 'Visa', icon: '💳' },
              { name: 'Mastercard', icon: '💳' },
              { name: 'LiqPay', icon: '🏦' },
              { name: 'Приват24', icon: '📱' },
            ].map((method) => (
              <div key={method.name} className="flex flex-col items-center">
                <span className="text-2xl mb-1">{method.icon}</span>
                <span className="text-sm text-gray-700">{method.name}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-blue-800 text-center mt-3">
            Миттєвий доступ до курсу після оплати • Гарантія безпеки LiqPay
          </p>
        </div>
      </div>

      {/* Course Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={selectedCourse?.title || ''}
      >
        {selectedCourse && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Опис курсу</h3>
              <p className="text-gray-700">{selectedCourse.description}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Що включено</h3>
              <ul className="space-y-2">
                {selectedCourse.features && selectedCourse.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{selectedCourse.price} грн</div>
                <div className="text-sm text-gray-600">Вартість</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{selectedCourse.duration}</div>
                <div className="text-sm text-gray-600">Тривалість</div>
              </div>
            </div>

            {/* Спосіб оплати в деталях */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">🎯 Швидкий старт</h4>
              <p className="text-green-800 text-sm">
                Оплатіть онлайн і отримайте доступ до курсу миттєво! Безпечна оплата через LiqPay.
              </p>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setShowDetailsModal(false)
                  setShowPaymentForm(true)
                }}
              >
                💳 Купити зараз
              </Button>
              <Button 
                variant="outline"
                onClick={handleContactClick}
              >
                📞 Консультація
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowDetailsModal(false)}
              >
                Закрити
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Form Modal */}
      <Modal
        isOpen={showPaymentForm}
        onClose={() => setShowPaymentForm(false)}
        title={`Оплата курсу: ${selectedCourse?.title}`}
        size="lg"
      >
        {selectedCourse && (
          <PaymentForm 
            course={selectedCourse}
            onSuccess={() => {
              setShowPaymentForm(false)
              setSelectedCourse(null)
              // Можна додати сповіщення про успішну оплату
              console.log('✅ Оплата пройшла успішно!')
            }}
            onCancel={() => setShowPaymentForm(false)}
          />
        )}
      </Modal>
    </section>
  )
}
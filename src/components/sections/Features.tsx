'use client'

import { useState } from 'react'
import { Course } from '../../types'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface FeaturesSectionProps {
  courses: Course[]
}

export function FeaturesSection({ courses }: FeaturesSectionProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  return (
    <section id="courses" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Доступні курси</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Оберіть програму тренувань, яка найкраще підходить для ваших цілей та рівня підготовки
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <div className="mb-4">
                {course.features.map((feature, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-gray-900">{course.price} грн</span>
                <Button onClick={() => setSelectedCourse(course)}>
                  Детальніше
                </Button>
              </div>
              <div className="mt-3 text-sm text-gray-500">
                Тривалість: {course.duration}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Details Modal */}
      <Modal
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
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
                {selectedCourse.features.map((feature, index) => (
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
            
            <div className="flex space-x-4 pt-4">
              <Button 
                className="flex-1"
                onClick={() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                  setSelectedCourse(null)
                }}
              >
                Записатися на курс
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedCourse(null)}
              >
                Закрити
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
'use client'

import { Course } from '../../types'
import { Button } from '../ui/Button'

interface FeaturesSectionProps {
  courses: Course[]
}

export function FeaturesSection({ courses }: FeaturesSectionProps) {
  return (
    <section id="courses" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Доступні курси</h2>
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
                <Button>
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
    </section>
  )
}
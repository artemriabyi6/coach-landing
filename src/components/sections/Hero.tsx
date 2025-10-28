'use client'

import { Button } from '../ui/Button'

export function HeroSection() {

   const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToCourses = () => {
    document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-green-50 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent"></div>
      
      <div className="text-center max-w-6xl mx-auto relative z-10">
        <div className="mb-8">
          <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
            🚀 Професійне тренування
          </span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          Прокачай свій
          <span className="block text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-green-600 mt-2">
            футбольний потенціал
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Індивідуальні програми тренувань для футболістів <strong>16-35 років</strong>. 
          Від резерву до основи за <strong>8 тижнів</strong>. Без шаблонів, тільки персональний підхід.
        </p>
        
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
        <Button 
          size="lg" 
          className="text-lg px-8 py-4 rounded-xl shadow-2xl hover:shadow-blue-600/25 transition-all duration-300 transform hover:-translate-y-1"
          onClick={scrollToContact}
        >
          🎯 Почати тренуватися
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="text-lg px-8 py-4 rounded-xl border-2 hover:border-blue-300 transition-all duration-300"
          onClick={scrollToCourses}
        >
          📚 Переглянути курси
        </Button>
      </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
          {[
            { value: '8 тижнів', label: 'до результату' },
            { value: '50+', label: 'гравців' },
            { value: '95%', label: 'успішних' },
            { value: '1 на 1', label: 'з тренером' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
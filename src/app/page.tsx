import { HeroSection } from '../components/sections/Hero'
import { FeaturesSection } from '../components/sections/Features'
import { ContactForm } from '../components/sections/ContactForm'
import { Footer } from '../components/sections/Footer'

// Просто статичні дані
const courses = [
  {
    id: '1',
    title: 'Базовий курс',
    description: 'Основи футбольної майстерності',
    price: 2999,
    duration: '8 тижнів',
    features: ['Індивідуальний підхід', 'Відеоаналіз', 'Щотижневі звіти'],
  },
  {
    id: '2',
    title: 'Просунутий курс',
    description: 'Для гравців, які хочуть вийти на новий рівень', 
    price: 4999,
    duration: '12 тижнів',
    features: ['Тактичний аналіз', 'Робота з психологом', 'Фізична підготовка'],
  }
]

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection courses={courses} />
      <ContactForm />
      <Footer/>
    </main>
  )
}
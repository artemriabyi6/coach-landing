import { HeroSection } from '../components/sections/Hero'
import { FeaturesSection } from '../components/sections/Features'
import { ContactForm } from '../components/sections/ContactForm'
import { Footer } from '../components/sections/Footer'
import { getAvailableCourses } from '../lib/courses'

// Просто статичні дані
// const courses = [
//     {
//             id: 'course-football-beginners',
//             title: 'Футбольний курс для початківців',
//             description: 'Основи футболу для початківців: техніка, тактика, фізична підготовка',
//             price: 1500,
//             duration: '4 тижні',
//             level: 'Початківець',
//             features: ['Відео уроки', 'Персональний фідбек', 'Тренувальний план']
//           },
//           {
//             id: 'course-football-advanced', 
//             title: 'Професійна підготовка футболістів',
//             description: 'Просунута техніка, тактика гри, стратегія та аналіз',
//             price: 3000,
//             duration: '8 тижнів',
//             level: 'Просунутий',
//             features: ['Індивідуальні консультації', 'Аналіз гри', 'Тактичні завдання']
//           },
//           {
//             id: 'course-personal-training',
//             title: 'Індивідуальні тренування',
//             description: 'Персональні тренування з професійним тренером',
//             price: 5000,
//             duration: 'Індивідуально',
//             level: 'Всі рівні',
//             features: ['Особистий тренер', 'Гнучкий графік', 'Індивідуальний підхід']
//           }
// ]

const courses = await getAvailableCourses()


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
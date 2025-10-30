import { HeroSection } from '../components/sections/Hero'
import { FeaturesSection } from '../components/sections/Features'
import { ContactForm } from '../components/sections/ContactForm'
import { Footer } from '../components/sections/Footer'
import { getAvailableCourses } from '../lib/courses'


export const dynamic = 'force-static'
export const revalidate = 3600 // 

export default async function HomePage() {
  const courses = await getAvailableCourses()

  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection courses={courses} />
      <ContactForm />
      <Footer/>
    </main>
  )
}
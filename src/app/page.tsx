import { HeroSection } from '../components/sections/Hero'
// import { FeaturesSection } from './components/sections/features'
// import { ContactForm } from './components/sections/contact-form'
import { getCourses } from '../lib/db'

export default async function HomePage() {
  // Server-side data fetching
  const courses = await getCourses()

  return (
    <main>
      <HeroSection />
      {/* <FeaturesSection courses={courses} />
      <ContactForm /> */}
    </main>
  )
}
import { getAvailableCourses } from '../../lib/courses'
import { FeaturesSection } from './Features'

export async function FeaturesSectionWrapper() {
  const courses = await getAvailableCourses()
  
  return <FeaturesSection courses={courses} />
}
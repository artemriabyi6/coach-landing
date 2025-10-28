export interface Course {
  id: string
  title: string
  description: string
  price: number
  duration: string
  features: string[]
  level: 'beginner' | 'advanced' | 'pro'
}

export interface ContactFormData {
  name: string
  email: string
  phone: string
  message: string
  courseInterest?: string
}

export interface OrderData {
  courseId: string
  userEmail: string
  userName: string
  amount: number
}
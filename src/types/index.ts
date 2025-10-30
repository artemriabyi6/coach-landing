export interface Course {
  id: string
  title: string
  description: string
  price: number
  duration: string
  level?: string
  features?: string[]
  image?: string
  createdAt?: Date
}

export interface ContactFormData {
  name: string
  email: string
  phone: string
  message: string
  course?: string
}

export interface OrderData {
  courseId: string
  userEmail: string
  userName: string
  amount: number
}

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  message: string
  courseInterest: string | null
  status: string
  createdAt: Date
  updatedAt: Date
}


import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database queries
export async function createContactRequest(data: {
  name: string
  email: string
  phone: string
  message: string
  courseInterest?: string
}) {
  return prisma.contact.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      courseInterest: data.courseInterest,
    },
  })
}

export async function getCourses() {
  return prisma.course.findMany({
    orderBy: { price: 'asc' }
  })
}
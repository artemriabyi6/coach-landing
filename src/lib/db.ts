import { PrismaClient } from '@prisma/client'
import { ContactFormData, Contact } from '../types'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Функція для збереження контакту
export async function createContact(data: ContactFormData) {
  try {
    const contact = await prisma.contact.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        courseInterest: data.course || null,  // Використовуємо courseInterest
      },
    })
    console.log('✅ Contact saved to database:', contact.id)
    return contact
  } catch (error) {
    console.error('❌ Error saving contact to database:', error)
    throw error
  }
}

// Функція для отримання всіх контактів
export async function getContacts(): Promise<Contact[]> {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    })
    
    // Конвертуємо до нашого типу Contact
    return contacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      message: contact.message,
      courseInterest: contact.courseInterest,
      status: contact.status, // ✅ Тепер поле має бути доступне
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt
    }))
  } catch (error) {
    console.error('❌ Error fetching contacts:', error)
    return []
  }
}
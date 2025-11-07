import { PrismaClient } from '@prisma/client'
import { ContactFormData, Contact } from '../types'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

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
        courseInterest: data.course || null,
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
      status: contact.status,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt
    }))
  } catch (error) {
    console.error('❌ Error fetching contacts:', error)
    return []
  }
}

// Оновлюємо статус заявки
export async function updateContactStatus(contactId: string, status: string) {
  try {
    console.log('🔄 Updating contact status:', contactId, '→', status)
    
    const contact = await prisma.contact.update({
      where: { 
        id: contactId
      },
      data: { 
        status: status,
        updatedAt: new Date()
      }
    })
    
    console.log('✅ Contact status updated successfully:', contact.id)
    return contact
  } catch (error) {
    console.error('❌ Error updating contact status:', error)
    throw new Error(`Не вдалося оновити статус: ${error instanceof Error ? error.message : 'Невідома помилка'}`)
  }
}

// Видаляємо заявку
export async function deleteContact(contactId: string) {
  try {
    console.log('🗑️ Deleting contact:', contactId)
    
    await prisma.contact.delete({
      where: { 
        id: contactId
      }
    })
    
    console.log('✅ Contact deleted successfully')
    return true
  } catch (error) {
    console.error('❌ Error deleting contact:', error)
    throw new Error(`Не вдалося видалити заявку: ${error instanceof Error ? error.message : 'Невідома помилка'}`)
  }
}

export async function testConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Додаткові утиліти для тестування
interface TestConnectionResult {
  success: boolean
  result?: unknown
  error?: string
  code?: string
}

interface DatabaseStats {
  courses: number
  users: number
  contacts: number
  payments: number
}

export async function testDatabaseConnection(): Promise<TestConnectionResult> {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`
    return { success: true, result }
  } catch (error) {
    console.error('Database connection test failed:', error)
    const dbError = error as { message: string; code?: string }
    return { 
      success: false, 
      error: dbError.message,
      code: dbError.code
    }
  }
}

export async function getDatabaseStats(): Promise<DatabaseStats | null> {
  try {
    const [
      coursesCount,
      usersCount, 
      contactsCount,
      paymentsCount
    ] = await Promise.all([
      prisma.course.count(),
      prisma.user.count(),
      prisma.contact.count(),
      prisma.payment.count()
    ])

    return {
      courses: coursesCount,
      users: usersCount,
      contacts: contactsCount,
      payments: paymentsCount
    }
  } catch (error) {
    console.error('Error getting database stats:', error)
    return null
  }
}
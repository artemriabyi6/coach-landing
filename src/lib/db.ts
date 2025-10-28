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

// Оновлюємо статус заявки
// Оновлюємо статус заявки
// Оновлюємо статус заявки
export async function updateContactStatus(contactId: string, status: string) {
  try {
    console.log('🔄 Updating contact status:', contactId, '→', status)
    
    const contact = await prisma.contact.update({
      where: { 
        id: contactId // ✅ Переконуємося, що contactId передається
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
        id: contactId // ✅ Переконуємося, що contactId передається
      }
    })
    
    console.log('✅ Contact deleted successfully')
    return true
  } catch (error) {
    console.error('❌ Error deleting contact:', error)
    throw new Error(`Не вдалося видалити заявку: ${error instanceof Error ? error.message : 'Невідома помилка'}`)
  }
}
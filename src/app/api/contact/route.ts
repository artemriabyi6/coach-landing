import { NextRequest, NextResponse } from 'next/server'
import { contactFormSchema } from '../../../lib/validation'
import { createContact, getContacts } from '../../../lib/db'

// GET - отримання всіх контактів
export async function GET() {
  try {
    const contacts = await getContacts()
    
    return NextResponse.json(contacts, { status: 200 })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'Помилка при отриманні заявок' },
      { status: 500 }
    )
  }
}

// POST - створення нового контакту
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Валідація даних
    const validatedData = contactFormSchema.parse(body)
    
    // Зберігаємо в базу даних
    const contact = await createContact(validatedData)
    
    console.log('📝 Contact form processed successfully:', contact.id)
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Заявка успішно відправлена',
        contactId: contact.id
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Error processing contact form:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Помилка при обробці форми. Спробуйте ще раз.' 
      },
      { status: 400 }
    )
  }
}
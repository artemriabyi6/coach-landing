import { NextRequest, NextResponse } from 'next/server'
import { contactFormSchema } from '../../../lib/validation'
import { createContact } from '../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📨 Received contact form data:', body)
    
    // Валідація даних
    const validatedData = contactFormSchema.parse(body)
    console.log('✅ Data validation passed')
    
    // Зберігаємо в базу даних
    const contact = await createContact(validatedData)
    console.log('💾 Contact saved to database:', contact.id)
    
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
    
    // Детальніше логуємо помилку валідації
    if (error instanceof Error && error.name === 'ZodError') {
      console.error('📋 Validation errors:', error)
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Помилка при обробці форми. Спробуйте ще раз.' 
      },
      { status: 400 }
    )
  }
}
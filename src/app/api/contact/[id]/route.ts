import { NextRequest, NextResponse } from 'next/server'
import { updateContactStatus, deleteContact } from '../../../../lib/db'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// Оновлення статусу
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params // ✅ Додаємо await
    console.log('🔄 PATCH request for contact:', id)
    
    const body = await request.json()
    console.log('📦 Request body:', body)
    
    const { status } = body

    if (!status) {
      console.log('❌ Status is missing in request body')
      return NextResponse.json(
        { 
          success: false,
          error: 'Status is required' 
        },
        { status: 400 }
      )
    }

    // Валідація статусу
    const validStatuses = ['new', 'contacted', 'completed']
    if (!validStatuses.includes(status)) {
      console.log('❌ Invalid status:', status)
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid status. Must be one of: new, contacted, completed' 
        },
        { status: 400 }
      )
    }

    const contact = await updateContactStatus(id, status)
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Статус оновлено',
        contact 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Error in PATCH handler:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Помилка при оновленні статусу' 
      },
      { status: 400 }
    )
  }
}

// Видалення заявки
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params // ✅ Додаємо await
    console.log('🗑️ DELETE request for contact:', id)
    
    await deleteContact(id)
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Заявку видалено'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Error in DELETE handler:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Помилка при видаленні заявки' 
      },
      { status: 400 }
    )
  }
}
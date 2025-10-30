import { NextResponse } from 'next/server'
import { getAvailableCourses } from '../../../lib/courses'

export async function GET() {
  try {
    const courses = await getAvailableCourses()
    
    return NextResponse.json({
      success: true,
      courses,
      total: courses.length
    })
  } catch (error) {
    console.error('Error in courses API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Не вдалося завантажити курси',
        courses: []
      },
      { status: 500 }
    )
  }
}
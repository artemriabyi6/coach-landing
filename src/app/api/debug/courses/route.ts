import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        price: true,
        description: true
      }
    })

    return NextResponse.json({
      success: true,
      courses: courses,
      total: courses.length
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
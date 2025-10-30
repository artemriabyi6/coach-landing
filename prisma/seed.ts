import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  try {
    const existingCourses = await prisma.course.findMany()
    console.log(`📊 Found ${existingCourses.length} existing courses`)
    
    if (existingCourses.length === 0) {
      console.log('Creating sample courses...')
      
      const courses = await prisma.course.createMany({
        data: [
          {
            id: 'course-football-beginners',
            title: 'Футбольний курс для початківців',
            description: 'Основи футболу для початківців: техніка, тактика, фізична підготовка',
            price: 1500,
            duration: '4 тижні',
            level: 'Початківець',
            features: ['Відео уроки', 'Персональний фідбек', 'Тренувальний план']
          },
          {
            id: 'course-football-advanced', 
            title: 'Професійна підготовка футболістів',
            description: 'Просунута техніка, тактика гри, стратегія та аналіз',
            price: 3000,
            duration: '8 тижнів',
            level: 'Просунутий',
            features: ['Індивідуальні консультації', 'Аналіз гри', 'Тактичні завдання']
          },
          {
            id: 'course-personal-training',
            title: 'Індивідуальні тренування',
            description: 'Персональні тренування з професійним тренером',
            price: 5000,
            duration: 'Індивідуально',
            level: 'Всі рівні',
            features: ['Особистий тренер', 'Гнучкий графік', 'Індивідуальний підхід']
          }
        ]
      })
      console.log('✅ Created courses:', courses.count)
    } else {
      console.log('✅ Courses already exist in database')
    }

    console.log('🎉 Seed completed successfully!')

  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('💥 Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('🔚 Prisma disconnected')
  })
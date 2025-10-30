import { prisma } from './db'

export interface Course {
  id: string
  title: string
  description: string
  price: number
  duration: string
  level?: string
  features: string[]
  createdAt: Date
}

export interface CourseFilters {
  level?: string
  minPrice?: number
  maxPrice?: number
}

// Тип для where умови Prisma
interface WhereClause {
  level?: string
  price?: {
    gte?: number
    lte?: number
  }
}

/**
 * Отримати всі доступні курси з бази даних
 */
export async function getAvailableCourses(filters?: CourseFilters): Promise<Course[]> {
  try {
    console.log('📚 Fetching courses from database...')
    
    const whereClause: WhereClause = {}

    // Додаємо фільтри, якщо вони передані
    if (filters?.level) {
      whereClause.level = filters.level
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      whereClause.price = {}
      if (filters.minPrice !== undefined) {
        whereClause.price.gte = filters.minPrice
      }
      if (filters.maxPrice !== undefined) {
        whereClause.price.lte = filters.maxPrice
      }
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        duration: true,
        level: true,
        features: true,
        createdAt: true,
      },
      orderBy: [
        { price: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    console.log(`✅ Found ${courses.length} courses`)

    // Трансформуємо дані до потрібного формату
    return courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      duration: course.duration,
      level: course.level || undefined,
      features: course.features || [],
      createdAt: course.createdAt,
    }))

  } catch (error) {
    console.error('❌ Error fetching courses:', error)
    throw new Error('Не вдалося завантажити курси з бази даних')
  }
}

/**
 * Отримати курс за ID
 */
export async function getCourseById(id: string): Promise<Course | null> {
  try {
    console.log(`🔍 Fetching course by ID: ${id}`)

    const course = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        duration: true,
        level: true,
        features: true,
        createdAt: true,
      }
    })

    if (!course) {
      console.log(`❌ Course not found with ID: ${id}`)
      return null
    }

    console.log(`✅ Found course: ${course.title}`)

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      duration: course.duration,
      level: course.level || undefined,
      features: course.features || [],
      createdAt: course.createdAt,
    }

  } catch (error) {
    console.error(`❌ Error fetching course by ID ${id}:`, error)
    throw new Error('Не вдалося знайти курс')
  }
}

/**
 * Отримати курси за рівнем складності
 */
export async function getCoursesByLevel(level: string): Promise<Course[]> {
  try {
    console.log(`📚 Fetching courses by level: ${level}`)

    const courses = await prisma.course.findMany({
      where: { level },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        duration: true,
        level: true,
        features: true,
        createdAt: true,
      },
      orderBy: { price: 'asc' }
    })

    console.log(`✅ Found ${courses.length} courses with level: ${level}`)

    return courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      duration: course.duration,
      level: course.level || undefined,
      features: course.features || [],
      createdAt: course.createdAt,
    }))

  } catch (error) {
    console.error(`❌ Error fetching courses by level ${level}:`, error)
    throw new Error('Не вдалося завантажити курси за рівнем')
  }
}

/**
 * Отримати курси в діапазоні цін
 */
export async function getCoursesByPriceRange(minPrice: number, maxPrice: number): Promise<Course[]> {
  try {
    console.log(`💰 Fetching courses in price range: ${minPrice} - ${maxPrice}`)

    const courses = await prisma.course.findMany({
      where: {
        price: {
          gte: minPrice,
          lte: maxPrice
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        duration: true,
        level: true,
        features: true,
        createdAt: true,
      },
      orderBy: { price: 'asc' }
    })

    console.log(`✅ Found ${courses.length} courses in price range`)

    return courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      duration: course.duration,
      level: course.level || undefined,
      features: course.features || [],
      createdAt: course.createdAt,
    }))

  } catch (error) {
    console.error(`❌ Error fetching courses by price range:`, error)
    throw new Error('Не вдалося завантажити курси за діапазоном цін')
  }
}

/**
 * Отримати унікальні рівні курсів для фільтрів
 */
export async function getCourseLevels(): Promise<string[]> {
  try {
    console.log('🏷️ Fetching unique course levels...')

    const courses = await prisma.course.findMany({
      select: {
        level: true
      },
      distinct: ['level']
    })

    const levels = courses
      .map(course => course.level)
      .filter((level): level is string => level !== null && level !== undefined)

    console.log(`✅ Found ${levels.length} unique levels:`, levels)

    return levels

  } catch (error) {
    console.error('❌ Error fetching course levels:', error)
    throw new Error('Не вдалося завантажити рівні курсів')
  }
}

/**
 * Отримати мінімальну та максимальну ціну курсів
 */
export async function getPriceRange(): Promise<{ min: number; max: number }> {
  try {
    console.log('💵 Fetching price range...')

    const [minResult, maxResult] = await Promise.all([
      prisma.course.aggregate({
        _min: {
          price: true
        }
      }),
      prisma.course.aggregate({
        _max: {
          price: true
        }
      })
    ])

    const minPrice = minResult._min.price || 0
    const maxPrice = maxResult._max.price || 0

    console.log(`✅ Price range: ${minPrice} - ${maxPrice}`)

    return {
      min: minPrice,
      max: maxPrice
    }

  } catch (error) {
    console.error('❌ Error fetching price range:', error)
    throw new Error('Не вдалося завантажити діапазон цін')
  }
}

/**
 * Пошук курсів за ключовими словами
 */
export async function searchCourses(query: string): Promise<Course[]> {
  try {
    console.log(`🔎 Searching courses with query: "${query}"`)

    const courses = await prisma.course.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        duration: true,
        level: true,
        features: true,
        createdAt: true,
      },
      orderBy: [
        { title: 'asc' },
        { price: 'asc' }
      ]
    })

    console.log(`✅ Found ${courses.length} courses matching query`)

    return courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      duration: course.duration,
      level: course.level || undefined,
      features: course.features || [],
      createdAt: course.createdAt,
    }))

  } catch (error) {
    console.error(`❌ Error searching courses with query "${query}":`, error)
    throw new Error('Не вдалося виконати пошук курсів')
  }
}

/**
 * Отримати популярні курси (найновіші або з певною логікою)
 */
export async function getPopularCourses(limit: number = 3): Promise<Course[]> {
  try {
    console.log(`🔥 Fetching ${limit} popular courses...`)

    // Наразі беремо останні додані курси
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        duration: true,
        level: true,
        features: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    console.log(`✅ Found ${courses.length} popular courses`)

    return courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      duration: course.duration,
      level: course.level || undefined,
      features: course.features || [],
      createdAt: course.createdAt,
    }))

  } catch (error) {
    console.error('❌ Error fetching popular courses:', error)
    throw new Error('Не вдалося завантажити популярні курси')
  }
}

/**
 * Оновити інформацію про курс (для адміністратора)
 */
export async function updateCourse(id: string, data: Partial<Omit<Course, 'id' | 'createdAt'>>): Promise<Course> {
  try {
    console.log(`🔄 Updating course: ${id}`)

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        duration: data.duration,
        level: data.level,
        features: data.features,
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        duration: true,
        level: true,
        features: true,
        createdAt: true,
      }
    })

    console.log(`✅ Course updated: ${updatedCourse.title}`)

    return {
      id: updatedCourse.id,
      title: updatedCourse.title,
      description: updatedCourse.description,
      price: updatedCourse.price,
      duration: updatedCourse.duration,
      level: updatedCourse.level || undefined,
      features: updatedCourse.features || [],
      createdAt: updatedCourse.createdAt,
    }

  } catch (error) {
    console.error(`❌ Error updating course ${id}:`, error)
    throw new Error('Не вдалося оновити курс')
  }
}

/**
 * Створити новий курс (для адміністратора)
 */
export async function createCourse(data: Omit<Course, 'id' | 'createdAt'>): Promise<Course> {
  try {
    console.log('🆕 Creating new course...')

    const newCourse = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        duration: data.duration,
        level: data.level,
        features: data.features,
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        duration: true,
        level: true,
        features: true,
        createdAt: true,
      }
    })

    console.log(`✅ Course created: ${newCourse.title}`)

    return {
      id: newCourse.id,
      title: newCourse.title,
      description: newCourse.description,
      price: newCourse.price,
      duration: newCourse.duration,
      level: newCourse.level || undefined,
      features: newCourse.features || [],
      createdAt: newCourse.createdAt,
    }

  } catch (error) {
    console.error('❌ Error creating course:', error)
    throw new Error('Не вдалося створити курс')
  }
}

/**
 * Видалити курс (для адміністратора)
 */
export async function deleteCourse(id: string): Promise<boolean> {
  try {
    console.log(`🗑️ Deleting course: ${id}`)

    await prisma.course.delete({
      where: { id }
    })

    console.log(`✅ Course deleted: ${id}`)
    return true

  } catch (error) {
    console.error(`❌ Error deleting course ${id}:`, error)
    throw new Error('Не вдалося видалити курс')
  }
}

/**
 * Отримати кількість курсів
 */
export async function getCoursesCount(filters?: CourseFilters): Promise<number> {
  try {
    console.log('📊 Counting courses...')
    
    const whereClause: WhereClause = {}

    if (filters?.level) {
      whereClause.level = filters.level
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      whereClause.price = {}
      if (filters.minPrice !== undefined) {
        whereClause.price.gte = filters.minPrice
      }
      if (filters.maxPrice !== undefined) {
        whereClause.price.lte = filters.maxPrice
      }
    }

    const count = await prisma.course.count({
      where: whereClause
    })

    console.log(`✅ Total courses: ${count}`)
    return count

  } catch (error) {
    console.error('❌ Error counting courses:', error)
    throw new Error('Не вдалося порахувати курси')
  }
}
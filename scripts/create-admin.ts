import { prisma } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  const email = 'admin@coachpro.com'
  const password = 'admin123'
  const name = 'Admin'

  const hashedPassword = await bcrypt.hash(password, 12)

  try {
    // Перевіряємо, чи існує вже користувач
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // Оновлюємо існуючого користувача
      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          name,
          role: 'admin'
        }
      })
      console.log('✅ Admin user updated successfully')
    } else {
      // Створюємо нового користувача
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'admin'
        }
      })
      console.log('✅ Admin user created successfully')
    }
    
    console.log('Email:', email)
    console.log('Password:', password)
  } catch (error) {
    console.error('Error creating admin user:', error)
  }
}

createAdmin()
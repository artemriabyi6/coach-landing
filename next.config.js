/** @type {import('next').NextConfig} */
const nextConfig = {
  // Вказуємо явно використання webpack
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('_http_common')
    }
    return config
  },
  
  // Додаємо пусту конфігурацію Turbopack
  turbopack: {},
  
  // Правильне ім'я для external packages
  serverExternalPackages: ['@prisma/client', 'prisma'],
  
  // Додаткові налаштування
  experimental: {
    // Інші експериментальні функції, якщо потрібно
  }
}

module.exports = nextConfig
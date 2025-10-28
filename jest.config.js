import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const config  = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {  // ✅ Виправлено з moduleNameMapping
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/api/**/*.{js,ts}',
    '!src/**/layout.{js,jsx,ts,tsx}',
    '!src/**/page.{js,jsx,ts,tsx}',
    '!src/**/loading.{js,jsx,ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],
}

export default createJestConfig(config)
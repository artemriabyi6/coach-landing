import { cn } from '../utils'

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    const result = cn('class1', 'class2')
    expect(result).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    const result = cn('class1', false && 'class2', true && 'class3')
    expect(result).toBe('class1 class3')
  })

  it('should handle tailwind merge correctly', () => {
    const result = cn('p-4 p-6')
    expect(result).toBe('p-6')
  })
})
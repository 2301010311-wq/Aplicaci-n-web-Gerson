import { cn } from '@/lib/utils'

describe('Utils helper', () => {
  it('combina clases correctamente', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
  })
})

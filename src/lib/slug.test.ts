import { describe, it, expect } from 'vitest'
import { generateSlug } from './slug'

describe('slug', () => {
  it('normal title: `generateSlug(\'Hello World\')` returns `\'hello-world\'`', () => {
    const result = generateSlug('Hello World')
    expect(result).toBe('hello-world')
  })

  it('special chars: `generateSlug(\'My Agent! (v2)\')` returns `\'my-agent-v2\'`', () => {
    const result = generateSlug('My Agent! (v2)')
    expect(result).toBe('my-agent-v2')
  })

  it('empty string: `generateSlug(\'\')` returns `\'untitled\'`', () => {
    const result = generateSlug('')
    expect(result).toBe('untitled')
  })
})

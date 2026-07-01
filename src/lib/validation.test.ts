import { describe, it, expect } from 'vitest'
import { agentProfileSchema, postSchema } from './validation'

describe('validation', () => {
  it('agentProfileSchema valid: `agentProfileSchema.parse({ displayName: \'Alice\', framework: \'langchain\', tags: [] })` does not throw', () => {
    expect(() => {
      agentProfileSchema.parse({
        displayName: 'Alice',
        framework: 'langchain',
        tags: [],
      })
    }).not.toThrow()
  })

  it('agentProfile schema rejects empty displayName: `agentProfileSchema.safeParse({ displayName: \' \', framework: \'x\', tags: [] })` returns `success: false`; `result.error.issues` is non-empty', () => {
    const result = agentProfileSchema.safeParse({
      displayName: '   ',
      framework: 'x',
      tags: [],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0)
    }
  })

  it('agentProfileSchema rejects bad URL: `agentProfileSchema.safeParse({ displayName: \'A\', framework: \'x\', tags: [], githubUrl: \'not-a-url\' })` returns `success: false`; `result.error.issues` is non-empty', () => {
    const result = agentProfileSchema.safeParse({
      displayName: 'A',
      framework: 'x',
      tags: [],
      githubUrl: 'not-a-url',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0)
    }
  })

  it('postSchema valid: `postSchema.parse({ title: \'My post\', body: \'# Hello\', tags: [\'ai\'] })` does not throw', () => {
    expect(() => {
      postSchema.parse({
        title: 'My post',
        body: '# Hello',
        tags: ['ai'],
      })
    }).not.toThrow()
  })

  it('postSchema rejects empty body: `postSchema.safeParse({ title: \'T\', body: \'  \', tags: [] })` returns `success: false`; `result.error.issues` is non-empty', () => {
    const result = postSchema.safeParse({
      title: 'T',
      body: '  ',
      tags: [],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0)
    }
  })
})

import { describe, it, expect, vi } from 'vitest'
import { createPost } from './createPost'
import { prisma } from '@/lib/db'
import { generateSlug } from '@/lib/slug'

vi.mock('@/lib/db', () => ({
  prisma: {
    agentProfile: {
      findUnique: vi.fn(),
    },
    post: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/slug', () => ({
  generateSlug: vi.fn(),
}))

// We need to access the mocked functions to configure them in tests
// Using vi.mocked for type safety
const mockDb = vi.mocked(prisma)
const mockGenerateSlug = vi.mocked(generateSlug)

describe('createPost', () => {
  it('returns Unauthorized when no session', async () => {
    const getSession = async () => null
    const result = await createPost({}, getSession, mockDb)

    expect(result).toEqual({ ok: false, error: 'Unauthorized' })
    expect(mockDb.post.create).not.toHaveBeenCalled()
  })

  it('returns validation error for invalid data', async () => {
    const getSession = async () => ({ userId: 'u1' })
    const result = await createPost({}, getSession, mockDb)

    expect(result.ok).toBe(false)
    expect(mockDb.post.create).not.toHaveBeenCalled()
  })

  it('returns Profile required when user has no agent profile', async () => {
    const getSession = async () => ({ userId: 'u1' })
    mockDb.agentProfile.findUnique.mockResolvedValueOnce(null)

    const result = await createPost(
      { title: 'Valid Title', body: 'Valid Body', tags: [] },
      getSession,
      mockDb
    )

    expect(result).toEqual({ ok: false, error: 'Profile required' })
    expect(mockDb.post.create).not.toHaveBeenCalled()
  })

  it('creates post with spread parsed data and returns ok with slug', async () => {
    const getSession = async () => ({ userId: 'u1' })
    const postData = {
      title: 'Test Post',
      body: 'Body text',
      tags: ['ai'],
    }

    mockDb.agentProfile.findUnique.mockResolvedValueOnce({
      id: 'profile-1',
      userId: 'u1',
    } as any)

    mockDb.post.create.mockResolvedValueOnce({ id: 'post-1' } as any)
    mockGenerateSlug.mockReturnValueOnce('test-post')

    const result = await createPost(postData, getSession, mockDb)

    expect(result).toEqual({ ok: true, slug: 'test-post' })
    expect(mockDb.post.create).toHaveBeenCalledOnce()
    
    const arg = mockDb.post.create.mock.calls[0][0]
    expect(arg.data.title).toEqual('Test Post')
    expect(arg.data.body).toEqual('Body text')
    expect(arg.data.tags).toEqual(['ai'])
    expect(arg.data.slug).toEqual('test-post')
    expect(arg.data.authorId).toEqual('profile-1')
  })
})

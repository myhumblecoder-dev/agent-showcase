import { describe, it, expect, vi, beforeEach } from 'vitest'
import { publishPost } from './publishPost'
import { prisma } from '@/lib/db'

vi.mock('@/lib/db', () => ({
  prisma: {
    post: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

describe('publishPost', () => {
  const mockDb = prisma

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns Unauthorized when no session', async () => {
    const _getSession = async () => null
    const res = await publishPost('post-1', _getSession, mockDb)

    expect(res).toEqual({ ok: false, error: 'Unauthorized' })
    expect(mockDb.post.update).not.toHaveBeenCalled()
  })

  it('returns Not found when post does not exist', async () => {
    const _getSession = async () => ({ userId: 'u1' })
    vi.mocked(mockDb.post.findUnique).mockResolvedValue(null)

    const res = await publishPost('post-1', _getSession, mockDb)

    expect(res).toEqual({ ok: false, error: 'Not found' })
    expect(mockDb.post.update).not.toHaveBeenCalled()
  })

  it('returns Forbidden when session user does not own the post', async () => {
    const _getSession = async () => ({ userId: 'u2' })
    const stubPost = {
      id: 'post-1',
      author: { userId: 'u1', displayName: 'Alice' },
    }
    vi.mocked(mockDb.post.findUnique).mockResolvedValue(stubPost as any)

    const res = await publishPost('post-1', _getSession, mockDb)

    expect(res).toEqual({ ok: false, error: 'Forbidden' })
    expect(mockDb.post.update).not.toHaveBeenCalled()
  })

  it('publishes post and returns ok with SHORT arg assertions', async () => {
    const _getSession = async () => ({ userId: 'u1' })
    const stubPost = {
      id: 'post-1',
      author: { userId: 'u1', displayName: 'Alice' },
    }
    vi.mocked(mockDb.post.findUnique).mockResolvedValue(stubPost as any)
    vi.mocked(mockDb.post.update).mockResolvedValue({ id: 'post-1', published: true } as any)

    const res = await publishPost('post-1', _getSession, mockDb)

    expect(res).toEqual({ ok: true })
    expect(mockDb.post.update).toHaveBeenCalledOnce()
    const arg = mockDb.post.update.mock.calls[0][0]
    expect(arg.where).toEqual({ id: 'post-1' })
    expect(arg.data).toEqual({ published: true })
  })
})

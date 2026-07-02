import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listPublishedPosts } from './listPublishedPosts'
import { prisma } from '@/lib/db'

vi.mock('@/lib/db', () => ({
  prisma: {
    post: {
      findMany: vi.fn(),
    },
  },
}))

describe('listPublished לוPublishedPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('default limit: `prisma.post.findMany` mock resolves to `[{ id: \'1\', title: \'T\', slug: \'s\', createdAt: new Date(\'2024-01-01\'), author: { displayName: \'Alice\', framework: \'langchain\' } }]` → `listPublishedPosts()` resolves to that array and `findMany` was called with an object containing `take: 20`', async () => {
    const mockData = [
      {
        id: '1',
        title: 'T',
        slug: 's',
        createdAt: new Date(Date.UTC(2024, 0, 1)),
        author: {
          displayName: 'Alice',
          framework: 'langchain',
        },
      },
    ]

    vi.mocked(prisma.post.findMany).mockResolvedValue(mockData as any)

    const result = await listPublishedPosts()

    expect(result).toEqual(mockData)
    expect(prisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 20,
      })
    )
  })

  it('custom limit: `listPublishedPosts({ limit: 5 })` → `findMany` called with an object containing `take: 5`', async () => {
    vi.mocked(prisma.post.findMany).mockResolvedValue([] as any)

    await listPublishedPosts({ limit: 5 })

    expect(prisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 5,
      })
    )
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listPublishedPosts } from './listPublishedPosts'

// Mock the database singleton
vi.mock('@/lib/db', () => ({
  prisma: {
    post: {
      findMany: vi.fn(),
    },
  },
}))

// Create a typed mock object to pass as _db
const mockDb = {
  post: {
    findMany: vi.fn(),
  },
}

describe('listPublishedPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty array when no published posts', async () => {
    vi.mocked(mockDb.post.findMany).mockResolvedValue([])

    const result = await listPublishedPosts(mockDb as any)

    expect(result).toEqual([])
  })

  it('returns list of FeedPost objects with correct title and author', async () => {
    const date1 = new Date(Date.UTC(2024, 0, 1))
    const date2 = new Date(Date.UTC(2024, 5, 15))

    const stubPosts = [
      {
        id: '1',
        title: 'Post One',
        slug: 'post-one',
        tags: ['tech'],
        createdAt: date1,
        author: { displayName: 'Alice' },
      },
      {
        id: '2',
        title: 'Post Two',
        slug: 'post-two',
        tags: ['news'],
        createdAt: date2,
        author: { displayName: 'Bob' },
      },
    ]

    vi.mocked(mockDb.post.findMany).mockResolvedValue(stubPosts as any)

    const result = await listPublishedPosts(mockDb as any)

    expect(result).toHaveLength(2)
    expect(result[0].title).toBe('Post One')
    expect(result[0].author.displayName).toBe('Alice')
  })

  it('calls findMany with where published:true, orderBy createdAt desc, and correct select shape', async () => {
    vi.mocked(mockDb.post.findMany).mockResolvedValue([])

    await listPublishedPosts(mockDb as any)

    expect(mockDb.post.findMany).toHaveBeenCalledOnce()
    const arg = mockDb.post.findMany.mock.calls[0][0]

    expect(arg.where).toEqual({ published: true })
    expect(arg.orderBy).toEqual({ createdAt: 'desc' })
    expect(arg.select.id).toBe(true)
    expect(arg.select.author.select.displayName).toBe(true)
  })
})

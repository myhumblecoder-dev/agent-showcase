import { describe, it, expect, vi, beforeEach } from 'vitest'
import { browseAgents } from './browseAgents'
import { prisma } from '@/lib/db'

vi.mock('@/lib/db', () => ({
  prisma: {
    agentProfile: {
      findMany: vi.fn(),
    },
  },
}))

describe('browseAgents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('no filters: `browseAGents()` → `prisma.agentProfile.findMany` called with object containing `{ where: {}, orderBy: { createdAt: \'desc\' }, take: 50 }`', async () => {
    vi.mocked(prisma.agentProfile.findMany).mockResolvedValue([])

    await browseAgents()

    expect(prisma.agentProfile.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  })

  it("framework filter: `browseAgents({ framework: 'langchain' })` → `findMany` called with `where` containing `framework: 'langchain'`", async () => {
    vi.mocked(prisma.agentProfile.findMany).mockResolvedValue([])

    await browseAgents({ framework: 'langchain' })

    expect(prisma.agentProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ framework: 'langchain' }),
      })
    )
  })

  it("tag filter: `browseAgents({ tags: ['llm'] })` → `findMany` called with `where` containing `tags: { hasSome: ['llm'] }`", async () => {
    vi.mocked(prisma.agentProfile.findMany).mockResolvedValue([])

    await browseAgents({ tags: ['llm'] })

    expect(prisma.agentProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tags: { hasSome: ['llm'] },
        }),
      })
    )
  })

  it("keyword: `browseAgents({ q: 'bot' })` → `findMany` called with `where` containing `OR: [{ displayName: { contains: 'bot', mode: 'insensitive' } }, { bio: { contains: 'bot', mode: 'insensitive' } }]`", async () => {
    vi.mocked(prisma.agentProfile.findMany).mockResolvedValue([])

    await browseAgents({ q: 'bot' })

    expect(prisma.agentProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { displayName: { contains: 'bot', mode: 'insensitive' } },
            { bio: { contains: 'bot', mode: 'insensitive' } },
          ],
        }),
      })
    )
  })
})

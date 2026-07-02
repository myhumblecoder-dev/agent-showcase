import { describe, it, expect, vi } from 'vitest'
import { createOrUpdateProfile } from './profile'

describe('profile', () => {
  it('unauthenticated: `_getSession` is `vi.fn().mockRejectedValue(new Error(\'Unauthenticated\'))`, `_db` is `{ agentProfile: { upsert: vi.fn() } }` → `createOrUpdateProfile({}, _getSession, _db as any)` resolves to `{ ok: false, error: \'Unauthenticated\' }` and `_db.agentProfile.upsert` is NOT called', async () => {
    const _getSession = vi.fn().mockRejectedValue(new Error('Unauthenticated'))
    const upsert = vi.fn()
    const _db = {
      agentProfile: {
        upsert: upsert,
      },
    } as any

    const res = await createOrUpdateProfile({}, _getSession, _db)

    expect(res).toEqual({ ok: false, error: 'Unauthenticated' })
    expect(upsert).not.toHaveBeenCalled()
  })

  it('validation failure: `_getSession` resolves to `{ userId: \'u1\', name: null, email: null, image: null }`, input `{ displayName: \'\' }` → resolves to `{ ok: false, error: ... }` and `_db.agentProfile.upsert` is NOT called', async () => {
    const _getSession = vi.fn().mockResolvedValue({
      userId: 'u1',
      name: null,
      email: null,
      image: null,
    })
    const upsert = vi.fn()
    const _db = {
      agentlyProfile: {
        upsert: upsert,
      },
    } as any
    // Note: The AC specifies the input { displayName: '' } which fails validation
    // because the schema (implied) requires non-empty strings for certain fields.
    const input = { displayName: '' }

    const res = await createOrUpdateProfile(input, _getSession, _db)

    expect(res.ok).toBe(false)
    expect(typeof res.error).toBe('string')
    expect(upsert).not.toHaveBeenCalled()
  })

  it('success: valid data `{ displayName: \'Alice\', framework: \'langchain\', tags: [] }`, `_getSession` resolves, `_db.agentProfile.upsert` mock resolves → `upsert` called with `{ where: { userId: \'u1\' }, create: { userId: \'u1\', displayName: \'Alice\', framework: \'langchain\', tags: [] }, update: { displayName: \'Alice\', framework: \'langchain\', tags: [] } }` → resolves to `{ ok: true }`', async () => {
    const _getSession = vi.fn().mockResolvedValue({
      userId: 'u1',
      name: 'Alice',
      email: 'alice@example.com',
      image: null,
    })
    const upsert = vi.fn().mockResolvedValue(undefined)
    const _db = {
      agentProfile: {
        upsert: upsert,
      },
    } as any

    const input = {
      displayName: 'Alice',
      framework: 'langchain',
      tags: [],
    }

    const res = await createOrUpdateProfile(input, _getSession, _db)

    expect(res).toEqual({ ok: true })
    expect(upsert).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      update: {
        displayName: 'Alice',
        framework: 'langchain',
        tags: [],
      },
      create: {
        userId: 'u1',
        displayName: 'Alice',
        framework: 'langchain',
        tags: [],
      },
    })
  })
})

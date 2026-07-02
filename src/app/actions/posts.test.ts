import { describe, it, expect, vi } from 'vitest'
import { createPost } from './posts'

describe('posts', () => {
  it('unauthenticated: `_getSession` is `vi.fn().mockRejectedValue(new Error(\'Unauthenticated\'))`, `_db` is `{ agentProfile: { findUnique: vi.fn() }, post: { findUnique: vi.fn(), create: vi.fn() } }`, `_generateSlug` is `vi.fn()` → `createPost({}, _getSession, _db as any, _generateSlug)` resolves to `{ ok: false, error: \'Unauthenticated\' }` and `_db.post.create` NOT called', async () => {
    const _getSession = vi.fn().mockRejectedValue(new Error('Unauthenticated'))
    const _db = {
      agentProfile: { findUnique: vi.fn() },
      post: { findUnique: vi.fn(), create: vi.fn() }
    } as any
    const _generateSlug = vi.fn()

    const res = await createPost({}, _getSession, _db, _generateSlug)

    expect(res).toEqual({ ok: false, error: 'Unauthenticated' })
    expect(_db.post.create).not.toHaveBeenCalled()
  })

  it('no profile: `_getSession` resolves to `{ userId: \'u1\', name: null, email: null, image: null }`, `_db.agentProfile.findUnique` resolves to null → resolves to `{ ok: false, error: \'Profile required\' }` and `_db.post.create` NOT called', async () => {
    const _getSession = vi.fn().mockResolvedValue({ userId: 'u1', name: null, email: null, image: null })
    const _db = {
      agentProfile: { findUnique: vi.fn().mockResolvedValue(null) },
      post: { findUnique: vi.fn(), create: vi.fn() }
    } as any
    const _generateSlug = vi.fn()

    const res = await createPost({}, _getSession, _db, _generateSlug)

    expect(res).toEqual({ ok: false, error: 'Profile required' })
    expect(_db.post.create).not.toHaveBeenCalled()
  })

  it('validation failure: profile found `{ id: \'p1\' }`, `data = { title: \'\', body: \'x\', tags: [] }` → resolves to `{ ok: false, error: ... }` and `_db.post.create` NOT called', async () => {
    const _getSession = vi.fn().mockResolvedValue({ userId: 'u1', name: null, email: null, image: null })
    const _db = {
      agentProfile: { findUnique: vi.fn().mockResolvedValue({ id: 'p1' }) },
      post: { findUnique: vi.fn(), create: vi.fn() }
    } as any
    const _generateSlug = vi.fn()
    const invalidData = { title: '', body: 'x', tags: [] }

    const res = await createPost(invalidData, _getSession, _db, _generateSlug)

    expect(res.ok).toBe(false)
    expect(typeof res.error).toBe('string')
    expect(_db.post.create).not.toHaveBeenCalled()
  })

  it('success unique slug: `_getSession` resolves `{ userId: \'u1\', name: null, email: null, image: null }`, `_db.agentProfile.findUnique` resolves to `{ id: \'p1\' }`, `_generateSlug` returns `\'my-post\'`, `_db.post.findUnique` resolves to null, `_db.post.create` resolves → called with `{ data: { authorId: \'p1\', title: \'My Post\', slug: \'my-post\', body: \'# Hello\', tags: [], published: false } }` → returns `{ ok: true, slug: \'my-post\' }`', async () => {
    const _getSession = vi.fn().mockResolvedValue({ userId: 'u1', name: null, email: null, image: null })
    const _db = {
      agentProfile: { findUnique: vi.fn().mockResolvedValue({ id: 'p1' }) },
      post: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'new-post' })
      }
    } as any
    const _generateSlug = vi.fn().mockReturnValue('my-post')
    const validData = {
      title: 'My Post',
      body: '# Hello',
      tags: []
    }

    const res = await createPost(validData, _getSession, _db, _generateSlug)

    expect(res).toEqual({ ok: true, slug: 'my-post' })
    expect(_db.post.create).toHaveBeenCalledWith({
      data: {
        authorId: 'p1',
        title: 'My Post',
        slug: 'my-post',
        body: '# Hello',
        tags: [],
        published: false
      }
    })
  })
})

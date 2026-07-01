import { describe, it, expect, vi } from 'vitest'
import { getSession } from './auth'
import { auth } from '@/auth'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

describe('auth', () => {
  it("authenticated: `auth` mock returns `{ user: { id: 'u1', name: 'Alice', email: 'a@b.com', image: null } }` → `getSession()` resolves to `{ userId: 'u1', name: 'Alice', email: 'a@b.com', image: null }`", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: 'u1',
        name: 'Alice',
        email: 'a@b.com',
        image: null,
      },
    } as any)

    const session = await getSession()

    expect(session).toEqual({
      userId: 'u1',
      name: 'Alice',
      email: 'a@b.com',
      image: null,
    })
  })

  it("null session: `auth` mock returns `null` → `async getSession()` rejects with message matching `'Unauthenticated'`", async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    await expect(getSession()).rejects.toThrow('Unauthenticated')
  })

  it("missing id: `auth` mock returns `{ user: {} }` → `async getSession()` rejects with message matching `'Unauthenticated'`", async () => {
    vi.mocked(auth).mockResolvedValue({ user: {} } as any)

    await expect(getSession()).rejects.toThrow('Unauthenticated')
  })
})

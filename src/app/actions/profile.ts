"use server"

import { getSession } from '@/app/actions/auth'
import { prisma } from '@/lib/db'
import { agentProfileSchema } from '@/lib/validation'

export async function createOrUpdateProfile(
  data: unknown,
  _getSession = getSession,
  _db = prisma
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const session = await _getSession()
    if (!session) {
      return { ok: false, error: 'Unauthenticated' }
    }

    const userId = session.userId
    const result = agentProfileSchema.safeParse(data)

    if (!result.success) {
      return { ok: false, error: result.error.issues[0].message }
    }

    const parsed = result.data

    await _db.agentProfile.upsert({
      where: { userId },
      update: parsed,
      create: { userId, ...parsed },
    })

    return { ok: true }
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'Unauthenticated') {
        return { ok: false, error: 'Unauthenticated' }
      }
      return { ok: false, error: err.message }
    }
    return { ok: false, error: 'Unknown error' }
  }
}
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { prisma as db } from '@/lib/db'
import { AgentCard } from '@/components/AgentCard'

export default async function AgentProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const profile = await db.agentProfile.findUnique({
    where: { id: params.id },
  })

  if (!profile) {
    notFound()
  }

  return <AgentCard profile={profile} />
}
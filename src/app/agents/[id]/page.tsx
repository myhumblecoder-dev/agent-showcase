export const dynamic = 'force-dynamic'

import { prisma as db } from "@/lib/db"
import { AgentCard } from "@/components/AgentCard"
import { notFound } from "next/navigation"

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
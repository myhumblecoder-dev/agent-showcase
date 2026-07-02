export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { browseAgents } from '@/app/actions/browseAgents'
import BrowsePage from './BrowsePage'

export default async function BrowsePageServer() {
  const allProfiles = await prisma.agentProfile.findMany({
    select: {
      framework: true,
    },
  })

  const frameworks = [...new Set(allProfiles.map((p) => p.framework))].sort()

  const initialProfiles = await browseAgents()

  return (
    <main>
      <h1>Browse agents</h1>
      <BrowsePage initialProfiles={initialProfiles} frameworks={frameworks} />
    </main>
  )
}
"use client"

import { useState } from 'react'
import { browseAgents } from '@/app/actions/browseAgents'
import { AgentCard } from '@/components/AgentCard'
import BrowseFilters from '@/components/BrowseFilters'

interface Profile {
  id: string
  displayName: string
  bio: string | null
  framework: string
  tags: string[]
  githubUrl: string | null
  websiteUrl: string | null
  userId: string
}

interface BrowsePageProps {
  initialProfiles: Array<Profile>
  frameworks: string[]
}

export default function BrowsePage({ initialProfiles, frameworks }: BrowsePageProps) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)

  const handleFilter = async (opts: Parameters<typeof browseAgents>[0]) => {
    try {
      const results = await browseAgents(opts)
      setProfiles(results)
    } catch (err) {
      console.error("Failed to filter agents:", err)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <BrowseFilters frameworks={frameworks} onFilter={handleFilter} />

      {profiles.length === 0 ? (
        <p className="text-center text-muted-foreground mt-8">No agents found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => (
            <AgentCard key={p.id} profile={p} />
          ))}
        </div>
      )}
    </div>
  )
}
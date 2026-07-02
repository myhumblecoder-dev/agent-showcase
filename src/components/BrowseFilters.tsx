"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface BrowseFiltersProps {
  onFilter: (opts: { framework?: string; tags?: string[]; q?: string }) => void
  frameworks: string[]
}

export default function BrowseFilters({ onFilter, frameworks }: BrowseFiltersProps) {
  const [selectedFramework, setSelectedFramework] = useState<string>("")
  const [qInput, setQInput] = useState<string>("")
  const [tagsInput, setTagsInput] = useState<string>("")

  const handleFilter = () => {
    onFilter({
      framework: selectedFramework || undefined,
      tags: tagsInput.trim() ? tagsInput.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      q: qInput.trim() || undefined,
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-4 p-4">
      <select
        className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        aria-label="Framework"
        value={selectedFramework}
        onChange={(e) => setSelectedFramework(e.target.value)}
      >
        <option value="">All frameworks</option>
        {frameworks.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Search"
        aria-label="Search"
        className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        value={qInput}
        onChange={(e) => setQInput(e.target.value)}
      />

      <input
        type="text"
        placeholder="tag1, tag2"
        aria-label="Tags"
        className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
      />

      <Button onClick={handleFilter}>Filter</Button>
    </div>
  )
}
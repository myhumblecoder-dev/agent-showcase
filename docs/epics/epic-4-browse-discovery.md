# Epic 4 — Browse & Discovery

Filter and search agent profiles by framework, tags, and keyword query.

---

## Story 19 — Browse agents server action

**Depends on:** Story 24

**Files to create:**
- `src/app/actions/browseAgents.ts`
- `src/app/actions/browseAgents.test.ts`

**Acceptance Criteria:**
- `src/app/actions/browseAgents.ts` exports exactly one function: `async function browseAgents(opts?: { framework?: string; tags?: string[]; q?: string })`.
- Imports `prisma` from `'@/lib/db'`.
- Builds a `where` object starting as `{}`:
  - If `opts?.framework` is a non-empty string: add `framework: opts.framework`.
  - If `opts?.tags` has `length > 0`: add `tags: { hasSome: opts.tags }`.
  - If `opts?.q` is a non-empty string: add `OR: [{ displayName: { contains: opts.q, mode: 'insensitive' } }, { bio: { contains: opts.q, mode: 'insensitive' } }]`.
- Calls `prisma.agentProfile.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 })`.
- Returns the result array. Omit the return-type annotation; let TS infer.
- Implement `browseAgents` exactly once; do NOT emit alternate variants.
- `src/app/actions/browseAgents.test.ts` mocks `'@/lib/db'` with `vi.mock('@/lib/db')`.

**Testing:**
- Test no filters: `browseAgents()` → `prisma.agentProfile.findMany` called with object containing `{ where: {}, orderBy: { createdAt: 'desc' }, take: 50 }`.
- Test framework filter: `browseAgents({ framework: 'langchain' })` → `findMany` called with `where` containing `framework: 'langchain'`.
- Test tag filter: `browseAgents({ tags: ['llm'] })` → `findMany` called with `where` containing `tags: { hasSome: ['llm'] }`.
- Test keyword: `browseAgents({ q: 'bot' })` → `findMany` called with `where` containing `OR: [{ displayName: { contains: 'bot', mode: 'insensitive' } }, { bio: { contains: 'bot', mode: 'insensitive' } }]`.
- Write ONLY these four tests.

---

## Story 20 — BrowseFilters component

**Depends on:** Story 19

**Files to create:**
- `src/components/BrowseFilters.tsx`
- `src/components/BrowseFilters.test.tsx`

**Acceptance Criteria:**
- `BrowseFilters.tsx` is a `"use client"` component accepting props `{ onFilter: (opts: { framework?: string; tags?: string[]; q?: string }) => void; frameworks: string[] }`.
- Renders a `<select>` (aria-label "Framework") with first `<option value="">All frameworks</option>` followed by one `<option value={f}>{f}</option>` per framework in props.
- Renders a text `<input>` (placeholder "Search", aria-label "Search") for keyword.
- Renders a text `<input>` (placeholder "tag1, tag2", aria-label "Tags") for comma-separated tags.
- Renders a shadcn `Button` with text "Filter". On click calls `onFilter` with: `{ framework: selectedFramework || undefined, tags: tagsInput.trim() ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : undefined, q: qInput.trim() || undefined }`.
- `BrowseFilters.test.tsx` covers the cases below; `onFilter` is `vi.fn()`.

**Testing:**
- Test renders framework options: given `frameworks={['langchain', 'autogen']}`, `<option>` with text "langchain" and `<option>` with text "autogen" both appear.
- Test filter click no input: click "Filter" button → `onFilter` called with `{ framework: undefined, tags: undefined, q: undefined }`.
- Test filter with framework: use `userEvent.selectOptions` to select "langchain", click "Filter" → `onFilter` called with object containing `framework: 'langchain'`.
- Test filter with keyword: `userEvent.type` "bot" into Search input, click "Filter" → `onFilter` called with object containing `q: 'bot'`.
- Write ONLY these four tests.

---

## Story 29 — BrowsePage client component

**Depends on:** Story 20, Story 25

**Files to create:**
- `src/app/browse/BrowsePage.tsx`

**Acceptance Criteria:**
- `src/app/browse/BrowsePage.tsx` is a `"use client"` component (add `"use client"` directive at top).
- Accepts props: `{ initialProfiles: Array<{ id: string; displayName: string; bio: string | null; framework: string; tags: string[]; githubUrl: string | null; websiteUrl: string | null; userId: string }>; frameworks: string[] }`.
- Holds local state `const [profiles, setProfiles] = useState(initialProfiles)`.
- Renders `<BrowseFilters frameworks={frameworks} onFilter={handleFilter} />` where `handleFilter` is an async function that calls `browseAgents(opts)` (imported from `'@/app/actions/browseAgents'`) and calls `setProfiles(results)`.
- Renders a `<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">` of `<AgentCard profile={p} key={p.id} />` (imported from `'@/components/AgentCard'`) for each profile in state.
- If `profiles.length === 0`, renders `<p>No agents found.</p>` instead of the grid.

---

## Story 21 — Browse page

**Depends on:** Story 29

**Files to create:**
- `src/app/browse/page.tsx`

**Acceptance Criteria:**
- `src/app/browse/page.tsx` is a server component; exports `export const dynamic = 'force-dynamic'`.
- Imports `prisma` from `'@/lib/db'`, `browseAgents` from `'@/app/actions/browseAgents'`, `BrowsePage` from `'./BrowsePage'`.
- Fetches `const allProfiles = await prisma.agentProfile.findMany({ select: { framework: true } })`.
- Derives `const frameworks = [...new Set(allProfiles.map(p => p.framework))].sort()`.
- Fetches `const initialProfiles = await browseAgents()`.
- Renders `<main><h1>Browse agents</h1><BrowsePage initialProfiles={initialProfiles} frameworks={frameworks} /></main>`.

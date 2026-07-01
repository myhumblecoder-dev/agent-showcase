# Epic 4 — Browse & Discovery

Filter and search agent profiles by framework, tags, and keyword query.

---

## Story 19 — Browse agents server action

**Depends on:** Story 7

**Files to create:**
- `src/app/actions/browseAgents.ts`
- `src/app/actions/browseAgents.test.ts`

**Acceptance Criteria:**
- `src/app/actions/browseAgents.ts` exports exactly one function: `async function browseAgents(opts?: { framework?: string; tags?: string[]; q?: string })`.
- Builds a Prisma `where` object:
  - If `opts?.framework` is non-empty string: include `framework: opts.framework`.
  - If `opts?.tags` has length > 0: include `tags: { hasSome: opts.tags }`.
  - If `opts?.q` is non-empty string: include `OR: [{ displayName: { contains: opts.q, mode: 'insensitive' } }, { bio: { contains: opts.q, mode: 'insensitive' } }]`.
- Calls `prisma.agentProfile.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 })`.
- Returns the result array. Omit the return-type annotation; let TS infer.
- Implement `browseAgents` exactly once; do NOT emit alternate variants.
- `src/app/actions/browseAgents.test.ts` mocks `'@/lib/db'`.

**Testing:**
- Test no filters: `browseAgents()` → `prisma.agentProfile.findMany` called with `{ where: {}, orderBy: { createdAt: 'desc' }, take: 50 }`.
- Test framework filter: `browseAgents({ framework: 'langchain' })` → called with `where` containing `{ framework: 'langchain' }`.
- Test tag filter: `browseAgents({ tags: ['llm'] })` → called with `where` containing `{ tags: { hasSome: ['llm'] } }`.
- Test keyword: `browseAgents({ q: 'bot' })` → called with `where` containing `{ OR: [{ displayName: { contains: 'bot', mode: 'insensitive' } }, { bio: { contains: 'bot', mode: 'insensitive' } }] }`.
- Write ONLY these four tests.

---

## Story 20 — BrowseFilters component

**Depends on:** Story 19

**Files to create:**
- `src/components/BrowseFilters.tsx`
- `src/components/BrowseFilters.test.tsx`

**Acceptance Criteria:**
- `BrowseFilters.tsx` is a `"use client"` component accepting props `{ onFilter: (opts: { framework?: string; tags?: string[]; q?: string }) => void; frameworks: string[] }`.
- Renders a `<select>` of framework options (first option is `""` / "All frameworks") driven by `frameworks` prop.
- Renders a text `Input` with label "Search" for keyword.
- Renders a text `Input` with label "Tags" (comma-separated).
- Renders a shadcn `Button` "Filter" that on click calls `onFilter({ framework: selectedFramework || undefined, tags: tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : undefined, q: qInput || undefined })`.
- `BrowseFilters.test.tsx` covers the cases below; `onFilter` is `vi.fn()`.

**Testing:**
- Test renders framework options: given `frameworks={['langchain', 'autogen']}`, both appear as `<option>` elements.
- Test filter click no input: clicking "Filter" → `onFilter` called with `{}` (all fields undefined).
- Test filter with framework: select "langchain", click "Filter" → `onFilter` called with `{ framework: 'langchain' }` (other fields undefined).
- Test filter with keyword: type "bot" in search input, click "Filter" → `onFilter` called with `{ q: 'bot' }`.
- Write ONLY these four tests.

---

## Story 21 — Browse page

**Depends on:** Story 20

**Files to create:**
- `src/app/browse/page.tsx`
- `src/app/browse/BrowsePage.tsx`

**Acceptance Criteria:**
- `src/app/browse/page.tsx` is a server component; exports `export const dynamic = 'force-dynamic'`.
- Fetches `const allProfiles = await prisma.agentProfile.findMany({ select: { framework: true } })`.
- Derives `const frameworks = [...new Set(allProfiles.map(p => p.framework))].sort()`.
- Fetches `const initialProfiles = await browseAgents()` (imported from `'@/app/actions/browseAgents'`).
- Renders `<BrowsePage initialProfiles={initialProfiles} frameworks={frameworks} />`.
- `src/app/browse/BrowsePage.tsx` is a `"use client"` component accepting `{ initialProfiles: Awaited<ReturnType<typeof browseAgents>>; frameworks: string[] }`.
- Holds local state `profiles` initialized to `initialProfiles`.
- Renders `<BrowseFilters frameworks={frameworks} onFilter={async (opts) => { const results = await browseAgents(opts); setProfiles(results); }} />`.
- Renders a grid `<div className="grid ...">` of `<AgentCard profile={p} key={p.id} />` for current `profiles`.
- If `profiles` is empty, renders `<p>No agents found.</p>`.

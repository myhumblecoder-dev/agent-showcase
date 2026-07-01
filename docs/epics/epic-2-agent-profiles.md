# Epic 2 — Agent Profiles

CRUD for agent profiles: validation schema, server action, edit form, and profile view page.

---

## Story 6 — Validation schemas for profile and post

**Depends on:** (none)

**Files to create:**
- `src/lib/validation.ts`
- `src/lib/validation.test.ts`

**Acceptance Criteria:**
- `src/lib/validation.ts` exports `agentProfileSchema` and `postSchema` using Zod.
- `agentProfileSchema = z.object({ displayName: z.string().trim().min(1), bio: z.string().trim().optional(), framework: z.string().trim().min(1), tags: z.array(z.string().trim().min(1)).max(10), githubUrl: z.string().url().optional().or(z.literal('')), websiteUrl: z.string().url().optional().or(z.literal('')) })`.
- `postSchema = z.object({ title: z.string().trim().min(1), body: z.string().trim().min(1), tags: z.array(z.string().trim().min(1)).max(10) })`.
- Implement each schema exactly once; do NOT emit alternate variants.
- `src/lib/validation.test.ts` covers the cases below; uses `import { agentProfileSchema, postSchema } from './validation'`.

**Testing:**
- Test agentProfileSchema valid: `agentProfileSchema.parse({ displayName: 'Alice', framework: 'langchain', tags: [] })` does not throw.
- Test agentProfileSchema rejects empty displayName: `agentProfileSchema.safeParse({ displayName: '   ', framework: 'x', tags: [] })` returns `success: false`; `result.error.issues` is non-empty.
- Test agentProfileSchema rejects bad URL: `agentProfileSchema.safeParse({ displayName: 'A', framework: 'x', tags: [], githubUrl: 'not-a-url' })` returns `success: false`; `result.error.issues` is non-empty.
- Test postSchema valid: `postSchema.parse({ title: 'My post', body: '# Hello', tags: ['ai'] })` does not throw.
- Test postSchema rejects empty body: `postSchema.safeParse({ title: 'T', body: '  ', tags: [] })` returns `success: false`; `result.error.issues` is non-empty.
- Write ONLY these five tests.

---

## Story 24 — Create/update profile server action (simplified mocks)

**Depends on:** Story 6, Story 2

**Files to create:**
- `src/app/actions/profile.ts`
- `src/app/actions/profile.test.ts`

**Acceptance Criteria:**
- `src/app/actions/profile.ts` is a `"use server"` file exporting exactly one function: `async function createOrUpdateProfile(data: unknown): Promise<{ ok: true } | { ok: false; error: string }>`.
- Accepts two optional injected dependencies for testing: `_getSession` (defaults to `import { getSession } from '@/app/actions/auth'`) and `_db` (defaults to `import { prisma } from '@/lib/db'`). Function signature: `async function createOrUpdateProfile(data: unknown, _getSession = defaultGetSession, _db = prisma)`.
- Calls `await _getSession()`. If it throws, returns `{ ok: false, error: 'Unauthenticated' }`.
- Parses `data` with `agentProfileSchema.safeParse(data)` (imported from `'@/lib/validation'`). If invalid, returns `{ ok: false, error: result.error.issues[0].message }`.
- On success calls `_db.agentProfile.upsert({ where: { userId }, update: { ...parsed }, create: { userId, ...parsed } })`. Returns `{ ok: true }`.
- Implement `createOrUpdateProfile` exactly once; do NOT emit alternate variants or re-exports.
- `src/app/actions/profile.test.ts` uses injected deps — no `vi.mock` of modules; instead pass `vi.fn()` as `_getSession` and a typed mock object as `_db`.

**Testing:**
- Test unauthenticated: `_getSession` is `vi.fn().mockRejectedValue(new Error('Unauthenticated'))`, `_db` is `{ agentProfile: { upsert: vi.fn() } }` → `createOrUpdateProfile({}, _getSession, _db as any)` resolves to `{ ok: false, error: 'Unauthenticated' }` and `_db.agentProfile.upsert` is NOT called.
- Test validation failure: `_getSession` resolves to `{ userId: 'u1', name: null, email: null, image: null }`, input `{ displayName: '' }` → resolves to `{ ok: false, error: ... }` and `_db.agentProfile.upsert` is NOT called.
- Test success: valid data `{ displayName: 'Alice', framework: 'langchain', tags: [] }`, `_getSession` resolves, `_db.agentProfile.upsert` mock resolves → `upsert` called with `{ where: { userId: 'u1' }, create: { userId: 'u1', displayName: 'Alice', framework: 'langchain', tags: [] }, update: { displayName: 'Alice', framework: 'langchain', tags: [] } }` → resolves to `{ ok: true }`.
- Write ONLY these three tests.

---

## Story 8 — ProfileForm component

**Depends on:** Story 24

**Files to create:**
- `src/components/ProfileForm.tsx`
- `src/components/ProfileForm.test.tsx`

**Acceptance Criteria:**
- `ProfileForm.tsx` is a `"use client"` component accepting props `{ initialValues?: { displayName: string; bio?: string; framework: string; tags: string[]; githubUrl?: string; websiteUrl?: string }; onSave: (data: unknown) => Promise<{ ok: boolean; error?: string }> }`.
- Renders controlled inputs for displayName (label "Display name"), bio (label "Bio", textarea), framework (label "Framework"), tags (label "Tags", comma-separated text input), githubUrl (label "GitHub URL"), websiteUrl (label "Website URL").
- On submit calls `onSave({ displayName, bio, framework, tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean), githubUrl, websiteUrl })`.
- If result `ok` is false, displays error text in a `<p role="alert">`.
- If result `ok` is true, displays `<p>Saved!</p>`.
- Uses shadcn `Button`, `Input`, and `Textarea` for form controls.
- `ProfileForm.test.tsx` covers the cases below; `onSave` is a `vi.fn()` prop.

**Testing:**
- Test renders with no initial values: all inputs are empty strings (displayName input value is "").
- Test submit success: fill displayName input with "Alice", framework input with "langchain", click Submit → `onSave` called with object containing `displayName: 'Alice'` and `framework: 'langchain'` → mock returns `{ ok: true }` → text "Saved!" appears in the document.
- Test submit error: `onSave` mock returns `{ ok: false, error: 'Something went wrong' }` → text "Something went wrong" appears in `[role="alert"]`.
- Write ONLY these three tests.

---

## Story 9 — Profile edit page

**Depends on:** Story 8

**Files to create:**
- `src/app/profile/edit/page.tsx`

**Acceptance Criteria:**
- `src/app/profile/edit/page.tsx` is a server component; exports `export const dynamic = 'force-dynamic'`.
- Calls `const session = await auth()`. If `!session?.user?.id`, calls `redirect('/auth/sign-in')` from `'next/navigation'`.
- Fetches existing profile with `prisma.agentProfile.findUnique({ where: { userId: session.user.id } })`.
- Renders `<h1>Edit your profile</h1>` and `<ProfileForm initialValues={profile ?? undefined} onSave={createOrUpdateProfile} />` (imports `createOrUpdateProfile` from `'@/app/actions/profile'`).

---

## Story 25 — AgentCard component

**Depends on:** (none)

**Files to create:**
- `src/components/AgentCard.tsx`
- `src/components/AgentCard.test.tsx`

**Acceptance Criteria:**
- `AgentCard.tsx` is a server component accepting `{ profile: { displayName: string; bio?: string | null; framework: string; tags: string[]; githubUrl?: string | null; websiteUrl?: string | null } }`.
- Renders a shadcn `Card` displaying: `<h2>{profile.displayName}</h2>`, `<p>{profile.bio}</p>` (when bio is truthy), a `<span>` badge with framework text, and one `<span>` badge per tag.
- When `githubUrl` is truthy, renders an `<a href={githubUrl}>GitHub</a>` link.
- When `websiteUrl` is truthy, renders an `<a href={websiteUrl}>Website</a>` link.
- `AgentCard.test.tsx` covers the cases below.

**Testing:**
- Test renders displayName: given `{ profile: { displayName: 'Alice', framework: 'langchain', tags: ['llm'] } }`, text "Alice" appears in the document.
- Test renders framework badge: text "langchain" appears in the document.
- Test renders tags: text "llm" appears in the document.
- Write ONLY these three tests.

---

## Story 10 — Profile view page

**Depends on:** Story 9, Story 25

**Files to create:**
- `src/app/profile/page.tsx`

**Acceptance Criteria:**
- `src/app/profile/page.tsx` is a server component; exports `export const dynamic = 'force-dynamic'`.
- Calls `const session = await auth()`. If no session, calls `redirect('/auth/sign-in')`.
- Fetches `prisma.agentProfile.findUnique({ where: { userId: session.user.id }, include: { posts: { where: { published: true }, orderBy: { createdAt: 'desc' } } } })`.
- If no profile, renders `<p>Set up your profile</p>` with a link `<a href="/profile/edit">Set up your profile</a>`.
- If profile found, renders `<AgentCard profile={profile} />` (imported from `'@/components/AgentCard'`) followed by an `<ul>` of post titles: `<li key={post.id}>{post.title}</li>`.

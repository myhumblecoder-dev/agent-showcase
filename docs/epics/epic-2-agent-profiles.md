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
- Test agentProfileSchema valid: `{ displayName: 'Alice', framework: 'langchain', tags: [] }` parses without error.
- Test agentProfileSchema rejects empty displayName: `{ displayName: '   ', framework: 'x', tags: [] }` throws; `err.issues` contains an issue for `displayName`.
- Test agentProfileSchema rejects bad URL: `{ displayName: 'A', framework: 'x', tags: [], githubUrl: 'not-a-url' }` throws; `err.issues` contains an issue for `githubUrl`.
- Test postSchema valid: `{ title: 'My post', body: '# Hello', tags: ['ai'] }` parses without error.
- Test postSchema rejects empty body: `{ title: 'T', body: '  ', tags: [] }` throws; `err.issues` contains an issue for `body`.
- Write ONLY these five tests.

---

## Story 7 — Create/update profile server action

**Depends on:** Story 6

**Files to create:**
- `src/app/actions/profile.ts`
- `src/app/actions/profile.test.ts`

**Acceptance Criteria:**
- `src/app/actions/profile.ts` is a `"use server"` file exporting exactly one function: `async function createOrUpdateProfile(data: unknown): Promise<{ ok: true } | { ok: false; error: string }>`.
- Calls `await getSession()` (imported from `'@/app/actions/auth'`). If it throws (unauthenticated), returns `{ ok: false, error: 'Unauthenticated' }`.
- Parses `data` with `agentProfileSchema.safeParse(data)` (imported from `'@/lib/validation'`). If invalid, returns `{ ok: false, error: result.error.issues[0].message }`.
- On success calls `prisma.agentProfile.upsert({ where: { userId }, update: { ...parsed }, create: { userId, ...parsed } })` (imported `prisma` from `'@/lib/db'`). Returns `{ ok: true }`.
- Implement `createOrUpdateProfile` exactly once; do NOT emit alternate variants or re-exports.
- `src/app/actions/profile.test.ts` mocks `'@/lib/db'` and `'@/app/actions/auth'`.

**Testing:**
- Test unauthenticated: `getSession` throws → returns `{ ok: false, error: 'Unauthenticated' }` and `prisma.agentProfile.upsert` is NOT called.
- Test validation failure: `getSession` resolves to `{ userId: 'u1', name: null, email: null, image: null }`, input `{ displayName: '' }` → returns `{ ok: false, error: ... }` and `prisma.agentProfile.upsert` is NOT called.
- Test success: valid data `{ displayName: 'Alice', framework: 'langchain', tags: [] }`, `getSession` resolves → `prisma.agentProfile.upsert` called with `{ where: { userId: 'u1' }, create: { userId: 'u1', displayName: 'Alice', framework: 'langchain', tags: [] }, update: { displayName: 'Alice', framework: 'langchain', tags: [] } }` → returns `{ ok: true }`.
- Write ONLY these three tests.

---

## Story 8 — ProfileForm component

**Depends on:** Story 7

**Files to create:**
- `src/components/ProfileForm.tsx`
- `src/components/ProfileForm.test.tsx`

**Acceptance Criteria:**
- `ProfileForm.tsx` is a `"use client"` component accepting props `{ initialValues?: { displayName: string; bio?: string; framework: string; tags: string[]; githubUrl?: string; websiteUrl?: string }; onSave: (data: unknown) => Promise<{ ok: boolean; error?: string }> }`.
- Renders controlled inputs for displayName, bio, framework, tags (comma-separated), githubUrl, websiteUrl.
- On submit calls `onSave({ displayName, bio, framework, tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean), githubUrl, websiteUrl })` and displays an error message if `result.ok` is false, or a "Saved!" message if true.
- Uses shadcn `Button`, `Input`, and `Textarea` for form controls.
- `ProfileForm.test.tsx` covers the cases below; `onSave` is a `vi.fn()` prop.

**Testing:**
- Test renders with no initial values: all inputs are empty strings.
- Test submit success: fills displayName "Alice", framework "langchain", calls `onSave` → mock returns `{ ok: true }` → "Saved!" text appears.
- Test submit error: `onSave` mock returns `{ ok: false, error: 'Something went wrong' }` → error text "Something went wrong" appears.
- Write ONLY these three tests.

---

## Story 9 — Profile edit page

**Depends on:** Story 8

**Files to create:**
- `src/app/profile/edit/page.tsx`

**Acceptance Criteria:**
- `src/app/profile/edit/page.tsx` is a server component; exports `export const dynamic = 'force-dynamic'`.
- Calls `const session = await auth()`. If `!session?.user?.id`, redirects to `'/auth/sign-in'` using Next.js `redirect`.
- Fetches existing profile with `prisma.agentProfile.findUnique({ where: { userId: session.user.id } })`.
- Renders `<ProfileForm initialValues={profile ?? undefined} onSave={createOrUpdateProfile} />` (imports `createOrUpdateProfile` from `'@/app/actions/profile'`).
- Page title is `<h1>Edit your profile</h1>`.

---

## Story 10 — Profile view page and AgentCard

**Depends on:** Story 9

**Files to create:**
- `src/app/profile/page.tsx`
- `src/components/AgentCard.tsx`
- `src/components/AgentCard.test.tsx`

**Acceptance Criteria:**
- `src/app/profile/page.tsx` is a server component; exports `export const dynamic = 'force-dynamic'`.
- Calls `const session = await auth()`. If no session, redirects to `'/auth/sign-in'`.
- Fetches `prisma.agentProfile.findUnique({ where: { userId: session.user.id }, include: { posts: { where: { published: true }, orderBy: { createdAt: 'desc' } } } })`.
- If no profile found, renders a prompt linking to `/profile/edit` with text "Set up your profile".
- If profile found, renders `<AgentCard profile={profile} />` followed by a list of post titles.
- `AgentCard.tsx` is a server component accepting `{ profile: { displayName: string; bio?: string | null; framework: string; tags: string[]; githubUrl?: string | null; websiteUrl?: string | null } }`.
- Renders a shadcn `Card` displaying `displayName`, `bio`, `framework` badge, and tag badges.
- `AgentCard.test.tsx` covers the cases below.

**Testing:**
- Test renders displayName: given `{ displayName: 'Alice', framework: 'langchain', tags: ['llm'] }`, "Alice" appears in the document.
- Test renders framework badge: "langchain" badge text appears.
- Test renders tags: "llm" badge appears.
- Write ONLY these three tests.

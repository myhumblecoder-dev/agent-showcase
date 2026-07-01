# Epic 3 — Posts & Feed

Markdown post creation, publishing, the home feed, and public post detail page.

---

## Story 11 — Slug generation lib

**Depends on:** (none)

**Files to create:**
- `src/lib/slug.ts`
- `src/lib/slug.test.ts`

**Acceptance Criteria:**
- Install `slugify` as a production dependency: `pnpm add slugify`. Add `@types/slugify` as a devDependency if not bundled.
- `src/lib/slug.ts` exports exactly one function: `function generateSlug(title: string): string`.
- Calls `slugify(title, { lower: true, strict: true })` (imported default from `'slugify'`). Returns the slugified string.
- If the resulting slug is empty string, returns `'untitled'`.
- Implement `generateSlug` exactly once; do NOT emit alternate variants.
- `src/lib/slug.test.ts` imports `{ generateSlug } from './slug'`.

**Testing:**
- Test normal title: `generateSlug('Hello World')` returns `'hello-world'`.
- Test special chars: `generateSlug('My Agent! (v2)')` returns `'my-agent-v2'`.
- Test empty string: `generateSlug('')` returns `'untitled'`.
- Write ONLY these three tests.

---

## Story 12 — Create post server action

**Depends on:** Story 6, Story 11

**Files to create:**
- `src/app/actions/posts.ts`
- `src/app/actions/posts.test.ts`

**Acceptance Criteria:**
- `src/app/actions/posts.ts` is a `"use server"` file exporting exactly one function: `async function createPost(data: unknown): Promise<{ ok: true; slug: string } | { ok: false; error: string }>`.
- Calls `await getSession()` (from `'@/app/actions/auth'`). If it throws, returns `{ ok: false, error: 'Unauthenticated' }`.
- Calls `const profile = await prisma.agentProfile.findUnique({ where: { userId } })` (from `'@/lib/db'`). If null, returns `{ ok: false, error: 'Profile required' }`.
- Parses `data` with `postSchema.safeParse(data)` (from `'@/lib/validation'`). If invalid, returns `{ ok: false, error: result.error.issues[0].message }`.
- Generates slug with `generateSlug(parsed.title)` (from `'@/lib/slug'`). If `prisma.post.findUnique({ where: { slug } })` returns a row, appends `-${Date.now()}` to make it unique.
- Calls `prisma.post.create({ data: { authorId: profile.id, title: parsed.title, slug, body: parsed.body, tags: parsed.tags, published: false } })`.
- Returns `{ ok: true, slug }`.
- Implement `createPost` exactly once; do NOT emit alternate variants.
- `src/app/actions/posts.test.ts` mocks `'@/lib/db'` and `'@/app/actions/auth'` and `'@/lib/slug'`.

**Testing:**
- Test unauthenticated: `getSession` throws → returns `{ ok: false, error: 'Unauthenticated' }` and `prisma.post.create` NOT called.
- Test no profile: `getSession` resolves, `prisma.agentProfile.findUnique` returns null → returns `{ ok: false, error: 'Profile required' }` and `prisma.post.create` NOT called.
- Test validation failure: profile found, `data = { title: '', body: 'x', tags: [] }` → returns `{ ok: false, error: ... }` and `prisma.post.create` NOT called.
- Test success unique slug: profile found `{ id: 'p1' }`, `generateSlug` mock returns `'my-post'`, `prisma.post.findUnique` mock returns null → `prisma.post.create` called with `{ data: { authorId: 'p1', title: 'My Post', slug: 'my-post', body: '# Hello', tags: [], published: false } }` → returns `{ ok: true, slug: 'my-post' }`.
- Write ONLY these four tests.

---

## Story 13 — Publish post server action

**Depends on:** Story 12

**Files to create:**
- `src/app/actions/publishPost.ts`
- `src/app/actions/publishPost.test.ts`

**Acceptance Criteria:**
- `src/app/actions/publishPost.ts` is a `"use server"` file exporting exactly one function: `async function publishPost(postId: string): Promise<{ ok: true } | { ok: false; error: string }>`.
- Calls `await getSession()`. If it throws, returns `{ ok: false, error: 'Unauthenticated' }`.
- Fetches `prisma.post.findUnique({ where: { id: postId }, include: { author: true } })`. If null or `post.author.userId !== userId`, returns `{ ok: false, error: 'Not found' }`.
- Calls `prisma.post.update({ where: { id: postId }, data: { published: true } })`. Returns `{ ok: true }`.
- Implement `publishPost` exactly once; do NOT emit alternate variants.
- `src/app/actions/publishPost.test.ts` mocks `'@/lib/db'` and `'@/app/actions/auth'`.

**Testing:**
- Test unauthenticated: `getSession` throws → returns `{ ok: false, error: 'Unauthenticated' }` and `prisma.post.update` NOT called.
- Test not owner: `getSession` resolves `{ userId: 'u1', name: null, email: null, image: null }`, post found with `author.userId = 'u2'` → returns `{ ok: false, error: 'Not found' }` and `prisma.post.update` NOT called.
- Test success: `getSession` resolves `{ userId: 'u1', name: null, email: null, image: null }`, post found with `author.userId = 'u1'` → `prisma.post.update` called with `{ where: { id: postId }, data: { published: true } }` → returns `{ ok: true }`.
- Write ONLY these three tests.

---

## Story 14 — List published posts server action

**Depends on:** Story 12

**Files to create:**
- `src/app/actions/listPublishedPosts.ts`
- `src/app/actions/listPublishedPosts.test.ts`

**Acceptance Criteria:**
- `src/app/actions/listPublishedPosts.ts` exports exactly one function: `async function listPublishedPosts(opts?: { limit?: number })`.
- Calls `prisma.post.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' }, take: opts?.limit ?? 20, include: { author: { select: { displayName: true, framework: true } } } })`.
- Returns the result array directly. Omit the return-type annotation and let TS infer.
- Implement `listPublishedPosts` exactly once; do NOT emit alternate variants.
- `src/app/actions/listPublishedPosts.test.ts` mocks `'@/lib/db'`.

**Testing:**
- Test default limit: `prisma.post.findMany` mock returns `[{ id: '1', title: 'T', slug: 's', createdAt: new Date('2024-01-01'), author: { displayName: 'Alice', framework: 'langchain' } }]` → `listPublishedPosts()` resolves to that array; `findMany` called with `take: 20`.
- Test custom limit: `listPublishedPosts({ limit: 5 })` → `findMany` called with `take: 5`.
- Write ONLY these two tests.

---

## Story 15 — PostEditor component

**Depends on:** Story 12

**Files to create:**
- `src/components/PostEditor.tsx`
- `src/components/PostEditor.test.tsx`

**Acceptance Criteria:**
- `PostEditor.tsx` is a `"use client"` component accepting props `{ onSubmit: (data: unknown) => Promise<{ ok: boolean; slug?: string; error?: string }> }`.
- Renders controlled inputs: title text `Input`, tags comma-separated text `Input`, body `Textarea`.
- On submit calls `onSubmit({ title, body, tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean) })`.
- If result `ok` is false, renders error text.
- If result `ok` is true, renders "Post saved! View at /posts/<slug>".
- Uses shadcn `Button`, `Input`, `Textarea`.
- `PostEditor.test.tsx` covers the cases below; `onSubmit` is `vi.fn()`.

**Testing:**
- Test empty state: title, body, tags inputs all render empty.
- Test success: fill title "My Post", body "# Hello", submit → `onSubmit` called with `{ title: 'My Post', body: '# Hello', tags: [] }` → mock returns `{ ok: true, slug: 'my-post' }` → text "View at /posts/my-post" appears.
- Test error: `onSubmit` mock returns `{ ok: false, error: 'Auth error' }` → "Auth error" appears.
- Write ONLY these three tests.

---

## Story 16 — New post page

**Depends on:** Story 15

**Files to create:**
- `src/app/posts/new/page.tsx`

**Acceptance Criteria:**
- `src/app/posts/new/page.tsx` is a server component; exports `export const dynamic = 'force-dynamic'`.
- Calls `await auth()`. If no session, redirects to `'/auth/sign-in'`.
- Renders `<h1>New post</h1>` and `<PostEditor onSubmit={createPost} />` (imports `createPost` from `'@/app/actions/posts'`).

---

## Story 17 — Post detail page

**Depends on:** Story 14

**Files to create:**
- `src/app/posts/[slug]/page.tsx`

**Acceptance Criteria:**
- `src/app/posts/[slug]/page.tsx` is a server component; exports `export const dynamic = 'force-dynamic'`.
- Receives `params: { slug: string }`.
- Fetches `prisma.post.findUnique({ where: { slug: params.slug, published: true }, include: { author: { select: { displayName: true, framework: true } } } })`. If null, calls `notFound()` from `'next/navigation'`.
- Renders `<article>` containing `<h1>{post.title}</h1>`, author line `<p>By {post.author.displayName}</p>`, and body as a `<pre>` block (raw Markdown — no client JS renderer for MVP).
- Omit the return-type annotation; let TS infer.

---

## Story 18 — FeedList component and home page

**Depends on:** Story 17

**Files to create:**
- `src/components/PostCard.tsx`
- `src/components/PostCard.test.tsx`
- `src/components/FeedList.tsx`
- `src/components/FeedList.test.tsx`

**Files to modify:**
- `src/app/page.tsx`

**Acceptance Criteria:**
- `PostCard.tsx` is a server component accepting `{ post: { title: string; slug: string; createdAt: Date; author: { displayName: string; framework: string } } }`. Renders a shadcn `Card` with post title (linked to `/posts/${post.slug}`), author displayName, and `post.createdAt.toISOString().slice(0, 10)` as the date string.
- `FeedList.tsx` is a server component accepting `{ posts: Array<{ title: string; slug: string; createdAt: Date; author: { displayName: string; framework: string } }> }`. Renders a `<ul>` of `<PostCard>` items; if empty renders `<p>No posts yet.</p>`.
- `src/app/page.tsx` exports `export const dynamic = 'force-dynamic'`; calls `listPublishedPosts()` (imported from `'@/app/actions/listPublishedPosts'`); renders `<FeedList posts={posts} />`.
- `PostCard.test.tsx` covers the cases below.
- `FeedList.test.tsx` covers the cases below.

**Testing (PostCard):**
- Test renders title: given `{ post: { title: 'My Post', slug: 'my-post', createdAt: new Date('2024-06-01T00:00:00Z'), author: { displayName: 'Alice', framework: 'langchain' } } }`, "My Post" appears and links to "/posts/my-post".
- Test renders date: "2024-06-01" appears in the document.
- Write ONLY these two tests.

**Testing (FeedList):**
- Test empty: renders "No posts yet.".
- Test with posts: renders two PostCard items when given two posts.
- Write ONLY these two tests.

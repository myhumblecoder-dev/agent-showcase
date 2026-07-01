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

## Story 26 — Create post server action (dependency-injected)

**Depends on:** Story 6, Story 11, Story 2

**Files to create:**
- `src/app/actions/posts.ts`
- `src/app/actions/posts.test.ts`

**Acceptance Criteria:**
- `src/app/actions/posts.ts` is a `"use server"` file exporting exactly one function: `async function createPost(data: unknown, _getSession = defaultGetSession, _db = prisma, _generateSlug = generateSlug): Promise<{ ok: true; slug: string } | { ok: false; error: string }>`.
- Default imports: `defaultGetSession` from `'@/app/actions/auth'`, `prisma` from `'@/lib/db'`, `generateSlug` from `'@/lib/slug'`.
- Calls `await _getSession()`. If it throws, returns `{ ok: false, error: 'Unauthenticated' }`.
- Calls `const profile = await _db.agentProfile.findUnique({ where: { userId } })`. If null, returns `{ ok: false, error: 'Profile required' }`.
- Parses `data` with `postSchema.safeParse(data)` (imported from `'@/lib/validation'`). If invalid, returns `{ ok: false, error: result.error.issues[0].message }`.
- Generates slug: `let slug = _generateSlug(parsed.title)`. If `await _db.post.findUnique({ where: { slug } })` returns a row, sets `slug = slug + '-' + Date.now()`.
- Calls `await _db.post.create({ data: { authorId: profile.id, title: parsed.title, slug, body: parsed.body, tags: parsed.tags, published: false } })`.
- Returns `{ ok: true, slug }`.
- Implement `createPost` exactly once; do NOT emit alternate variants.
- `src/app/actions/posts.test.ts` passes `vi.fn()` injected deps directly — no `vi.mock`.

**Testing:**
- Test unauthenticated: `_getSession` is `vi.fn().mockRejectedValue(new Error('Unauthenticated'))`, `_db` is `{ agentProfile: { findUnique: vi.fn() }, post: { findUnique: vi.fn(), create: vi.fn() } }`, `_generateSlug` is `vi.fn()` → `createPost({}, _getSession, _db as any, _generateSlug)` resolves to `{ ok: false, error: 'Unauthenticated' }` and `_db.post.create` NOT called.
- Test no profile: `_getSession` resolves to `{ userId: 'u1', name: null, email: null, image: null }`, `_db.agentProfile.findUnique` resolves to null → resolves to `{ ok: false, error: 'Profile required' }` and `_db.post.create` NOT called.
- Test validation failure: profile found `{ id: 'p1' }`, `data = { title: '', body: 'x', tags: [] }` → resolves to `{ ok: false, error: ... }` and `_db.post.create` NOT called.
- Test success unique slug: `_getSession` resolves `{ userId: 'u1', name: null, email: null, image: null }`, `_db.agentProfile.findUnique` resolves to `{ id: 'p1' }`, `_generateSlug` returns `'my-post'`, `_db.post.findUnique` resolves to null, `_db.post.create` resolves → called with `{ data: { authorId: 'p1', title: 'My Post', slug: 'my-post', body: '# Hello', tags: [], published: false } }` → returns `{ ok: true, slug: 'my-post' }`.
- Write ONLY these four tests.

---

## Story 27 — Publish post server action (dependency-injected)

**Depends on:** Story 26, Story 2

**Files to create:**
- `src/app/actions/publishPost.ts`
- `src/app/actions/publishPost.test.ts`

**Acceptance Criteria:**
- `src/app/actions/publishPost.ts` is a `"use server"` file exporting exactly one function: `async function publishPost(postId: string, _getSession = defaultGetSession, _db = prisma): Promise<{ ok: true } | { ok: false; error: string }>`.
- Default imports: `defaultGetSession` from `'@/app/actions/auth'`, `prisma` from `'@/lib/db'`.
- Calls `await _getSession()`. If it throws, returns `{ ok: false, error: 'Unauthenticated' }`.
- Fetches `await _db.post.findUnique({ where: { id: postId }, include: { author: true } })`. If null or `post.author.userId !== userId`, returns `{ ok: false, error: 'Not found' }`.
- Calls `await _db.post.update({ where: { id: postId }, data: { published: true } })`. Returns `{ ok: true }`.
- Implement `publishPost` exactly once; do NOT emit alternate variants.
- `src/app/actions/publishPost.test.ts` uses injected deps — no `vi.mock`.

**Testing:**
- Test unauthenticated: `_getSession` is `vi.fn().mockRejectedValue(new Error('Unauthenticated'))`, `_db` is `{ post: { findUnique: vi.fn(), update: vi.fn() } }` → `publishPost('p1', _getSession, _db as any)` resolves to `{ ok: false, error: 'Unauthenticated' }` and `_db.post.update` NOT called.
- Test not owner: `_getSession` resolves to `{ userId: 'u1', name: null, email: null, image: null }`, `_db.post.findUnique` resolves to `{ id: 'p1', author: { userId: 'u2' } }` → resolves to `{ ok: false, error: 'Not found' }` and `_db.post.update` NOT called.
- Test success: `_getSession` resolves `{ userId: 'u1', name: null, email: null, image: null }`, `_db.post.findUnique` resolves to `{ id: 'p1', author: { userId: 'u1' } }`, `_db.post.update` resolves → called with `{ where: { id: 'p1' }, data: { published: true } }` → returns `{ ok: true }`.
- Write ONLY these three tests.

---

## Story 14 — List published posts server action

**Depends on:** Story 26

**Files to create:**
- `src/app/actions/listPublishedPosts.ts`
- `src/app/actions/listPublishedPosts.test.ts`

**Acceptance Criteria:**
- `src/app/actions/listPublishedPosts.ts` exports exactly one function: `async function listPublishedPosts(opts?: { limit?: number })`.
- Calls `prisma.post.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' }, take: opts?.limit ?? 20, include: { author: { select: { displayName: true, framework: true } } } })` (imports `prisma` from `'@/lib/db'`).
- Returns the result array directly. Omit the return-type annotation and let TS infer.
- Implement `listPublishedPosts` exactly once; do NOT emit alternate variants.
- `src/app/actions/listPublishedPosts.test.ts` mocks `'@/lib/db'` with `vi.mock('@/lib/db')`.

**Testing:**
- Test default limit: `prisma.post.findMany` mock resolves to `[{ id: '1', title: 'T', slug: 's', createdAt: new Date('2024-01-01'), author: { displayName: 'Alice', framework: 'langchain' } }]` → `listPublishedPosts()` resolves to that array and `findMany` was called with an object containing `take: 20`.
- Test custom limit: `listPublishedPosts({ limit: 5 })` → `findMany` called with an object containing `take: 5`.
- Write ONLY these two tests.

---

## Story 15 — PostEditor component

**Depends on:** Story 26

**Files to create:**
- `src/components/PostEditor.tsx`
- `src/components/PostEditor.test.tsx`

**Acceptance Criteria:**
- `PostEditor.tsx` is a `"use client"` component accepting props `{ onSubmit: (data: unknown) => Promise<{ ok: boolean; slug?: string; error?: string }> }`.
- Renders controlled inputs: title text `Input` (label "Title"), tags comma-separated text `Input` (label "Tags"), body `Textarea` (label "Body").
- On submit calls `onSubmit({ title, body, tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean) })`.
- If result `ok` is false, renders `<p role="alert">{result.error}</p>`.
- If result `ok` is true, renders `<p>Post saved! View at /posts/{slug}</p>` where `slug` is `result.slug`.
- Uses shadcn `Button`, `Input`, `Textarea`.
- `PostEditor.test.tsx` covers the cases below; `onSubmit` is `vi.fn()`.

**Testing:**
- Test empty state: title input value is `""`, body textarea value is `""`, tags input value is `""`.
- Test success: fill title input with "My Post", body textarea with "# Hello", click submit → `onSubmit` called with object containing `{ title: 'My Post', body: '# Hello', tags: [] }` → mock returns `{ ok: true, slug: 'my-post' }` → text "View at /posts/my-post" appears in the document.
- Test error: `onSubmit` mock returns `{ ok: false, error: 'Auth error' }` → text "Auth error" appears in `[role="alert"]`.
- Write ONLY these three tests.

---

## Story 16 — New post page

**Depends on:** Story 15, Story 26

**Files to create:**
- `src/app/posts/new/page.tsx`

**Acceptance Criteria:**
- `src/app/posts/new/page.tsx` is a server component; exports `export const dynamic = 'force-dynamic'`.
- Calls `await auth()`. If no session, calls `redirect('/auth/sign-in')`.
- Renders `<h1>New post</h1>` and `<PostEditor onSubmit={createPost} />` (imports `createPost` from `'@/app/actions/posts'`).

---

## Story 17 — Post detail page

**Depends on:** Story 14

**Files to create:**
- `src/app/posts/[slug]/page.tsx`

**Acceptance Criteria:**
- `src/app/posts/[slug]/page.tsx` is a server component; exports `export const dynamic = 'force-dynamic'`.
- Receives `params: Promise<{ slug: string }>` (Next.js 15 async params). Awaits it: `const { slug } = await params`.
- Fetches `prisma.post.findUnique({ where: { slug, published: true }, include: { author: { select: { displayName: true, framework: true } } } })`. If null, calls `notFound()` from `'next/navigation'`.
- Renders `<article>` containing `<h1>{post.title}</h1>`, `<p>By {post.author.displayName}</p>`, and `<pre>{post.body}</pre>`.
- Omit the return-type annotation; let TS infer.

---

## Story 28 — PostCard and FeedList components

**Depends on:** Story 17

**Files to create:**
- `src/components/PostCard.tsx`
- `src/components/PostCard.test.tsx`
- `src/components/FeedList.tsx`
- `src/components/FeedList.test.tsx`

**Acceptance Criteria:**
- `PostCard.tsx` is a server component accepting `{ post: { title: string; slug: string; createdAt: Date; author: { displayName: string; framework: string } } }`. Renders a shadcn `Card` with: `<a href={'/posts/' + post.slug}>{post.title}</a>`, `<span>{post.author.displayName}</span>`, and `<time>{post.createdAt.toISOString().slice(0, 10)}</time>`.
- `FeedList.tsx` is a server component accepting `{ posts: Array<{ title: string; slug: string; createdAt: Date; author: { displayName: string; framework: string } }> }`. If `posts.length === 0`, renders `<p>No posts yet.</p>`. Otherwise renders `<ul>{posts.map(p => <li key={p.id ?? p.slug}><PostCard post={p} /></li>)}</ul>`.
- `PostCard.test.tsx` covers the cases below.
- `FeedList.test.tsx` covers the cases below.

**Testing (PostCard):**
- Test renders title link: given `{ post: { title: 'My Post', slug: 'my-post', createdAt: new Date('2024-06-01T00:00:00Z'), author: { displayName: 'Alice', framework: 'langchain' } } }`, an `<a>` with text "My Post" and href "/posts/my-post" appears in the document.
- Test renders date: text "2024-06-01" appears in the document.
- Write ONLY these two tests.

**Testing (FeedList):**
- Test empty: given `{ posts: [] }`, text "No posts yet." appears.
- Test with posts: given two post objects, two elements with the respective post titles appear.
- Write ONLY these two tests.

---

## Story 18 — Home page wires feed

**Depends on:** Story 28, Story 14

**Files to modify:**
- `src/app/page.tsx`

**Acceptance Criteria:**
- `src/app/page.tsx` exports `export const dynamic = 'force-dynamic'`.
- Imports `listPublishedPosts` from `'@/app/actions/listPublishedPosts'` and `FeedList` from `'@/components/FeedList'`.
- Calls `const posts = await listPublishedPosts()` at the top of the default server component.
- Renders `<main><h1>Recent posts</h1><FeedList posts={posts} /></main>`.
- Replaces all existing placeholder content from the scaffold.

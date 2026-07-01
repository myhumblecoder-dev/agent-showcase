# Epic 1 — Auth & Accounts

Wire GitHub OAuth auth into the app using the provisioned Auth.js backbone. Stories cover: the Prisma schema additions, the nav bar with sign-in/out, the sign-in page, and a session-guard helper action.

---

## Story 1 — Extend Prisma schema with AgentProfile and Post models

**Depends on:** (none)

**Files to modify:**
- `prisma/schema.prisma`

**Acceptance Criteria:**
- `AgentProfile` model added with fields: `id String @id @default(cuid())`, `userId String @unique`, `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`, `displayName String`, `bio String? @db.Text`, `framework String`, `tags String[]`, `avatarUrl String?`, `githubUrl String?`, `websiteUrl String?`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`, `posts Post[]`, plus indexes `@@index([framework])`.
- `Post` model added with fields: `id String @id @default(cuid())`, `authorId String`, `author AgentProfile @relation(fields: [authorId], references: [id], onDelete: Cascade)`, `title String`, `slug String @unique`, `body String @db.Text`, `published Boolean @default(false)`, `tags String[]`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`, plus indexes `@@index([published, createdAt])` and `@@index([tags])`.
- Existing Auth.js adapter models (User, Account, Session, VerificationToken) are preserved unchanged.
- `User` model gains a `profile AgentProfile?` back-relation field.
- File compiles cleanly with `pnpm exec prisma validate`.

---

## Story 2 — Session guard helper action

**Depends on:** (none)

**Files to create:**
- `src/app/actions/auth.ts`
- `src/app/actions/auth.test.ts`

**Acceptance Criteria:**
- `src/app/actions/auth.ts` exports exactly one function: `async function getSession(): Promise<{ userId: string; name: string | null; email: string | null; image: string | null }>`.
- `getSession` calls `await auth()` (imported from `'@/auth'`) and returns `{ userId: session.user.id, name: session.user.name ?? null, email: session.user.email ?? null, image: session.user.image ?? null }`.
- If `auth()` returns null or `!session.user.id`, `getSession` throws `new Error('Unauthenticated')`.
- Implement `getSession` exactly once; do NOT emit an alternate variant or re-export.
- `src/app/actions/auth.test.ts` mocks `'@/auth'` (`vi.mock('@/auth')`) and covers the three cases below.

**Testing:**
- Test authenticated: `auth` mock returns `{ user: { id: 'u1', name: 'Alice', email: 'a@b.com', image: null } }` → `getSession()` resolves to `{ userId: 'u1', name: 'Alice', email: 'a@b.com', image: null }`.
- Test null session: `auth` mock returns `null` → `getSession()` rejects with message matching `'Unauthenticated'`.
- Test missing id: `auth` mock returns `{ user: {} }` → `getSession()` rejects with message matching `'Unauthenticated'`.
- Write ONLY these three tests.

---

## Story 22 — NavBar component (sign-in / sign-out UI)

**Depends on:** (none)

**Files to create:**
- `src/components/NavBar.tsx`
- `src/components/NavBar.test.tsx`

**Acceptance Criteria:**
- `NavBar.tsx` is a `"use client"` component accepting props `{ userImage?: string | null; userName?: string | null; isSignedIn: boolean; signIn: () => void; signOut: () => void }`.
- When `isSignedIn` is true, renders the user's avatar (`<img src={userImage}` with alt `{userName}` when `userImage` is truthy, else a `<span>` with first character of `userName` as initials) and a "Sign out" button that calls the `signOut` prop.
- When `isSignedIn` is false, renders a "Sign in with GitHub" button that calls the `signIn` prop.
- No auth imports — all auth state comes in through props.
- `NavBar.test.tsx` covers the cases below; `signIn`/`signOut` are `vi.fn()`.

**Testing:**
- Test signed-out state: given `isSignedIn={false}`, renders "Sign in with GitHub" button; "Sign out" is NOT in the document.
- Test signed-in with image: given `isSignedIn={true}`, `userImage="https://example.com/avatar.jpg"`, `userName="Alice"` → renders `<img>` with src `"https://example.com/avatar.jpg"`; "Sign in with GitHub" is NOT in the document.
- Test signed-in without image: given `isSignedIn={true}`, `userImage={null}`, `userName="Alice"` → renders span with text "A" (first char of userName); "Sign out" button is in the document.
- Write ONLY these three tests.

---

## Story 23 — Root layout wires NavBar with auth session

**Depends on:** Story 22

**Files to modify:**
- `src/app/layout.tsx`

**Acceptance Criteria:**
- `src/app/layout.tsx` imports `auth` and `signIn` and `signOut` from `'@/auth'` and `NavBar` from `'@/components/NavBar'`.
- Calls `const session = await auth()` at the top of the default export (server component).
- Derives `isSignedIn = !!session?.user`, `userImage = session?.user?.image ?? null`, `userName = session?.user?.name ?? null`.
- Wraps the `{children}` in a layout that includes `<NavBar isSignedIn={isSignedIn} userImage={userImage} userName={userName} signIn={async () => { "use server"; await signIn("github") }} signOut={async () => { "use server"; await signOut() }} />` before the main content area.
- Preserves the existing `<html lang="en">` / `<body>` / font structure from the scaffold.

---

## Story 4 — Sign-in page

**Depends on:** (none)

**Files to create:**
- `src/app/auth/sign-in/page.tsx`

**Acceptance Criteria:**
- `src/app/auth/sign-in/page.tsx` is a server component.
- Renders a centered card (shadcn `Card`) containing an `<h1>Sign in to agent-showcase</h1>` and a form with `action={async () => { "use server"; await signIn("github") }}` containing a shadcn `Button` with text "Continue with GitHub".
- Imports `signIn` from `'@/auth'`.
- No client-side JavaScript required (pure RSC form action).

---

## Story 5 — Update middleware matcher for app routes

**Depends on:** (none)

**Files to modify:**
- `src/middleware.ts`

**Acceptance Criteria:**
- The `config.matcher` in `src/middleware.ts` is updated so the protected prefix list is `['/profile', '/profile/:path*', '/posts/new', '/posts/new/:path*']` (replacing the default `/dashboard/*` placeholder).
- The `authorized` callback logic in `src/auth.ts` is NOT changed — only the middleware matcher array.
- File compiles with no TypeScript errors.

# PRD — agent-showcase

*Scope anchor. Keeps stories inside MVP. Light doc — the load is in architecture.md.*

---

## 1. Problem

Developers building AI agent projects have no shared place to publish what they've built, learn what frameworks others use, or discover interesting projects. `agent-showcase` is a public platform where devs log in with GitHub, set up an agent profile, write markdown posts about their work, and browse/search what others have built.

## 2. Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | Users authenticate via GitHub OAuth (no passwords) |
| FR-2 | A user can create/edit one **agent profile** with display name, bio, framework tag, tags, optional GitHub/website URLs |
| FR-3 | A user can write **posts** in Markdown with a title; posts have a generated slug and can be published/unpublished |
| FR-4 | A public **feed** on the home page shows recently published posts in reverse-chronological order |
| FR-5 | A **browse/search** page allows filtering agents by framework, tags, and keyword query |
| FR-6 | Published posts are publicly readable at `/posts/[slug]` |

## 3. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | Next.js 15 App Router + TypeScript; Auth.js (next-auth v5) for session management |
| NFR-2 | All mutations require an authenticated session; unauthenticated users can read the feed and browse |
| NFR-3 | Postgres via Prisma ^6; data model in `prisma/schema.prisma` |
| NFR-4 | CI gate: lint + build pass on every PR |

## 4. MVP Scope (In)

- GitHub OAuth sign-in / sign-out
- One agent profile per user (create / edit)
- Markdown post creation and publishing
- Public home feed (recent published posts)
- Browse agents by framework / tags / keyword
- Public post detail page

## 5. Out of Scope

- Password/email auth (GitHub only)
- Comments or reactions on posts
- Direct messaging between users
- Notifications / email alerts
- Payments or premium tiers
- Mobile native app
- Analytics dashboard

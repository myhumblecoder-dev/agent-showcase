# Agent Showcase

## Problem Statement

A showcase platform where developers publish their AI agent projects with auth, profiles, posts, and discovery

## Solution Statement

Platform for developers to publish, discover, and showcase AI agent projects with profiles and social features

Built with Next.js (App Router, TypeScript), Tailwind, Prisma + PostgreSQL, and Zod.

## Getting Started

### Prerequisites

- Node.js + [pnpm](https://pnpm.io)
- [Docker](https://www.docker.com) (for the local Postgres)

### Run it locally

```bash
cp .env.example .env     # DATABASE_URL points at the compose Postgres
docker compose up -d     # start Postgres on localhost:5432
pnpm install
pnpm prisma db push      # apply the Prisma schema
pnpm dev                 # http://localhost:3000
```

Tear down the database with `docker compose down` (add `-v` to wipe its data).

"use server"

import { prisma } from "@/lib/db"

type FeedPost = {
  id: string
  title: string
  slug: string
  tags: string[]
  createdAt: Date
  author: { displayName: string }
}

export async function listPublishedPosts(_db = prisma) {
  return _db.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      tags: true,
      createdAt: true,
      author: {
        select: {
          displayName: true
        }
      }
    }
  })
}
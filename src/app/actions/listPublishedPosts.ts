import { prisma } from '@/lib/db';

export async function listPublishedPosts(opts?: { limit?: number }) {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: opts?.limit ?? 20,
    include: {
      author: {
        select: {
          displayName: true,
          framework: true,
        },
      },
    },
  });
}
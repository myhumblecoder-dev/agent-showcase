export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { prisma as db } from '@/lib/db';

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await db.post.findUnique({
    where: { slug: params.slug },
    include: { author: true },
  });

  if (!post || !post.published) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
          {post.title}
        </h1>
        <div className="text-sm text-muted-foreground">
          By {post.author.displayName}
        </div>
      </header>
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="whitespace-pre-wrap text-lg leading-relaxed">
          {post.body}
        </p>
      </div>
    </article>
  );
}
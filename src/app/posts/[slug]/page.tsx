import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function PostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: {
      author: {
        select: {
          displayName: true,
          framework: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
        {post.title}
      </h1>
      <p className="text-muted-foreground mb-8">
        By {post.author.displayName}
      </p>
      <pre className="whitespace-pre-wrap font-sans text-foreground">
        {post.body}
      </pre>
    </article>
  );
}

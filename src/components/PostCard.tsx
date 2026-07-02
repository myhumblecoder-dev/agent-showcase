import Link from 'next/link';

interface PostCardProps {
  post: {
    title: string;
    slug: string;
    createdAt: Date;
    author: {
      displayName: string;
      framework: string;
    };
  };
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <h2 className="text-xl font-bold">
        <Link href={`/posts/${post.slug}`} className="hover:underline">
          {post.title}
        </Link>
      </h2>
      <div className="text-sm text-muted-foreground">
        <span>{post.author.displayName}</span>
        <span className="mx-2">•</span>
        <time dateTime={post.createdAt.toISOString()}>
          {post.createdAt.toISOString().slice(0, 10)}
        </time>
      </div>
    </div>
  );
}
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
    <div className="border rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-bold">
        <Link href={`/posts/${post.slug}`} className="hover:underline">
          {post.title}
        </Link>
      </h3>
      <div className="mt-2 text-sm text-muted-foreground">
        <span>{post.author.displayName}</span>
        <span className="mx-2">•</span>
        <time dateTime={post.createdAt.toISOString()}>
          {post.createdAt.toISOString().slice(0, 10)}
        </time>
      </div>
    </div>
  );
}
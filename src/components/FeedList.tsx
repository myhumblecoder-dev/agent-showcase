import PostCard from './PostCard';

interface FeedListProps {
  posts: Array<{
    id?: string;
    slug: string;
    title: string;
    createdAt: Date;
    author: {
      displayName: string;
      framework: string;
    };
  }>;
}

export default function FeedList({ posts }: FeedListProps) {
  if (posts.length === 0) {
    return <p>No posts yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {posts.map((p) => (
        <li key={p.id ?? p.slug}>
          <PostCard post={p} />
        </li>
      ))}
    </ul>
  );
}
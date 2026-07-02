import PostCard from './PostCard';

interface PostCardBase {
  title: string;
  slug: string;
  createdAt: Date;
  author: {
    displayName: string;
    framework: string;
  };
}

interface FeedListProps {
  posts: Array<PostCardBase & { id?: string }>;
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
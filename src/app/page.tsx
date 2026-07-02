export const dynamic = 'force-dynamic';

import { listPublishedPosts } from '@/app/actions/listPublishedPosts';
import FeedList from '@/components/FeedList';

export default async function Home() {
  const posts = await listPublishedPosts();

  return (
    <main>
      <h1>Recent posts</h1>
      <FeedList posts={posts} />
    </main>
  );
}
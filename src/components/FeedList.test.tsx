import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import FeedList from './FeedList'
import PostCard from './PostCard'

// Mock PostCard to isolate FeedList testing
vi.mock('./PostCard', () => ({
  default: ({ post }: any) => (
    <div data-testid="post-card">
      {post.title}
    </div>
  ),
}))

describe('FeedList', () => {
  before:
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders empty state', async () => {
    render(<FeedList posts={[]} />)
    expect(screen.getByText('No posts yet.')).toBeInTheDocument()
  })

  it('renders list of posts', async () => {
    const posts = [
      {
        title: 'Post 1',
        slug: 'post-1',
        createdAt: new Date('2024-01-01'),
        author: { displayName: 'A', framework: 'f' },
      },
      {
        title: 'Post 2',
        slug: 'post-2',
        createdAt: new Date('2024-01-02'),
        author: { displayName: 'B', framework: 'f' },
      },
    ]

    render(<FeedList posts={posts} />)

    expect(screen.getByText('Post 1')).toBeInTheDocument()
    expect(screen.getByText('Post 2')).toBeInTheDocument()
  })
})

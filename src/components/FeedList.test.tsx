import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import FeedList from './FeedList'
import PostCard from './PostCard'

// Mock PostCard to isolate FeedList testing
vi.mock('./PostCard', () => ({
  default: ({ post }: any) => <div>{post.title}</div>,
}))

describe('FeedList', () => {
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
        id: '1',
        title: 'Post One',
        slug: 'post-one',
        createdAt: new Date(),
        author: { displayName: 'User 1', framework: 'nextjs' },
      },
      {
        id: '2',
        title: 'Post Two',
        slug: 'post-two',
        createdAt: new Date(),
        author: { displayName: 'User 2', framework: 'react' },
      },
    ]

    render(<FeedList posts={posts} />)

    expect(screen.getByText('Post One')).toBeInTheDocument()
    expect(screen.getByText('Post Two')).toBeInTheDocument()
  })
})

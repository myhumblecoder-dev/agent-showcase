import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PostCard from './PostCard'

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('PostCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('PostCard renders', async () => {
    const post = {
      title: 'My Post',
      slug: 'my-post',
      createdAt: new Date('2024-06-01T00:00:00Z'),
      author: {
        displayName: 'Alice',
        framework: 'langchain',
      },
    }

    render(<PostCard post={post} />)

    const link = screen.getByRole('link', { name: 'My Post' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/posts/my-post')
    expect(screen.getByText('2024-06-01')).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PostEditor } from './PostEditor'

describe('PostEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders labelled fields', async () => {
    render(<PostEditor action={vi.fn()} />)
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Body')).toBeInTheDocument()
    expect(screen.getByLabelText('Tags (comma-separated)')).toBeInTheDocument()
  })

  it('submit calls action with parsed tags', async () => {
    const mockAction = vi.fn().mockResolvedValue({ ok: true, slug: 'my-post' })
    const user = userEvent.setup()
    render(<PostEditor action={mockAction} />)

    const titleInput = screen.getByLabelText('Title')
    const tagsInput = screen.getByLabelText('Tags (comma-separated)')
    const submitButton = screen.getByRole('button', { name: /create post/i })

    await user.clear(titleInput)
    await user.type(titleInput, 'My Post')
    await user.clear(tagsInput)
    await user.type(tagsInput, 'ai, web')
    await user.click(submitButton)

    expect(mockAction).toHaveBeenCalledTimes(1)
    expect(mockAction).toHaveBeenCalledWith({
      title: 'My Post',
      body: '',
      tags: ['ai', 'web'],
    })
  })
})

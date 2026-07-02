import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import NavBar from './NavBar'

describe('NavBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('signed-out state: given `isSignedIn={false}`, renders Sign in with GitHub button; Sign out is NOT in the document', async () => {
    const signIn = vi.fn()
    const signOut = vi.fn()
    render(<NavBar isSignedIn={false} signIn={signIn} signOut={signOut} />)

    expect(screen.getByRole('button', { name: 'Sign in with GitHub' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument()
  })

  it('signed-in with image: given `isSignedIn={true}`, `userImage=https://example.com/avatar.jpg`, `userName=Alice` → renders `<img>` with src `https://example.com/avatar.jpg`; Sign in with GitHub is NOT in the document', async () => {
    const signIn = vi.fn()
    const signOut = vi.fn()
    render(
      <NavBar
        isSignedIn={true}
        userImage="https://example.com/avatar.jpg"
        userName="Alice"
        signIn={signIn}
        signOut={signOut}
      />
    )

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    expect(img).toHaveAttribute('alt', 'Alice')
    expect(screen.queryByRole('button', { name: 'Sign in with GitHub' })).not.toBeInTheDocument()
  })

  it('signed-in without image: given `isSignedIn={true}`, `userImage={null}`, `userName=Alice` → renders span with text A (first char of userName); Sign out button is in the document', async () => {
    const signIn = vi.fn()
    const signOut = vi.fn()
    render(
      <NavBar
        isSignedIn={true}
        userImage={null}
        userName="Alice"
        signIn={signIn}
        signOut={signOut}
      />
    )

    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
  })
})

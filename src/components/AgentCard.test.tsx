import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AgentCard } from './AgentCard'

describe('AgentCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders displayName: given `{ profile: { displayName: \'Alice\', framework: \'langchain\', tags: [\'llm\'] } }`, text Alice appears in the document', async () => {
    const profile = { displayName: 'Alice', framework: 'langchain', tags: ['llm'] }
    render(<AgentCard profile={profile} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders framework badge: text langchain appears in the document', async () => {
    const profile = { displayName: 'Alice', framework: 'langchain', tags: ['llm'] }
    render(<AgentCard profile={profile} />)
    expect(screen.getByText('langchain')).toBeInTheDocument()
  })

  it('renders tags: text llm appears in the document', async () => {
    const profile = { displayName: 'Alice', framework: 'langchain', tags: ['llm'] }
    render(<AgentCard profile={profile} />)
    expect(screen.getByText('llm')).toBeInTheDocument()
  })
})

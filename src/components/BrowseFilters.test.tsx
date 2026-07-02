import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BrowseFilters from './BrowseFilters'

describe('BrowseFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders framework options: given `frameworks={[\'langchain\', \'autogen\']}`, `<option>` with text langchain and `<option>` with text autogen both appear', async () => {
    const onFilter = vi.fn()
    const frameworks = ['langchain', 'autogen']
    render(<BrowseFilters onFilter={onFilter} frameworks={frameworks} />)

    expect(screen.getByRole('option', { name: 'langchain' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'autogen' })).toBeInTheDocument()
  })

  it('filter click no input: click Filter button → `onFilter` called with `{ framework: undefined, tags: undefined, q: undefined }`', async () => {
    const onFilter = vi.fn()
    const user = userEvent.setup()
    render(<BrowseFilters onFilter={onFilter} frameworks={[]} />)

    await user.click(screen.getByRole('button', { name: 'Filter' }))

    expect(onFilter).toHaveBeenCalledWith({
      framework: undefined,
      tags: undefined,
      q: undefined,
    })
  })

  it('filter with framework: use `userEvent.selectOptions` to select langchain, click Filter → `onFilter` called with object containing `framework: \'langchain\'`', async () => {
    const onFilter = vi.fn()
    const user = userEvent.setup()
    render(<BrowseFilters onFilter={onFilter} frameworks={['langchain']} />)

    const select = screen.getByRole('combobox', { name: 'Framework' })
    await user.selectOptions(select, 'langchain')
    await user.click(screen.getByRole('button', { name: 'Filter' }))

    expect(onFilter).toHaveBeenCalledWith(expect.objectContaining({
      framework: 'langchain',
    }))
  })

  it('filter with keyword: `userEvent.type` bot into Search input, click Filter → `onFilter` called with object containing `q: \'bot\'`', async () => {
    const onFilter = vi.fn()
    const user = userEvent.setup()
    render(<BrowseFilters onFilter={onFilter} frameworks={[]} />)

    const searchInput = screen.getByRole('textbox', { name: 'Search' })
    await user.type(searchInput, 'bot')
    await user.click(screen.getByRole('button', { name: 'Filter' }))

    expect(onFilter).toHaveBeenCalledWith(expect.objectContaining({
      q: 'bot',
    }))
  })
}) 
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ProgramsPage from '../ProgramsPage'
import { apiClient } from '../../services/apiClient'

vi.mock('../../services/apiClient')

const mockProgramsPage1 = {
  data: [
    { id: 1, code: 'BSIT', name: 'BS Information Technology', description: null, status: 'ACTIVE', created_at: '', updated_at: '' },
    { id: 2, code: 'BSCS', name: 'BS Computer Science', description: null, status: 'ACTIVE', created_at: '', updated_at: '' },
  ],
  meta: { current_page: 1, from: 1, last_page: 1, links: [], path: '', per_page: 10, to: 2, total: 2 },
}

function renderProgramsPage() {
  return render(
    <MemoryRouter>
      <ProgramsPage />
    </MemoryRouter>
  )
}

describe('ProgramsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads and displays programs from the API', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockProgramsPage1 })

    renderProgramsPage()

    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('BSIT')).toBeInTheDocument()
    })
    expect(screen.getByText('BSCS')).toBeInTheDocument()
    expect(apiClient.get).toHaveBeenCalledWith(
      '/programs',
      expect.objectContaining({ params: expect.objectContaining({ sort: 'name', page: 1, per_page: 10 }) })
    )
  })

  it('shows an empty state when there are no programs', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { data: [], meta: { current_page: 1, from: null, last_page: 1, links: [], path: '', per_page: 10, to: null, total: 0 } },
    })

    renderProgramsPage()

    expect(await screen.findByText(/no programs found/i)).toBeInTheDocument()
  })

  it('re-fetches with the search filter when the user types', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockProgramsPage1 })

    renderProgramsPage()

    await waitFor(() => expect(screen.getByText('BSIT')).toBeInTheDocument())

    await user.type(screen.getByPlaceholderText(/search by name/i), 'IT')

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenLastCalledWith(
        '/programs',
        expect.objectContaining({ params: expect.objectContaining({ filter: { search: 'IT' } }) })
      )
    })
  })
})
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError } from 'axios'
import { ProgramForm } from '../../components/ProgramForm'

function makeValidationError(errors: Record<string, string[]>) {
  const error = new AxiosError('Validation failed')
  error.response = {
    status: 422,
    data: { success: false, message: 'Validation failed.', errors },
    statusText: 'Unprocessable Content',
    headers: {},
    config: {} as never,
  }
  return error
}

describe('ProgramForm', () => {
  it('maps a duplicate code error to the Code field', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValueOnce(
      makeValidationError({ code: ['The code has already been taken.'] })
    )

    render(<ProgramForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await user.type(screen.getByLabelText(/^code/i), 'BSIT')
    await user.type(screen.getByLabelText(/^name/i), 'BS Information Technology')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(await screen.findByText(/code has already been taken/i)).toBeInTheDocument()
    // The error should be scoped to the Code field, not shown as a general banner
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
  })

  it('shows a general error banner for a non-field-specific failure', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error('Network Error'))

    render(<ProgramForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await user.type(screen.getByLabelText(/^code/i), 'BSIT')
    await user.type(screen.getByLabelText(/^name/i), 'BS Information Technology')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument()
  })
})
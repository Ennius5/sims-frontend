import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import type { Program, ProgramFormData } from '../types/program'

interface ProgramFormProps {
  initialData?: Program
  onSubmit: (data: ProgramFormData) => Promise<void>
  onCancel: () => void
}

export function ProgramForm({ initialData, onSubmit, onCancel }: ProgramFormProps) {
  const [form, setForm] = useState<ProgramFormData>({
    code: initialData?.code ?? '',
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    status: initialData?.status ?? 'ACTIVE',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFieldErrors({})
    setGeneralError(null)
    setIsSubmitting(true)
    try {
      await onSubmit(form)
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 422) {
        setFieldErrors(err.response.data.errors ?? {})
      } else {
        setGeneralError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  function field(name: keyof ProgramFormData, label: string, required = true) {
    return (
      <div className="mb-4">
        <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          id={name}
          required={required}
          value={form[name]}
          onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        {fieldErrors[name] && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors[name][0]}</p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-base font-semibold text-gray-900">
        {initialData ? 'Edit Program' : 'New Program'}
      </h2>

      {generalError && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {generalError}
        </div>
      )}

      {field('code', 'Code')}
      {field('name', 'Name')}

      <div className="mb-4">
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          rows={3}
        />
        {fieldErrors.description && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.description[0]}</p>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700">Status</label>
        <select
          id="status"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProgramFormData['status'] }))}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
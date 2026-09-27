import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import type { AcademicTerm, AcademicTermFormData } from '../types/academicTerm'

interface AcademicTermFormProps {
  initialData?: AcademicTerm
  onSubmit: (data: AcademicTermFormData) => Promise<void>
  onCancel: () => void
}

const KNOWN_FIELDS = ['academic_year', 'semester', 'start_date', 'end_date', 'status']

export function AcademicTermForm({ initialData, onSubmit, onCancel }: AcademicTermFormProps) {
  const [form, setForm] = useState<AcademicTermFormData>({
    academic_year: initialData?.academic_year ?? '',
    semester: initialData?.semester ?? '1st',
    start_date: initialData?.start_date ?? '',
    end_date: initialData?.end_date ?? '',
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
        const errors = err.response.data.errors ?? {}
        setFieldErrors(errors)

        // Surface any error key we don't have a matching input for
        // (e.g. a cross-field rule keyed unexpectedly) as a general banner too.
        const unmatchedKeys = Object.keys(errors).filter((key) => !KNOWN_FIELDS.includes(key))
        if (unmatchedKeys.length > 0) {
          setGeneralError(unmatchedKeys.map((key) => errors[key][0]).join(' '))
        }
      } else {
        setGeneralError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-base font-semibold text-gray-900">
        {initialData ? 'Edit Academic Term' : 'New Academic Term'}
      </h2>

      {generalError && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {generalError}
        </div>
      )}

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Academic Year <span className="text-red-500">*</span>
        </label>
        <input
          required
          placeholder="2026-2027"
          value={form.academic_year}
          onChange={(e) => setForm((f) => ({ ...f, academic_year: e.target.value }))}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        {fieldErrors.academic_year && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.academic_year[0]}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Semester <span className="text-red-500">*</span>
        </label>
        <select
          value={form.semester}
          onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="1st">1st</option>
          <option value="2nd">2nd</option>
          <option value="Summer">Summer</option>
        </select>
        {fieldErrors.semester && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.semester[0]}</p>
        )}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={form.start_date}
            onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          {fieldErrors.start_date && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.start_date[0]}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={form.end_date}
            onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          {fieldErrors.end_date && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.end_date[0]}</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AcademicTermFormData['status'] }))}
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
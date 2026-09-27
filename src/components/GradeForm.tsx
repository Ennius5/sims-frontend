import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import type { Grade, GradeFormData } from '../types/grade'

interface GradeFormProps {
  enrollmentId: number
  studentLabel: string
  offeringLabel: string
  initialData?: Grade | null
  onSubmit: (data: GradeFormData) => Promise<void>
  onCancel: () => void
}

export function GradeForm({ enrollmentId, studentLabel, offeringLabel, initialData, onSubmit, onCancel }: GradeFormProps) {
  const [form, setForm] = useState<GradeFormData>({
    enrollment_id: enrollmentId,
    midterm_grade: initialData?.midterm_grade ?? '',
    final_grade: initialData?.final_grade ?? '',
    remarks: initialData?.remarks ?? '',
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
      } else if (isAxiosError(err) && err.response?.status === 403) {
        setGeneralError(err.response.data.message ?? 'You are not authorized to grade this enrollment.')
      } else {
        setGeneralError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-1 text-base font-semibold text-gray-900">
        {initialData ? 'Edit Grade' : 'Enter Grade'}
      </h2>
      <p className="mb-4 text-sm text-gray-500">{studentLabel} — {offeringLabel}</p>

      {generalError && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {generalError}
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Midterm Grade</label>
          <input
            type="number"
            step="0.01"
            min={1}
            max={5}
            value={form.midterm_grade}
            onChange={(e) => setForm((f) => ({ ...f, midterm_grade: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          {fieldErrors.midterm_grade && <p className="mt-1 text-sm text-red-600">{fieldErrors.midterm_grade[0]}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Final Grade</label>
          <input
            type="number"
            step="0.01"
            min={1}
            max={5}
            value={form.final_grade}
            onChange={(e) => setForm((f) => ({ ...f, final_grade: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          {fieldErrors.final_grade && <p className="mt-1 text-sm text-red-600">{fieldErrors.final_grade[0]}</p>}
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-gray-700">Remarks</label>
        <input
          value={form.remarks}
          onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
          placeholder="PASSED, FAILED, etc."
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        {fieldErrors.remarks && <p className="mt-1 text-sm text-red-600">{fieldErrors.remarks[0]}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? 'Saving…' : 'Save Grade'}
        </button>
      </div>
    </form>
  )
}
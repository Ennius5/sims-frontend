import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import type { Course, CourseFormData } from '../types/course'

interface CourseFormProps {
  initialData?: Course
  onSubmit: (data: CourseFormData) => Promise<void>
  onCancel: () => void
}

export function CourseForm({ initialData, onSubmit, onCancel }: CourseFormProps) {
  const [form, setForm] = useState<CourseFormData>({
    course_code: initialData?.course_code ?? '',
    course_title: initialData?.course_title ?? '',
    description: initialData?.description ?? '',
    units: initialData?.units ?? 3,
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

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-base font-semibold text-gray-900">
        {initialData ? 'Edit Course' : 'New Course'}
      </h2>

      {generalError && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {generalError}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="course_code" className="mb-1 block text-sm font-medium text-gray-700">
          Course Code <span className="text-red-500">*</span>
        </label>
        <input
          id="course_code"
          required
          value={form.course_code}
          onChange={(e) => setForm((f) => ({ ...f, course_code: e.target.value }))}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        {fieldErrors.course_code && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.course_code[0]}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="course_title" className="mb-1 block text-sm font-medium text-gray-700">
          Course Title <span className="text-red-500">*</span>
        </label>
        <input
          id = "course_title"
          required
          value={form.course_title}
          onChange={(e) => setForm((f) => ({ ...f, course_title: e.target.value }))}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        {fieldErrors.course_title && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.course_title[0]}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id = "description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          rows={3}
        />
        {fieldErrors.description && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.description[0]}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="units" className="mb-1 block text-sm font-medium text-gray-700">
          Units <span className="text-red-500">*</span>
        </label>
        <input
          id = "units" 
          type="number"
          min={1}
          max={10}
          required
          value={form.units}
          onChange={(e) => setForm((f) => ({ ...f, units: Number(e.target.value) }))}
          className="w-32 rounded border border-gray-300 px-3 py-2 text-sm"
        />
        {fieldErrors.units && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.units[0]}</p>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor= "status" className="mb-1 block text-sm font-medium text-gray-700">Status</label>
        <select
          id= "status"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CourseFormData['status'] }))}
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
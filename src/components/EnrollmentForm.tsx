import { useState, useEffect, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import type { EnrollmentCreateData } from '../types/enrollment'
import * as studentService from '../services/studentService'
import * as courseOfferingService from '../services/courseOfferingService'
import type { Student } from '../types/student'
import type { CourseOffering } from '../types/courseOffering'

interface EnrollmentFormProps {
  onSubmit: (data: EnrollmentCreateData) => Promise<void>
  onCancel: () => void
}

export function EnrollmentForm({ onSubmit, onCancel }: EnrollmentFormProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [offerings, setOfferings] = useState<CourseOffering[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)

  const [form, setForm] = useState<EnrollmentCreateData>({
    student_id: 0,
    course_offering_id: 0,
    enrollment_date: new Date().toISOString().slice(0, 10),
  })
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      studentService.listStudents({ status: 'ACTIVE', per_page: 100 }),
      courseOfferingService.listCourseOfferings({ status: 'OPEN', per_page: 100 }),
    ])
      .then(([studentRes, offeringRes]) => {
        setStudents(studentRes.data)
        setOfferings(offeringRes.data)
      })
      .finally(() => setIsLoadingOptions(false))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setGeneralError(null)
    setFieldErrors({})

    if (!form.student_id || !form.course_offering_id) {
      setGeneralError('Please select both a student and a course offering.')
      return
    }
    setIsSubmitting(true)
    try {
      await onSubmit(form)
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 422) {
        setFieldErrors(err.response.data.errors ?? {})
      } else if (isAxiosError(err) && err.response?.status === 409) {
        setGeneralError(err.response.data.message ?? 'This student is already enrolled in that offering.')
      } else {
        setGeneralError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingOptions) {
    return <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">Loading form options…</div>
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-base font-semibold text-gray-900">New Enrollment</h2>

      {generalError && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {generalError}
        </div>
      )}

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Student <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={form.student_id || ''}
          onChange={(e) => setForm((f) => ({ ...f, student_id: Number(e.target.value) }))}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="" disabled>Select a student…</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.student_number} — {s.last_name}, {s.first_name}</option>
          ))}
        </select>
        {fieldErrors.student_id && <p className="mt-1 text-sm text-red-600">{fieldErrors.student_id[0]}</p>}
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Course Offering <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={form.course_offering_id || ''}
          onChange={(e) => setForm((f) => ({ ...f, course_offering_id: Number(e.target.value) }))}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="" disabled>Select an offering…</option>
          {offerings.map((o) => (
            <option key={o.id} value={o.id}>{o.course.course_code} — Section {o.section} ({o.schedule})</option>
          ))}
        </select>
        {fieldErrors.course_offering_id && <p className="mt-1 text-sm text-red-600">{fieldErrors.course_offering_id[0]}</p>}
      </div>

      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Enrollment Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          required
          value={form.enrollment_date}
          onChange={(e) => setForm((f) => ({ ...f, enrollment_date: e.target.value }))}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        {fieldErrors.enrollment_date && <p className="mt-1 text-sm text-red-600">{fieldErrors.enrollment_date[0]}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? 'Enrolling…' : 'Enroll'}
        </button>
      </div>
    </form>
  )
}
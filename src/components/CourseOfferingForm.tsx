import { useState, useEffect, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import type { CourseOffering, CourseOfferingFormData } from '../types/courseOffering'
import * as courseService from '../services/courseService'
import * as academicTermService from '../services/academicTermService'
import type { Course } from '../types/course'
import type { AcademicTerm } from '../types/academicTerm'
import type { Instructor } from '../types/instructor'
import * as courseOfferingService from '../services/courseOfferingService'
import { SearchableSelect } from './SearchableSelect'

interface CourseOfferingFormProps {
  initialData?: CourseOffering
  onSubmit: (data: CourseOfferingFormData) => Promise<void>
  onCancel: () => void
}

export function CourseOfferingForm({ initialData, onSubmit, onCancel }: CourseOfferingFormProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [terms, setTerms] = useState<AcademicTerm[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])

  const [isLoadingOptions, setIsLoadingOptions] = useState(true)

  const [form, setForm] = useState<CourseOfferingFormData>({
    course_id: initialData?.course.id ?? 0,
    academic_term_id: initialData?.academic_term.id ?? 0,
    instructor_id: initialData?.instructor?.id ?? null,
    section: initialData?.section ?? '',
    schedule: initialData?.schedule ?? '',
    room: initialData?.room ?? '',
    capacity: initialData?.capacity ?? 40,
    status: initialData?.status ?? 'OPEN',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      courseService.listCourses({ status: 'ACTIVE', per_page: 100 }),
      academicTermService.listAcademicTerms({ status: 'ACTIVE', per_page: 100 }),
      courseOfferingService.listInstructors(),
    ])
      .then(([courseRes, termRes, instructorList]) => {
        setCourses(courseRes.data)
        setTerms(termRes.data)
        setInstructors(instructorList)
      })
      .finally(() => setIsLoadingOptions(false))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFieldErrors({})

    if (!form.course_id || !form.academic_term_id) {
      setGeneralError('Please select both a course and an academic term.')
      return
    }
    
    setGeneralError(null)
    setIsSubmitting(true)
    try {
      await onSubmit(form)
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 422) {
        setFieldErrors(err.response.data.errors ?? {})
      } else if (isAxiosError(err) && err.response?.status === 409) {
        setGeneralError(err.response.data.message ?? 'This offering conflicts with an existing one.')
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
      <h2 className="mb-4 text-base font-semibold text-gray-900">
        {initialData ? 'Edit Course Offering' : 'New Course Offering'}
      </h2>

      {generalError && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {generalError}
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Course <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            options={courses.map((c) => ({ id: c.id, label: `${c.course_code} — ${c.course_title}` }))}
            value={form.course_id ? String(form.course_id) : ''}
            onChange={(id) => setForm((f) => ({ ...f, course_id: id ? Number(id) : 0 }))}
            placeholder="Search course…"
          />
          {fieldErrors.course_id && <p className="mt-1 text-sm text-red-600">{fieldErrors.course_id[0]}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Academic Term <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            options={terms.map((t) => ({ id: t.id, label: `${t.academic_year} — ${t.semester}` }))}
            value={form.academic_term_id ? String(form.academic_term_id) : ''}
            onChange={(id) => setForm((f) => ({ ...f, academic_term_id: id ? Number(id) : 0 }))}
            placeholder="Search term…"
          />
          {fieldErrors.academic_term_id && <p className="mt-1 text-sm text-red-600">{fieldErrors.academic_term_id[0]}</p>}
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">Instructor</label>
        <SearchableSelect
          options={instructors.map((i) => ({ id: i.id, label: i.name }))}
          value={form.instructor_id ? String(form.instructor_id) : ''}
          onChange={(id) => setForm((f) => ({ ...f, instructor_id: id ? Number(id) : null }))}
          placeholder="Search instructor…"
        />
        {fieldErrors.instructor_id && <p className="mt-1 text-sm text-red-600">{fieldErrors.instructor_id[0]}</p>}
      </div>

      <div className="mb-4 grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Section <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={form.section}
            onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          {fieldErrors.section && <p className="mt-1 text-sm text-red-600">{fieldErrors.section[0]}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Room</label>
          <input
            value={form.room}
            onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          {fieldErrors.room && <p className="mt-1 text-sm text-red-600">{fieldErrors.room[0]}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Capacity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            required
            value={form.capacity}
            onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          {fieldErrors.capacity && <p className="mt-1 text-sm text-red-600">{fieldErrors.capacity[0]}</p>}
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">Schedule</label>
        <input
          placeholder="MWF 8:00-9:00"
          value={form.schedule}
          onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        {fieldErrors.schedule && <p className="mt-1 text-sm text-red-600">{fieldErrors.schedule[0]}</p>}
      </div>

      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CourseOfferingFormData['status'] }))}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
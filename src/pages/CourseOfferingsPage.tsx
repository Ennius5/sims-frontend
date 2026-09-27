import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import * as courseOfferingService from '../services/courseOfferingService'
import type { CourseOffering, CourseOfferingFormData } from '../types/courseOffering'
import { Pagination } from '../components/Pagination'
import { CourseOfferingForm } from '../components/CourseOfferingForm'
import { useAuth } from '../hooks/useAuth'
import { SearchableSelect } from '../components/SearchableSelect'
import * as courseService from '../services/courseService'
import * as academicTermService from '../services/academicTermService'


export default function CourseOfferingsPage() {
  const [offerings, setOfferings] = useState<CourseOffering[]>([])
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number; per_page: number } | null>(null)
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('section')
  const [courseId, setCourseId] = useState('')
  const [academicTermId, setAcademicTermId] = useState('')
  const [instructorId, setInstructorId] = useState('')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingOffering, setEditingOffering] = useState<CourseOffering | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const { user } = useAuth()
  const canManage = user?.roles.some((r) => ['administrator', 'registrar'].includes(r)) ?? false
  const canInstruct = user?.roles.some((r)=> ['instructor'].includes(r)) ?? false
  const [courseOptions, setCourseOptions] = useState<{ id: number; label: string }[]>([])
  const [termOptions, setTermOptions] = useState<{ id: number; label: string }[]>([])
  const [instructorOptions, setInstructorOptions] = useState<{ id: number; label: string }[]>([])

  const fetchOfferings = useCallback(async () => {
  setIsLoading(true)
  setError(null)
  try {
    const response = await courseOfferingService.listCourseOfferings({
      course_id: courseId ? Number(courseId) : undefined,
      academic_term_id: academicTermId ? Number(academicTermId) : undefined,
      instructor_id: instructorId ? Number(instructorId) : undefined,
      status: status || undefined,
      sort,
      page,
      per_page: 10,
    })
    setOfferings(response.data)
    setMeta(response.meta)
  } catch {
    setError('Unable to load course offerings. Please try again.')
  } finally {
    setIsLoading(false)
  }
}, [courseId, academicTermId, instructorId, status, sort, page])

useEffect(() => {
  fetchOfferings()
}, [fetchOfferings])

useEffect(() => {
  if (canManage) {
    Promise.all([
      courseService.listCourses({ per_page: 100 }),
      academicTermService.listAcademicTerms({ per_page: 100 }),
      courseOfferingService.listInstructors(),
    ]).then(([courseRes, termRes, instructorList]) => {
      setCourseOptions(courseRes.data.map((c) => ({ id: c.id, label: `${c.course_code} — ${c.course_title}` })))
      setTermOptions(termRes.data.map((t) => ({ id: t.id, label: `${t.academic_year} — ${t.semester}` })))
      setInstructorOptions(instructorList.map((i) => ({ id: i.id, label: i.name })))
    })
  } else {
    courseOfferingService.listDerivedFilterOptions().then((opts) => {
      setCourseOptions(opts.courses)
      setTermOptions(opts.terms)
      setInstructorOptions(opts.instructors)
    })
  }
}, [canManage])

  async function handleDelete(id: number) {
    if (!confirm('Delete this course offering? This cannot be undone.')) return
    try {
      await courseOfferingService.deleteCourseOffering(id)
      fetchOfferings()
    } catch {
      alert('Failed to delete course offering.')
    }
  }

  async function handleFormSubmit(data: CourseOfferingFormData) {
    if (editingOffering) {
      await courseOfferingService.updateCourseOffering(editingOffering.id, data)
    } else {
      await courseOfferingService.createCourseOffering(data)
    }
    setEditingOffering(null)
    setIsCreating(false)
    fetchOfferings()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Course Offerings</h1>
        {canManage && (
          <button onClick={() => setIsCreating(true)} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            New Offering
          </button>
        )}
      </div>

      <div className="mb-4 flex gap-3">
        <SearchableSelect options={courseOptions} value={courseId} onChange={(id) => { setPage(1); setCourseId(id) }} placeholder="Search course…" />
        <SearchableSelect options={termOptions} value={academicTermId} onChange={(id) => { setPage(1); setAcademicTermId(id) }} placeholder="Search term…" />
        <SearchableSelect options={instructorOptions} value={instructorId} onChange={(id) => { setPage(1); setInstructorId(id) }} placeholder="Search instructor…" />
        <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value) }} className="rounded border border-gray-300 px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded border border-gray-300 px-3 py-2 text-sm">
          <option value="section">Section (A–Z)</option>
          <option value="-created_at">Newest first</option>
        </select>
      </div>

      {isCreating || editingOffering ? (
        <CourseOfferingForm
          initialData={editingOffering ?? undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => { setIsCreating(false); setEditingOffering(null) }}
        />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white">
          {isLoading ? (
            <p className="p-6 text-sm text-gray-500">Loading…</p>
          ) : error ? (
            <p className="p-6 text-sm text-red-600">{error}</p>
          ) : offerings.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No course offerings found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="px-4 py-2 font-medium">Course</th>
                  <th className="px-4 py-2 font-medium">Section</th>
                  <th className="px-4 py-2 font-medium">Schedule</th>
                  <th className="px-4 py-2 font-medium">Instructor</th>
                  <th className="px-4 py-2 font-medium">Capacity</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {offerings.map((offering) => (
                  <tr key={offering.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2">
                      {offering.course.course_code} — {offering.academic_term.academic_year} ({offering.academic_term.semester})
                    </td>
                    <td className="px-4 py-2">{offering.section}</td>
                    <td className="px-4 py-2">{offering.schedule}</td>
                    <td className="px-4 py-2">{offering.instructor?.name ?? '—'}</td>
                    <td className="px-4 py-2">{offering.capacity}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        offering.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {offering.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      {(canManage || canInstruct) &&(
                        <>
                          <Link to={`/course-offerings/${offering.id}/students`} className="mr-3 text-gray-600 hover:underline">
                            Students
                          </Link>
                        </>
                      )}
                      {canManage && (
                        <>

                          <button onClick={() => setEditingOffering(offering)} className="mr-3 text-blue-600 hover:underline">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(offering.id)} className="text-red-600 hover:underline">
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {meta && (
            <Pagination currentPage={meta.current_page} lastPage={meta.last_page} total={meta.total} perPage={meta.per_page} onPageChange={setPage} />
          )}
        </div>
      )}
    </div>
  )
}
import { useEffect, useState, useCallback } from 'react'
import * as enrollmentService from '../services/enrollmentService'
import type { Enrollment } from '../types/enrollment'
import { ENROLLMENT_STATUSES } from '../types/enrollment'
import { Pagination } from '../components/Pagination'
import { EnrollmentForm } from '../components/EnrollmentForm'
import { useAuth } from '../hooks/useAuth'
import { getErrorState, type ErrorState } from '../utils/errorState'
import * as studentService from '../services/studentService'
import * as courseOfferingService from '../services/courseOfferingService'
import type { Student } from '../types/student'
import type { CourseOffering } from '../types/courseOffering'
import { SearchableSelect } from '../components/SearchableSelect'
import { GradeForm } from '../components/GradeForm'
import * as gradeService from '../services/gradeService'
import type { GradeFormData } from '../types/grade'

export default function EnrollmentsPage() {
  const { user } = useAuth()
  const canManage = user?.roles.some((r) => ['administrator', 'registrar'].includes(r)) ?? false

  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number; per_page: number } | null>(null)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [errorState, setErrorState] = useState<ErrorState | null>(null)
  const [isCreating, setIsCreating] = useState(false)
const [students, setStudents] = useState<Student[]>([])
const [offerings, setOfferings] = useState<CourseOffering[]>([])
const [studentId, setStudentId] = useState('')
const [courseOfferingId, setCourseOfferingId] = useState('')
const canGrade = user?.roles.some((r) => ['administrator', 'registrar', 'instructor'].includes(r)) ?? false
const [gradingEnrollment, setGradingEnrollment] = useState<Enrollment | null>(null)

  const fetchEnrollments = useCallback(async () => {
  setIsLoading(true)
  setErrorState(null)
  try {
    const response = await enrollmentService.listEnrollments({
      student_id: studentId ? Number(studentId) : undefined,
      course_offering_id: courseOfferingId ? Number(courseOfferingId) : undefined,
      status: status || undefined,
      page,
      per_page: 10,
    })
    setEnrollments(response.data)
    setMeta(response.meta)
  } catch (err) {
    setErrorState(getErrorState(err))
  } finally {
    setIsLoading(false)
  }
}, [studentId, courseOfferingId, status, page])

  useEffect(() => {
    fetchEnrollments()
  }, [fetchEnrollments])

  async function handleGradeSubmit(data: GradeFormData) {
    if (gradingEnrollment?.grade) {
      await gradeService.updateGrade(gradingEnrollment.grade.id, data)
    } else {
      await gradeService.createGrade(data)
    }
    setGradingEnrollment(null)
    fetchEnrollments()
  }

  async function handleStatusChange(id: number, newStatus: string) {
    try {
      await enrollmentService.updateEnrollmentStatus(id, newStatus)
      fetchEnrollments()
    } catch {
      alert('Failed to update enrollment status.')
    }
  }

    useEffect(() => {
    Promise.all([
        studentService.listStudents({ per_page: 100 }),
        courseOfferingService.listCourseOfferings({ per_page: 100 }),
    ]).then(([studentRes, offeringRes]) => {
        setStudents(studentRes.data)
        setOfferings(offeringRes.data)
    })
    }, [])

  async function handleDelete(id: number) {
    if (!confirm('Delete this enrollment? This cannot be undone.')) return
    try {
      await enrollmentService.deleteEnrollment(id)
      fetchEnrollments()
    } catch {
      alert('Failed to delete enrollment.')
    }
  }

  async function handleFormSubmit(data: Parameters<typeof enrollmentService.createEnrollment>[0]) {
    await enrollmentService.createEnrollment(data)
    setIsCreating(false)
    fetchEnrollments()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Enrollments</h1>
        {canManage && (
          <button onClick={() => setIsCreating(true)} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            New Enrollment
          </button>
        )}
      </div>

        <div className="mb-4 flex gap-3">
        <SearchableSelect
        options={students.map((s) => ({ id: s.id, label: `${s.student_number} — ${s.last_name}, ${s.first_name}` }))}
        value={studentId}
        onChange={(id) => { setPage(1); setStudentId(id) }}
        placeholder="Search student…"
        />
        <SearchableSelect
        options={offerings.map((o) => ({ id: o.id, label: `${o.course.course_code} — ${o.section}` }))}
        value={courseOfferingId}
        onChange={(id) => { setPage(1); setCourseOfferingId(id) }}
        placeholder="Search offering…"
        />
        <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value) }} className="rounded border border-gray-300 px-3 py-2 text-sm">
            <option value="">All statuses</option>
            {ENROLLMENT_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
            ))}
        </select>
        </div>

      {isCreating ? (
        <EnrollmentForm onSubmit={handleFormSubmit} onCancel={() => setIsCreating(false)} />
      ) : gradingEnrollment ? (
        <GradeForm
          enrollmentId={gradingEnrollment.id}
          studentLabel={`${gradingEnrollment.student.last_name}, ${gradingEnrollment.student.first_name}`}
          offeringLabel={`${gradingEnrollment.course_offering.course.course_code} — ${gradingEnrollment.course_offering.section}`}
          initialData={gradingEnrollment.grade}
          onSubmit={handleGradeSubmit}
          onCancel={() => setGradingEnrollment(null)}
        />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white">
          {isLoading ? (
            <p className="p-6 text-sm text-gray-500">Loading…</p>
          ) : errorState ? (
            <p className="p-6 text-sm text-red-600">{errorState.message}</p>
          ) : enrollments.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No enrollments found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="px-4 py-2 font-medium">Student</th>
                  <th className="px-4 py-2 font-medium">Offering</th>
                  <th className="px-4 py-2 font-medium">Enrolled</th>
                  <th className="px-4 py-2 font-medium">Grade</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2">
                      {enrollment.student.last_name}, {enrollment.student.first_name}
                      <span className="ml-1 text-xs text-gray-400">({enrollment.student.student_number})</span>
                    </td>
                    <td className="px-4 py-2">
                      {enrollment.course_offering.course.course_code} — {enrollment.course_offering.section}
                    </td>
                    <td className="px-4 py-2">{enrollment.enrollment_date}</td>
                    <td className="px-4 py-2">
                      {enrollment.grade ? (
                        <div className="text-xs">
                          <div>
                            <span className="text-gray-500">Midterm:</span>{' '}
                            {enrollment.grade.midterm_grade ?? '—'}
                          </div>
                          <div>
                            <span className="text-gray-500">Final:</span>{' '}
                            {enrollment.grade.final_grade ?? '—'}
                          </div>
                          {enrollment.grade.remarks && (
                            <div className="mt-0.5 font-medium text-gray-700">{enrollment.grade.remarks}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No grade yet</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                    {canManage ? (
                        <select
                        value={enrollment.status}
                        onChange={(e) => handleStatusChange(enrollment.id, e.target.value)}
                        className="rounded border border-gray-300 px-2 py-1 text-xs"
                        >
                        {ENROLLMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                        </select>
                    ) : (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {enrollment.status}
                        </span>
                    )}
                    </td>
                    
                    <td className="px-4 py-2 text-right">
                      {canGrade && (
                        <button onClick={() => setGradingEnrollment(enrollment)} className="mr-3 text-blue-600 hover:underline">
                          {enrollment.grade ? 'Edit Grade' : 'Enter Grade'}
                        </button>
                      )}
                      {canManage && (
                        <button onClick={() => handleDelete(enrollment.id)} className="text-red-600 hover:underline">
                          Delete
                        </button>
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
import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as courseOfferingService from '../services/courseOfferingService'
import type { CourseOffering } from '../types/courseOffering'
import type { OfferingEnrolledStudent } from '../types/courseOfferingStudent'
import { Pagination } from '../components/Pagination'
import { getErrorState, type ErrorState } from '../utils/errorState'
import { useAuth } from '../hooks/useAuth'
import { EnrollmentForm } from '../components/EnrollmentForm'
import * as enrollmentService from '../services/enrollmentService'
import type { EnrollmentCreateData } from '../types/enrollment'


export default function CourseOfferingStudentsPage() {
  const { id } = useParams<{ id: string }>()
  const offeringId = Number(id)

  const [offering, setOffering] = useState<CourseOffering | null>(null)
  const [students, setStudents] = useState<OfferingEnrolledStudent[]>([])
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number; per_page: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorState, setErrorState] = useState<ErrorState | null>(null)
  const { user } = useAuth()
const canManage = user?.roles.some((r) => ['administrator', 'registrar'].includes(r)) ?? false
const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    courseOfferingService.getCourseOffering(offeringId).then(setOffering).catch(() => {})
  }, [offeringId])
  async function handleAddStudent(data: EnrollmentCreateData) {
    await enrollmentService.createEnrollment(data)
    setIsAdding(false)
    fetchStudents()
  }
  const fetchStudents = useCallback(async () => {
    setIsLoading(true)
    setErrorState(null)
    try {
      const response = await courseOfferingService.listOfferingStudents(offeringId, page)
      setStudents(response.data)
      setMeta({
        current_page: response.current_page,
        last_page: response.last_page,
        total: response.total,
        per_page: response.per_page,
      })
    } catch (err) {
      setErrorState(getErrorState(err))
    } finally {
      setIsLoading(false)
    }
  }, [offeringId, page])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  return (
    <div>
      <Link to="/course-offerings" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
        ← Back to Course Offerings
      </Link>


      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">
          {offering ? `${offering.course.course_code} — Section ${offering.section}` : 'Enrolled Students'}
        </h1>
        {canManage && (
          <button onClick={() => setIsAdding(true)} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Add Student
          </button>
        )}
      </div>
      {offering && meta && (
        <p className="mb-4 text-sm text-gray-500">
          {meta.total} / {offering.capacity} enrolled
          {meta.total >= offering.capacity && <span className="ml-2 font-medium text-amber-600">Full</span>}
        </p>
      )}
      {offering && (
        <p className="mb-4 text-sm text-gray-500">
          {offering.academic_term.academic_year} ({offering.academic_term.semester}) · {offering.schedule}
        </p>
      )}


    {isAdding ? (
      <EnrollmentForm
        fixedOffering={{ id: offeringId, label: offering ? `${offering.course.course_code} — Section ${offering.section}` : `Offering #${offeringId}` }}
        onSubmit={handleAddStudent}
        onCancel={() => setIsAdding(false)}
      />
    ) : (
      <div className="rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <p className="p-6 text-sm text-gray-500">Loading…</p>
        ) : errorState ? (
          <p className="p-6 text-sm text-red-600">{errorState.message}</p>
        ) : students.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No students enrolled in this offering yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-4 py-2 font-medium">Student No.</th>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Program</th>
                <th className="px-4 py-2 font-medium">Year</th>
                <th className="px-4 py-2 font-medium">Enrollment Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((enrollment) => (
                <tr key={enrollment.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2">{enrollment.student.student_number}</td>
                  <td className="px-4 py-2">{enrollment.student.last_name}, {enrollment.student.first_name}</td>
                  <td className="px-4 py-2">{enrollment.student.program?.code ?? '—'}</td>
                  <td className="px-4 py-2">{enrollment.student.year_level}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {enrollment.status}
                    </span>
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
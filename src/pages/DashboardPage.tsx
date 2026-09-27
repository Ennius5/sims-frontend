import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import * as programService from '../services/programService'
import * as courseService from '../services/courseService'
import * as academicTermService from '../services/academicTermService'
import * as studentService from '../services/studentService'
import * as courseOfferingService from '../services/courseOfferingService'
import * as enrollmentService from '../services/enrollmentService'

function SummaryCard({ label, value, to }: { label: string; value: number | null; to: string }) {
  return (
    <Link to={to} className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value ?? '—'}</p>
    </Link>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const isAdminOrRegistrar = user?.roles.some((r) => ['administrator', 'registrar'].includes(r)) ?? false
  const isInstructor = user?.roles.includes('instructor') ?? false
  const isStudent = user?.roles.includes('student') ?? false

  const [counts, setCounts] = useState<Record<string, number | null>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadCounts() {
      setIsLoading(true)
      try {
        if (isAdminOrRegistrar) {
          const [programs, courses, terms, students, offerings, enrollments] = await Promise.all([
            programService.listPrograms({ per_page: 1 }),
            courseService.listCourses({ per_page: 1 }),
            academicTermService.listAcademicTerms({ per_page: 1 }),
            studentService.listStudents({ per_page: 1 }),
            courseOfferingService.listCourseOfferings({ per_page: 1 }),
            enrollmentService.listEnrollments({ per_page: 1 }),
          ])
          setCounts({
            programs: programs.meta.total,
            courses: courses.meta.total,
            terms: terms.meta.total,
            students: students.meta.total,
            offerings: offerings.meta.total,
            enrollments: enrollments.meta.total,
          })
        } else if (isInstructor && user) {
          const [myOfferings, myEnrollments] = await Promise.all([
            courseOfferingService.listCourseOfferings({ instructor_id: user.id, per_page: 1 }),
            enrollmentService.listEnrollments({ per_page: 1 }), // already scoped to this instructor by the backend
          ])
          setCounts({
            myOfferings: myOfferings.meta.total,
            myEnrollments: myEnrollments.meta.total,
          })
        } else if (isStudent) {
          const myEnrollments = await enrollmentService.listEnrollments({ per_page: 1 }) // scoped to this student
          setCounts({ myEnrollments: myEnrollments.meta.total })
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadCounts()
  }, [isAdminOrRegistrar, isInstructor, isStudent, user])

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-gray-900">Welcome, {user?.name}</h1>
      <p className="mb-6 text-sm text-gray-500">{user?.roles.join(', ')}</p>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {isAdminOrRegistrar && (
            <>
              <SummaryCard label="Programs" value={counts.programs} to="/programs" />
              <SummaryCard label="Courses" value={counts.courses} to="/courses" />
              <SummaryCard label="Academic Terms" value={counts.terms} to="/academic-terms" />
              <SummaryCard label="Students" value={counts.students} to="/students" />
              <SummaryCard label="Course Offerings" value={counts.offerings} to="/course-offerings" />
              <SummaryCard label="Enrollments" value={counts.enrollments} to="/enrollments" />
            </>
          )}
          {isInstructor && (
            <>
              <SummaryCard label="My Offerings" value={counts.myOfferings} to="/course-offerings" />
              <SummaryCard label="My Students' Enrollments" value={counts.myEnrollments} to="/enrollments" />
            </>
          )}
          {isStudent && (
            <>
              <SummaryCard label="My Enrollments" value={counts.myEnrollments} to="/enrollments" />
              <SummaryCard label="Academic Record" value={null} to="/academic-record" />
            </>
          )}
        </div>
      )}
    </div>
  )
}
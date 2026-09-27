import { useEffect, useState } from 'react'
import * as academicRecordService from '../services/academicRecordService'
import * as studentService from '../services/studentService'
import type { AcademicRecordResponse } from '../types/academicRecord'
import type { Student } from '../types/student'
import { SearchableSelect } from '../components/SearchableSelect'
import { useAuth } from '../hooks/useAuth'
import { getErrorState, type ErrorState } from '../utils/errorState'

export default function AcademicRecordPage() {
  const { user } = useAuth()
  const isStudent = user?.roles.includes('student') ?? false

  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [record, setRecord] = useState<AcademicRecordResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorState, setErrorState] = useState<ErrorState | null>(null)

  // Admin/registrar/instructor: load a student picker.
  useEffect(() => {
    if (!isStudent) {
      studentService.listStudents({ per_page: 100 }).then((res) => setStudents(res.data))
    }
  }, [isStudent])

  // Student: jump straight to their own record.
  useEffect(() => {
    if (isStudent && user?.student_id) {
      setSelectedStudentId(String(user.student_id))
    }
  }, [isStudent, user])

  useEffect(() => {
    if (!selectedStudentId) {
      setRecord(null)
      return
    }
    setIsLoading(true)
    setErrorState(null)
    academicRecordService
      .getAcademicRecord(Number(selectedStudentId))
      .then(setRecord)
      .catch((err) => setErrorState(getErrorState(err)))
      .finally(() => setIsLoading(false))
  }, [selectedStudentId])

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-gray-900">Academic Record</h1>

      {!isStudent && (
        <div className="mb-4">
          <SearchableSelect
            options={students.map((s) => ({ id: s.id, label: `${s.student_number} — ${s.last_name}, ${s.first_name}` }))}
            value={selectedStudentId}
            onChange={setSelectedStudentId}
            placeholder="Search student…"
          />
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : errorState ? (
        <p className="text-sm text-red-600">{errorState.message}</p>
      ) : !record ? (
        <p className="text-sm text-gray-500">
          {isStudent ? 'No academic record found.' : 'Select a student to view their academic record.'}
        </p>
      ) : (
        <div>
          <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-900">{record.student.name}</p>
            <p className="text-xs text-gray-500">{record.student.student_number}</p>
          </div>

          {Object.entries(record.academic_record).map(([term, courses]) => (
            <div key={term} className="mb-4 rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">
                {term}
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="px-4 py-2 font-medium">Code</th>
                    <th className="px-4 py-2 font-medium">Title</th>
                    <th className="px-4 py-2 font-medium">Units</th>
                    <th className="px-4 py-2 font-medium">Midterm</th>
                    <th className="px-4 py-2 font-medium">Final</th>
                    <th className="px-4 py-2 font-medium">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-2">{course.course_code}</td>
                      <td className="px-4 py-2">{course.course_title}</td>
                      <td className="px-4 py-2">{course.units}</td>
                      <td className="px-4 py-2">{course.midterm_grade ?? '—'}</td>
                      <td className="px-4 py-2">{course.final_grade ?? '—'}</td>
                      <td className="px-4 py-2">{course.remarks ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
import { useEffect, useState, useCallback } from 'react'
import * as studentService from '../services/studentService'
import * as programService from '../services/programService'
import type { Student, StudentFormData } from '../types/student'
import type { Program } from '../types/program'
import { Pagination } from '../components/Pagination'
import { StudentForm } from '../components/StudentForm'
import { useAuth } from '../hooks/useAuth'
import { getErrorState, type ErrorState } from '../utils/errorState'

export default function StudentsPage() {
  const { user } = useAuth()
  const canManage = user?.roles.some((r) => ['administrator', 'registrar'].includes(r)) ?? false
  const canDelete = user?.roles.includes('administrator') ?? false

  const [students, setStudents] = useState<Student[]>([])
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number; per_page: number } | null>(null)
  const [programs, setPrograms] = useState<Program[]>([])
  const [search, setSearch] = useState('')
  const [programId, setProgramId] = useState('')
  const [yearLevel, setYearLevel] = useState('')
  const [sort, setSort] = useState('last_name')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [errorState, setErrorState] = useState<ErrorState | null>(null)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    programService.listPrograms({ status: 'ACTIVE', per_page: 100 }).then((res) => setPrograms(res.data))
  }, [])

  const fetchStudents = useCallback(async () => {
    setIsLoading(true)
    setErrorState(null)
    try {
      const response = await studentService.listStudents({
        search: search || undefined,
        program_id: programId ? Number(programId) : undefined,
        year_level: yearLevel ? Number(yearLevel) : undefined,
        sort,
        page,
        per_page: 10,
      })
      setStudents(response.data)
      setMeta(response.meta)
    } catch (err) {
      setErrorState(getErrorState(err))
    } finally {
      setIsLoading(false)
    }
  }, [search, programId, yearLevel, sort, page])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  async function handleDelete(id: number) {
    if (!confirm('Delete this student? This cannot be undone.')) return
    try {
      await studentService.deleteStudent(id)
      fetchStudents()
    } catch {
      alert('Failed to delete student.')
    }
  }

  async function handleFormSubmit(data: StudentFormData) {
    if (editingStudent) {
      await studentService.updateStudent(editingStudent.id, data)
    } else {
      await studentService.createStudent(data)
    }
    setEditingStudent(null)
    setIsCreating(false)
    fetchStudents()
  }

  // A whole role (instructor, student) can be 403'd just for hitting the list
  // endpoint — that's a real backend rule (index is admin/registrar only),
  // not a bug, so it gets its own state rather than the generic error banner.
  if (errorState?.type === 'forbidden') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        <p className="font-medium">Access denied</p>
        <p className="mt-1">{errorState.message}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Students</h1>
        {canManage && (
          <button onClick={() => setIsCreating(true)} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            New Student
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          placeholder="Search by name or student number…"
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value) }}
          className="w-72 rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <select value={programId} onChange={(e) => { setPage(1); setProgramId(e.target.value) }} className="rounded border border-gray-300 px-3 py-2 text-sm">
          <option value="">All programs</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>{p.code}</option>
          ))}
        </select>
        <select value={yearLevel} onChange={(e) => { setPage(1); setYearLevel(e.target.value) }} className="rounded border border-gray-300 px-3 py-2 text-sm">
          <option value="">All year levels</option>
          {[1, 2, 3, 4, 5, 6].map((y) => (
            <option key={y} value={y}>Year {y}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded border border-gray-300 px-3 py-2 text-sm">
          <option value="last_name">Last Name (A–Z)</option>
          <option value="-last_name">Last Name (Z–A)</option>
          <option value="student_number">Student Number</option>
          <option value="-created_at">Newest first</option>
        </select>
      </div>

      {isCreating || editingStudent ? (
        <StudentForm
          initialData={editingStudent ?? undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => { setIsCreating(false); setEditingStudent(null) }}
        />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white">
          {isLoading ? (
            <p className="p-6 text-sm text-gray-500">Loading…</p>
          ) : errorState ? (
            <p className="p-6 text-sm text-red-600">{errorState.message}</p>
          ) : students.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No students found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="px-4 py-2 font-medium">Student No.</th>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Program</th>
                  <th className="px-4 py-2 font-medium">Year</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2">{student.student_number}</td>
                    <td className="px-4 py-2">{student.last_name}, {student.first_name}</td>
                    <td className="px-4 py-2">{student.program?.code ?? `#${student.program_id}`}</td>
                    <td className="px-4 py-2">{student.year_level}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        student.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      {canManage && (
                        <button onClick={() => setEditingStudent(student)} className="mr-3 text-blue-600 hover:underline">
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(student.id)} className="text-red-600 hover:underline">
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
import { useEffect, useState, useCallback } from 'react'
import * as courseService from '../services/courseService'
import type { Course, CourseFormData } from '../types/course'
import { Pagination } from '../components/Pagination'
import { CourseForm } from '../components/CourseForm'

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number; per_page: number } | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('course_code')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const fetchCourses = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await courseService.listCourses({
        search: search || undefined,
        status: status || undefined,
        sort,
        page,
        per_page: 10,
      })
      setCourses(response.data)
      setMeta(response.meta)
    } catch {
      setError('Unable to load courses. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [search, status, sort, page])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  async function handleDelete(id: number) {
    if (!confirm('Delete this course? This cannot be undone.')) return
    try {
      await courseService.deleteCourse(id)
      fetchCourses()
    } catch {
      alert('Failed to delete course.')
    }
  }

  async function handleFormSubmit(data: CourseFormData) {
    if (editingCourse) {
      await courseService.updateCourse(editingCourse.id, data)
    } else {
      await courseService.createCourse(data)
    }
    setEditingCourse(null)
    setIsCreating(false)
    fetchCourses()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Courses</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          New Course
        </button>
      </div>

      <div className="mb-4 flex gap-3">
        <input
          placeholder="Search by title…"
          value={search}
          onChange={(e) => {
            setPage(1)
            setSearch(e.target.value)
          }}
          className="w-64 rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1)
            setStatus(e.target.value)
          }}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="course_code">Code (A–Z)</option>
          <option value="-course_code">Code (Z–A)</option>
          <option value="-created_at">Newest first</option>
        </select>
      </div>

      {isCreating || editingCourse ? (
        <CourseForm
          initialData={editingCourse ?? undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsCreating(false)
            setEditingCourse(null)
          }}
        />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white">
          {isLoading ? (
            <p className="p-6 text-sm text-gray-500">Loading…</p>
          ) : error ? (
            <p className="p-6 text-sm text-red-600">{error}</p>
          ) : courses.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No courses found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="px-4 py-2 font-medium">Code</th>
                  <th className="px-4 py-2 font-medium">Title</th>
                  <th className="px-4 py-2 font-medium">Units</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2">{course.course_code}</td>
                    <td className="px-4 py-2">{course.course_title}</td>
                    <td className="px-4 py-2">{course.units}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          course.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => setEditingCourse(course)} className="mr-3 text-blue-600 hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {meta && (
            <Pagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              total={meta.total}
              perPage={meta.per_page}
              onPageChange={setPage}
            />
          )}
        </div>
      )}
    </div>
  )
}
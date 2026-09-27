import { useEffect, useState, useCallback } from 'react'
import * as academicTermService from '../services/academicTermService'
import type { AcademicTerm, AcademicTermFormData } from '../types/academicTerm'
import { Pagination } from '../components/Pagination'
import { AcademicTermForm } from '../components/AcademicTermForm'

export default function AcademicTermsPage() {
  const [terms, setTerms] = useState<AcademicTerm[]>([])
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number; per_page: number } | null>(null)
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('start_date')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTerm, setEditingTerm] = useState<AcademicTerm | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const fetchTerms = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await academicTermService.listAcademicTerms({
        status: status || undefined,
        sort,
        page,
        per_page: 10,
      })
      setTerms(response.data)
      setMeta(response.meta)
    } catch {
      setError('Unable to load academic terms. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [status, sort, page])

  useEffect(() => {
    fetchTerms()
  }, [fetchTerms])

  async function handleDelete(id: number) {
    if (!confirm('Delete this academic term? This cannot be undone.')) return
    try {
      await academicTermService.deleteAcademicTerm(id)
      fetchTerms()
    } catch {
      alert('Failed to delete academic term.')
    }
  }

  async function handleFormSubmit(data: AcademicTermFormData) {
    if (editingTerm) {
      await academicTermService.updateAcademicTerm(editingTerm.id, data)
    } else {
      await academicTermService.createAcademicTerm(data)
    }
    setEditingTerm(null)
    setIsCreating(false)
    fetchTerms()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Academic Terms</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          New Academic Term
        </button>
      </div>

      <div className="mb-4 flex gap-3">
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
          <option value="start_date">Start Date (earliest)</option>
          <option value="-start_date">Start Date (latest)</option>
        </select>
      </div>

      {isCreating || editingTerm ? (
        <AcademicTermForm
          initialData={editingTerm ?? undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsCreating(false)
            setEditingTerm(null)
          }}
        />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white">
          {isLoading ? (
            <p className="p-6 text-sm text-gray-500">Loading…</p>
          ) : error ? (
            <p className="p-6 text-sm text-red-600">{error}</p>
          ) : terms.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No academic terms found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="px-4 py-2 font-medium">Academic Year</th>
                  <th className="px-4 py-2 font-medium">Semester</th>
                  <th className="px-4 py-2 font-medium">Start</th>
                  <th className="px-4 py-2 font-medium">End</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {terms.map((term) => (
                  <tr key={term.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2">{term.academic_year}</td>
                    <td className="px-4 py-2">{term.semester}</td>
                    <td className="px-4 py-2">{term.start_date}</td>
                    <td className="px-4 py-2">{term.end_date}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          term.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {term.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => setEditingTerm(term)} className="mr-3 text-blue-600 hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(term.id)} className="text-red-600 hover:underline">
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
import { useEffect, useState, useCallback } from 'react'
import * as programService from '../services/programService'
import type { Program, ProgramFormData } from '../types/program'
import { Pagination } from '../components/Pagination'
import { ProgramForm } from '../components/ProgramForm'

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number; per_page: number } | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('name')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
const [isCreating, setIsCreating] = useState(false)

  const fetchPrograms = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await programService.listPrograms({
        search: search || undefined,
        status: status || undefined,
        sort,
        page,
        per_page: 10,
      })
      setPrograms(response.data)
      setMeta(response.meta)
    } catch {
      setError('Unable to load programs. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [search, status, sort, page])

  useEffect(() => {
    fetchPrograms()
  }, [fetchPrograms])

  async function handleDelete(id: number) {
    if (!confirm('Delete this program? This cannot be undone.')) return
    try {
      await programService.deleteProgram(id)
      fetchPrograms()
    } catch {
      alert('Failed to delete program.')
    }
  }

  async function handleFormSubmit(data: ProgramFormData) {
  if (editingProgram) {
    await programService.updateProgram(editingProgram.id, data)
  } else {
    await programService.createProgram(data)
  }
  setEditingProgram(null)
  setIsCreating(false)
  fetchPrograms()
}

  return (
    <div>
        <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Programs</h1>
        <button
            onClick={() => setIsCreating(true)}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
            New Program
        </button>
        </div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Programs</h1>
      </div>

      <div className="mb-4 flex gap-3">
        <input
          placeholder="Search by name…"
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
          <option value="name">Name (A–Z)</option>
          <option value="-name">Name (Z–A)</option>
          <option value="code">Code (A–Z)</option>
          <option value="-created_at">Newest first</option>
        </select>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <p className="p-6 text-sm text-gray-500">Loading…</p>
        ) : error ? (
          <p className="p-6 text-sm text-red-600">{error}</p>
        ) : programs.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No programs found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-4 py-2 font-medium">Code</th>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program) => (
                <tr key={program.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2">{program.code}</td>
                  <td className="px-4 py-2">{program.name}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        program.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {program.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => setEditingProgram(program)} className="mr-3 text-blue-600 hover:underline">
                        Edit
                    </button>
                    </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleDelete(program.id)}
                      className="text-red-600 hover:underline"
                    >
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
        {isCreating || editingProgram ? (
        <ProgramForm
            initialData={editingProgram ?? undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => {
            setIsCreating(false)
            setEditingProgram(null)
            }}
        />
        ) : (
        <div className="rounded-lg border border-gray-200 bg-white">
            {/* ...existing table/loading/error/empty block stays here... */}
        </div>
        )}
    </div>
  )
}
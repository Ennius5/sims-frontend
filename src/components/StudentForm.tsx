import { useState, useEffect, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import type { Student, StudentFormData } from '../types/student'
import * as programService from '../services/programService'
import type { Program } from '../types/program'
import * as userService from '../services/userService'
import type { UserAccount } from '../types/user'
import { SearchableSelect } from './SearchableSelect'

interface StudentFormProps {
  initialData?: Student
  onSubmit: (data: StudentFormData) => Promise<void>
  onCancel: () => void
}

export function StudentForm({ initialData, onSubmit, onCancel }: StudentFormProps) {
  const [programs, setPrograms] = useState<Program[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
    const [studentAccounts, setStudentAccounts] = useState<UserAccount[]>([])

  const [form, setForm] = useState<StudentFormData>({
    student_number: initialData?.student_number ?? '',
    first_name: initialData?.first_name ?? '',
    middle_name: initialData?.middle_name ?? '',
    last_name: initialData?.last_name ?? '',
    suffix: initialData?.suffix ?? '',
    birth_date: initialData?.birth_date ?? '',
    email: initialData?.email ?? '',
    contact_number: initialData?.contact_number ?? '',
    address: initialData?.address ?? '',
    program_id: initialData?.program_id ?? initialData?.program?.id ?? 0,
    year_level: initialData?.year_level ?? 1,
    status: initialData?.status ?? 'ACTIVE',
    user_id: initialData?.user_id ?? null,
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
    Promise.all([
        programService.listPrograms({ status: 'ACTIVE', per_page: 100 }),
        userService.listStudentUserAccounts(),
    ])
        .then(([programRes, accounts]) => {
        setPrograms(programRes.data)
        setStudentAccounts(accounts)
        })
        .finally(() => setIsLoadingOptions(false))
    }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFieldErrors({})
    setGeneralError(null)
    setIsSubmitting(true)
    try {
      await onSubmit(form)
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 422) {
        setFieldErrors(err.response.data.errors ?? {})
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
  const linkedAccount = form.user_id ? studentAccounts.find((account) => account.id === form.user_id) : null

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-base font-semibold text-gray-900">
        {initialData ? 'Edit Student' : 'New Student'}
      </h2>

      {generalError && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {generalError}
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label htmlFor= "student_number" className="mb-1 block text-sm font-medium text-gray-700">
            Student Number <span className="text-red-500">*</span>
          </label>
          <input
            id="student_number"
            required
            value={form.student_number}
            onChange={(e) => setForm((f) => ({ ...f, student_number: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          {fieldErrors.student_number && <p className="mt-1 text-sm text-red-600">{fieldErrors.student_number[0]}</p>}
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email[0]}</p>}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="first_name" className="mb-1 block text-sm font-medium text-gray-700">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            id="first_name"
            required
            value={form.first_name}
            onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          {fieldErrors.first_name && <p className="mt-1 text-sm text-red-600">{fieldErrors.first_name[0]}</p>}
        </div>
        <div>
          <label htmlFor="middle_name" className="mb-1 block text-sm font-medium text-gray-700">Middle Name</label>
          <input
            id="middle_name"
            value={form.middle_name}
            onChange={(e) => setForm((f) => ({ ...f, middle_name: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="last_name" className="mb-1 block text-sm font-medium text-gray-700">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            id="last_name"
            required
            value={form.last_name}
            onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          {fieldErrors.last_name && <p className="mt-1 text-sm text-red-600">{fieldErrors.last_name[0]}</p>}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="suffix" className="mb-1 block text-sm font-medium text-gray-700">Suffix</label>
          <input
            id="suffix"
            placeholder="Jr., III, etc."
            value={form.suffix}
            onChange={(e) => setForm((f) => ({ ...f, suffix: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor= "birth_date"className="mb-1 block text-sm font-medium text-gray-700">Birth Date</label>
          <input
            id= "birth_date"
            type="date"
            value={form.birth_date}
            onChange={(e) => setForm((f) => ({ ...f, birth_date: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          {fieldErrors.birth_date && <p className="mt-1 text-sm text-red-600">{fieldErrors.birth_date[0]}</p>}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact_number" className="mb-1 block text-sm font-medium text-gray-700">Contact Number</label>
          <input
            id="contact_number"
            value={form.contact_number}
            onChange={(e) => setForm((f) => ({ ...f, contact_number: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="address" className="mb-1 block text-sm font-medium text-gray-700">Address</label>
          <input
            id="address"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="program_id" className="mb-1 block text-sm font-medium text-gray-700">
            Program <span className="text-red-500">*</span>
          </label>
          <select
            id="program_id"
            required
            value={form.program_id || ''}
            onChange={(e) => setForm((f) => ({ ...f, program_id: Number(e.target.value) }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>Select a program…</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
            ))}
          </select>
          {fieldErrors.program_id && <p className="mt-1 text-sm text-red-600">{fieldErrors.program_id[0]}</p>}
        </div>
        <div>
          <label htmlFor="year_level" className="mb-1 block text-sm font-medium text-gray-700">
            Year Level <span className="text-red-500">*</span>
          </label>
          <input
            id="year_level"
            type="number"
            min={1}
            max={6}
            required
            value={form.year_level}
            onChange={(e) => setForm((f) => ({ ...f, year_level: Number(e.target.value) }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          {fieldErrors.year_level && <p className="mt-1 text-sm text-red-600">{fieldErrors.year_level[0]}</p>}
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700">Status</label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as StudentFormData['status'] }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="user_id" className="mb-1 block text-sm font-medium text-gray-700">Linked User Account</label>
          <SearchableSelect
            id="user_id"
            options={studentAccounts.map((account) => ({ id: account.id, label: `${account.name} — ${account.email}` }))}
            value={form.user_id ? String(form.user_id) : ''}
            onChange={(id) => setForm((f) => ({ ...f, user_id: id ? Number(id) : null }))}
            placeholder={
                          linkedAccount
                            ? `${linkedAccount.name} — ${linkedAccount.email}`
                            : 'Search user account…'
                        }
          />
          <p className="mt-1 text-xs text-gray-500">
            Lets this student log in and view their own record, enrollments, and grades.
          </p>
          {fieldErrors.user_id && <p className="mt-1 text-sm text-red-600">{fieldErrors.user_id[0]}</p>}
        </div>
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
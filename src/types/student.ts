export interface Student {
  id: number
  user_id: number | null
  student_number: string
  first_name: string
  middle_name: string | null
  last_name: string
  suffix: string | null
  birth_date: string | null
  email: string
  contact_number: string | null
  address: string | null
  program_id: number
  year_level: number
  status: 'ACTIVE' | 'INACTIVE'
  created_at: string
  updated_at: string
  program?: { id: number; code: string; name: string }
}

export interface StudentFormData {
  student_number: string
  first_name: string
  middle_name: string
  last_name: string
  suffix: string
  birth_date: string
  email: string
  contact_number: string
  address: string
  program_id: number
  year_level: number
  status: 'ACTIVE' | 'INACTIVE'
  user_id: number | null
}

export interface StudentListParams {
  search?: string
  program_id?: number
  year_level?: number
  status?: string
  sort?: string
  per_page?: number
  page?: number
}
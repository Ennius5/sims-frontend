export interface Program {
  id: number
  code: string
  name: string
  description: string | null
  status: 'ACTIVE' | 'INACTIVE'
  created_at: string
  updated_at: string
}

export interface ProgramFormData {
  code: string
  name: string
  description: string
  status: 'ACTIVE' | 'INACTIVE'
}

export interface ProgramListParams {
  search?: string
  status?: string
  sort?: string
  per_page?: number
  page?: number
}
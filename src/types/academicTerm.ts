export interface AcademicTerm {
  id: number
  academic_year: string
  semester: '1st' | '2nd' | 'Summer'
  start_date: string
  end_date: string
  status: 'ACTIVE' | 'INACTIVE'
  created_at: string
  updated_at: string
}

export interface AcademicTermFormData {
  academic_year: string
  semester: string
  start_date: string
  end_date: string
  status: 'ACTIVE' | 'INACTIVE'
}

export interface AcademicTermListParams {
  status?: string
  sort?: string
  per_page?: number
  page?: number
}
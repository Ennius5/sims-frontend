export interface Course {
  id: number
  course_code: string
  course_title: string
  description: string | null
  units: number
  status: 'ACTIVE' | 'INACTIVE'
  created_at: string
  updated_at: string
}

export interface CourseFormData {
  course_code: string
  course_title: string
  description: string
  units: number
  status: 'ACTIVE' | 'INACTIVE'
}

export interface CourseListParams {
  search?: string
  status?: string
  sort?: string
  per_page?: number
  page?: number
}
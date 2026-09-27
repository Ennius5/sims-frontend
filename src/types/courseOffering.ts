export interface CourseOffering {
  id: number
  section: string
  schedule: string
  room: string
  capacity: number
  status: 'OPEN' | 'CLOSED' | 'CANCELLED'
  created_at: string
  updated_at: string
  course: { id: number; course_code: string; course_title: string }
  academic_term: { id: number; academic_year: string; semester: string }
  instructor: { id: number; name: string } | null
}

export interface CourseOfferingFormData {
  course_id: number
  academic_term_id: number
  instructor_id: number | null
  section: string
  schedule: string
  room: string
  capacity: number
  status: 'OPEN' | 'CLOSED' | 'CANCELLED'
}

export interface CourseOfferingListParams {
  course_id?: number
  academic_term_id?: number
  instructor_id?: number
  status?: string
  sort?: string
  per_page?: number
  page?: number
}
export interface OfferingEnrolledStudent {
  id: number
  student_id: number
  course_offering_id: number
  enrollment_date: string
  status: string
  created_at: string
  updated_at: string
  student: {
    id: number
    student_number: string
    first_name: string
    last_name: string
    year_level: number
    status: string
    program: { id: number; code: string; name: string } | null
  }
}
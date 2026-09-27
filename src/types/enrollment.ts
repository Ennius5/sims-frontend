export interface EnrollmentStudentSummary {
  id: number
  student_number: string
  first_name: string
  last_name: string
  year_level: number
  status: string
}

export interface EnrollmentCourseOfferingSummary {
  id: number
  course: {
    id: number
    course_code: string
    course_title: string
    units: number
  }
  section: string
  schedule: string
  status: string
}

export interface EnrollmentGrade {
  id: number
  enrollment_id: number
  midterm_grade: string | null
  final_grade: string | null
  remarks: string | null
  updated_at: string
}

export interface Enrollment {
  id: number
  student: EnrollmentStudentSummary
  course_offering: EnrollmentCourseOfferingSummary
  enrollment_date: string
  status: string
  grade: EnrollmentGrade | null
  created_at: string
}

export interface EnrollmentCreateData {
  student_id: number
  course_offering_id: number
  enrollment_date: string
}

export interface EnrollmentListParams {
  student_id?: number
  course_offering_id?: number
  status?: string
  per_page?: number
  page?: number
}

export const ENROLLMENT_STATUSES = ['ENROLLED', 'DROPPED', 'COMPLETED'] as const
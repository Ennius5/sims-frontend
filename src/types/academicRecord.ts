export interface AcademicRecordCourse {
  course_code: string
  course_title: string
  units: number
  midterm_grade: string | null
  final_grade: string | null
  remarks: string | null
}

export interface AcademicRecordResponse {
  student: {
    id: number
    student_number: string
    name: string
  }
  academic_record: Record<string, AcademicRecordCourse[]>
}
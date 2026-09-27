export interface Grade {
  id: number
  enrollment_id: number
  midterm_grade: string | null
  final_grade: string | null
  remarks: string | null
  updated_at: string
}

export interface GradeFormData {
  enrollment_id: number
  midterm_grade: number | string
  final_grade: number | string
  remarks: string
}
import { apiClient } from './apiClient'
import type { AcademicRecordResponse } from '../types/academicRecord'

export async function getAcademicRecord(studentId: number): Promise<AcademicRecordResponse> {
  const response = await apiClient.get<AcademicRecordResponse>(`/students/${studentId}/academic-record`)
  return response.data
}
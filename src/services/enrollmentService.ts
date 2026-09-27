import { apiClient } from './apiClient'
import type { Enrollment, EnrollmentCreateData, EnrollmentListParams } from '../types/enrollment'
import type { PaginatedResponse } from '../types/pagination'
import { toSpatieParams } from '../utils/queryParams'

export async function listEnrollments(
  params: EnrollmentListParams
): Promise<PaginatedResponse<Enrollment>> {
const response = await apiClient.get<PaginatedResponse<Enrollment>>('/enrollments', {
  params: toSpatieParams(params, ['student_id', 'course_offering_id', 'status']),
})
  return response.data
}

export async function createEnrollment(data: EnrollmentCreateData): Promise<Enrollment> {
  const response = await apiClient.post<Enrollment>('/enrollments', data)
  return response.data
}

export async function updateEnrollmentStatus(id: number, status: string): Promise<Enrollment> {
  const response = await apiClient.patch<Enrollment>(`/enrollments/${id}`, { status })
  return response.data
}

export async function deleteEnrollment(id: number): Promise<void> {
  await apiClient.delete(`/enrollments/${id}`)
}
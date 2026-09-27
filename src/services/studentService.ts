import { apiClient } from './apiClient'
import type { Student, StudentFormData, StudentListParams } from '../types/student'
import type { PaginatedResponse } from '../types/pagination'
import { toSpatieParams } from '../utils/queryParams'

export async function listStudents(
  params: StudentListParams
): Promise<PaginatedResponse<Student>> {
    const response = await apiClient.get<PaginatedResponse<Student>>('/students', {
    params: toSpatieParams(params, ['search', 'program_id', 'year_level', 'status']),
})
  return response.data
}

export async function getStudent(id: number): Promise<Student> {
  const response = await apiClient.get<Student>(`/students/${id}`)
  return response.data
}

export async function createStudent(data: StudentFormData): Promise<Student> {
  const response = await apiClient.post<Student>('/students', data)
  return response.data
}

export async function updateStudent(id: number, data: StudentFormData): Promise<Student> {
  const response = await apiClient.patch<Student>(`/students/${id}`, data)
  return response.data
}

export async function deleteStudent(id: number): Promise<void> {
  await apiClient.delete(`/students/${id}`)
}
import { apiClient } from './apiClient'
import type { Grade, GradeFormData } from '../types/grade'

export async function getGrade(id: number): Promise<Grade> {
  const response = await apiClient.get<Grade>(`/grades/${id}`)
  return response.data
}

export async function createGrade(data: GradeFormData): Promise<Grade> {
  const response = await apiClient.post<Grade>('/grades', data)
  return response.data
}

export async function updateGrade(id: number, data: GradeFormData): Promise<Grade> {
  const response = await apiClient.patch<Grade>(`/grades/${id}`, data)
  return response.data
}
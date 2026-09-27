import { apiClient } from './apiClient'
import type { AcademicTerm, AcademicTermFormData, AcademicTermListParams } from '../types/academicTerm'
import type { PaginatedResponse } from '../types/pagination'
import { toSpatieParams } from '../utils/queryParams'

export async function listAcademicTerms(
  params: AcademicTermListParams
): Promise<PaginatedResponse<AcademicTerm>> {
  const response = await apiClient.get<PaginatedResponse<AcademicTerm>>('/academic-terms', {
    params: toSpatieParams(params, ['status']),
  })
  return response.data
}

export async function getAcademicTerm(id: number): Promise<AcademicTerm> {
  const response = await apiClient.get<AcademicTerm>(`/academic-terms/${id}`)
  return response.data
}

export async function createAcademicTerm(data: AcademicTermFormData): Promise<AcademicTerm> {
  const response = await apiClient.post<AcademicTerm>('/academic-terms', data)
  return response.data
}

export async function updateAcademicTerm(id: number, data: AcademicTermFormData): Promise<AcademicTerm> {
  const response = await apiClient.patch<AcademicTerm>(`/academic-terms/${id}`, data)
  return response.data
}

export async function deleteAcademicTerm(id: number): Promise<void> {
  await apiClient.delete(`/academic-terms/${id}`)
}
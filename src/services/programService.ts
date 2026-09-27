import { apiClient } from './apiClient'
import type { Program, ProgramFormData, ProgramListParams } from '../types/program'
import type { PaginatedResponse } from '../types/pagination'
import { toSpatieParams } from '../utils/queryParams'

export async function listPrograms(
  params: ProgramListParams
): Promise<PaginatedResponse<Program>> {
  const response = await apiClient.get<PaginatedResponse<Program>>('/programs', {
    params: toSpatieParams(params, ['search', 'status']),
  })
  return response.data
}

export async function getProgram(id: number): Promise<Program> {
  const response = await apiClient.get<Program>(`/programs/${id}`)
  return response.data
}

export async function createProgram(data: ProgramFormData): Promise<Program> {
  const response = await apiClient.post<Program>('/programs', data)
  return response.data
}

export async function updateProgram(id: number, data: ProgramFormData): Promise<Program> {
  const response = await apiClient.patch<Program>(`/programs/${id}`, data)
  return response.data
}

export async function deleteProgram(id: number): Promise<void> {
  await apiClient.delete(`/programs/${id}`)
}
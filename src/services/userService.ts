import { apiClient } from './apiClient'
import type { UserAccount } from '../types/user'
import type { RawPaginatedResponse } from '../types/rawPagination'

export async function listStudentUserAccounts(): Promise<UserAccount[]> {
  const response = await apiClient.get<RawPaginatedResponse<UserAccount>>('/users', {
    params: { per_page: 100 },
  })
  return response.data.data.filter((u) => u.roles.includes('student'))
}
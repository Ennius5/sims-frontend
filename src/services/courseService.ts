import { apiClient } from './apiClient'
import type { Course, CourseFormData, CourseListParams } from '../types/course'
import type { PaginatedResponse } from '../types/pagination'
import { toSpatieParams } from '../utils/queryParams'

export async function listCourses(
  params: CourseListParams
): Promise<PaginatedResponse<Course>> {
  // const response = await apiClient.get<PaginatedResponse<Course>>('/courses', { params })
  const response = await apiClient.get<PaginatedResponse<Course>>('/courses', {
  params: toSpatieParams(params, ['search', 'status']),
})
  return response.data
}

export async function getCourse(id: number): Promise<Course> {
  const response = await apiClient.get<Course>(`/courses/${id}`)
  return response.data
}

export async function createCourse(data: CourseFormData): Promise<Course> {
  const response = await apiClient.post<Course>('/courses', data)
  return response.data
}

export async function updateCourse(id: number, data: CourseFormData): Promise<Course> {
  const response = await apiClient.patch<Course>(`/courses/${id}`, data)
  return response.data
}

export async function deleteCourse(id: number): Promise<void> {
  await apiClient.delete(`/courses/${id}`)
}
import { apiClient } from './apiClient'
import type { CourseOffering, CourseOfferingFormData, CourseOfferingListParams } from '../types/courseOffering'
import type { PaginatedResponse } from '../types/pagination'
import type { Instructor } from '../types/instructor'
import { toSpatieParams } from '../utils/queryParams'
import type { OfferingEnrolledStudent } from '../types/courseOfferingStudent'
import type { RawPaginatedResponse } from '../types/rawPagination'

export async function listCourseOfferings(
  params: CourseOfferingListParams
): Promise<PaginatedResponse<CourseOffering>> {
  const response = await apiClient.get<PaginatedResponse<CourseOffering>>('/course-offerings', {
    params: toSpatieParams(params, ['course_id', 'academic_term_id', 'instructor_id', 'status']),
  })
  return response.data
}

export async function getCourseOffering(id: number): Promise<CourseOffering> {
  const response = await apiClient.get<CourseOffering>(`/course-offerings/${id}`)
  return response.data
}

export async function createCourseOffering(data: CourseOfferingFormData): Promise<CourseOffering> {
  const response = await apiClient.post<CourseOffering>('/course-offerings', data)
  return response.data
}

export async function updateCourseOffering(id: number, data: CourseOfferingFormData): Promise<CourseOffering> {
  const response = await apiClient.patch<CourseOffering>(`/course-offerings/${id}`, data)
  return response.data
}

export async function deleteCourseOffering(id: number): Promise<void> {
  await apiClient.delete(`/course-offerings/${id}`)
}


export async function listInstructors(): Promise<Instructor[]> {
  const response = await apiClient.get<Instructor[]>('/instructors')
  return response.data
}

export interface FilterOption {
  id: number
  label: string
}

export interface DerivedFilterOptions {
  courses: FilterOption[]
  terms: FilterOption[]
  instructors: FilterOption[]
}

export async function listDerivedFilterOptions(): Promise<DerivedFilterOptions> {
  const response = await apiClient.get<PaginatedResponse<CourseOffering>>('/course-offerings', {
    params: { per_page: 100 },
  })

  const courseMap = new Map<number, string>()
  const termMap = new Map<number, string>()
  const instructorMap = new Map<number, string>()

  for (const offering of response.data.data) {
    courseMap.set(offering.course.id, `${offering.course.course_code} — ${offering.course.course_title}`)
    termMap.set(offering.academic_term.id, `${offering.academic_term.academic_year} — ${offering.academic_term.semester}`)
    if (offering.instructor) {
      instructorMap.set(offering.instructor.id, offering.instructor.name)
    }
  }

  return {
    courses: Array.from(courseMap, ([id, label]) => ({ id, label })),
    terms: Array.from(termMap, ([id, label]) => ({ id, label })),
    instructors: Array.from(instructorMap, ([id, label]) => ({ id, label })),
  }
}

export async function listOfferingStudents(
  offeringId: number,
  page: number
): Promise<RawPaginatedResponse<OfferingEnrolledStudent>> {
  const response = await apiClient.get<RawPaginatedResponse<OfferingEnrolledStudent>>(
    `/course-offerings/${offeringId}/students`,
    { params: { page, per_page: 20 } }
  )
  return response.data
}
export interface NavItem {
  label: string
  path: string
  roles: string[] // roles that can see this item; empty array = everyone
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', roles: [] },
  { label: 'Account', path: '/profile', roles: [] },
  { label: 'Students', path: '/students', roles: ['administrator', 'registrar', 'instructor', 'student'] },
  { label: 'Programs', path: '/programs', roles: ['administrator', 'registrar'] },
  { label: 'Courses', path: '/courses', roles: ['administrator', 'registrar'] },
  { label: 'Academic Terms', path: '/academic-terms', roles: ['administrator', 'registrar'] },
  { label: 'Course Offerings', path: '/course-offerings', roles: [] },
  { label: 'Enrollments', path: '/enrollments', roles: [] },
  { label: 'Academic Record', path: '/academic-record', roles: [] },
  // { label: 'Grades', path: '/grades', roles: [] },
]

export function visibleNavItems(userRoles: string[]): NavItem[] {
  return NAV_ITEMS.filter(
    (item) => item.roles.length === 0 || item.roles.some((r) => userRoles.includes(r))
  )
}
export interface User {
  id: number
  name: string
  email: string
  roles: string[]
  student_id?: number | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}
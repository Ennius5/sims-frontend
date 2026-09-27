export interface UserAccount {
  id: number
  name: string
  email: string
  roles: string[]
  status: 'ACTIVE' | 'INACTIVE'
}
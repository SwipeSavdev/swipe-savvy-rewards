export type UserStatus = 'active' | 'invited' | 'suspended'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'support' | 'analyst'
  status: UserStatus
  lastLoginAt?: string
  createdAt: string
}

export interface CustomerUser {
  id: string
  name: string
  email: string
  phone?: string
  status: UserStatus
  createdAt: string
}

export interface UsersListResponse<T> {
  items: T[]
  total: number
}

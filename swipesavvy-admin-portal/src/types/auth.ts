export type UserRole = 'super_admin' | 'admin' | 'support' | 'analyst'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
}

export interface AuthSession {
  token: string
  user: AuthUser
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  session: AuthSession
}

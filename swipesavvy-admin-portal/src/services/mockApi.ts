import { sleep } from '@/utils/misc'
import type { LoginRequest, LoginResponse } from '@/types/auth'
import type { DashboardOverview } from '@/types/dashboard'
import type { Paginated } from '@/types/common'
import type { CustomerUser, AdminUser } from '@/types/users'
import type { Merchant } from '@/types/merchants'
import type { SupportDashboardStats, SupportTicket } from '@/types/support'
import type { AuditLogEntry } from '@/types/audit'
import type { FeatureFlag } from '@/types/featureFlags'
import type { AiCampaign } from '@/types/aiMarketing'
import {
  demoAdminUsers,
  demoAiCampaigns,
  demoAuditLogs,
  demoCustomerUsers,
  demoDashboardOverview,
  demoFeatureFlags,
  demoMerchants,
  demoSupportStats,
  demoSupportTickets,
} from '@/services/mockData'

const DEMO_EMAIL = 'admin@swipesavvy.com'
const DEMO_PASSWORD = 'Admin123!'

export const demoCredentials = {
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
}

export async function login(req: LoginRequest): Promise<LoginResponse> {
  await sleep(450)
  if (req.email.trim().toLowerCase() === DEMO_EMAIL && req.password === DEMO_PASSWORD) {
    return {
      session: {
        token: 'demo_token_123',
        user: {
          id: 'au_1',
          name: 'Avery Morgan',
          email: DEMO_EMAIL,
          role: 'super_admin',
        },
      },
    }
  }
  throw new Error('Invalid email or password.')
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  await sleep(350)
  return demoDashboardOverview
}

function paginate<T>(items: T[], page: number, pageSize: number): Paginated<T> {
  const total = items.length
  const start = (page - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
  }
}

export async function getCustomerUsers(params?: {
  page?: number
  pageSize?: number
  query?: string
  search?: string
  status?: string
}): Promise<Paginated<CustomerUser>> {
  await sleep(400)
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const searchTerm = (params?.query ?? params?.search ?? '').trim().toLowerCase()

  const filtered = searchTerm
    ? demoCustomerUsers.filter((u) => u.name.toLowerCase().includes(searchTerm) || u.email.toLowerCase().includes(searchTerm))
    : demoCustomerUsers

  return paginate(filtered, page, pageSize)
}

export async function getAdminUsers(params?: {
  page?: number
  pageSize?: number
  query?: string
  search?: string
}): Promise<Paginated<AdminUser>> {
  await sleep(300)
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const searchTerm = (params?.query ?? params?.search ?? '').trim().toLowerCase()

  const filtered = searchTerm
    ? demoAdminUsers.filter((u) => u.name.toLowerCase().includes(searchTerm) || u.email.toLowerCase().includes(searchTerm))
    : demoAdminUsers

  return paginate(filtered, page, pageSize)
}

export async function getMerchants(params?: {
  page?: number
  pageSize?: number
  query?: string
  search?: string
  status?: string
}): Promise<Paginated<Merchant>> {
  await sleep(400)
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const searchTerm = (params?.query ?? params?.search ?? '').trim().toLowerCase()

  const filtered = searchTerm
    ? demoMerchants.filter((m) => m.name.toLowerCase().includes(searchTerm) || m.category.toLowerCase().includes(searchTerm))
    : demoMerchants

  return paginate(filtered, page, pageSize)
}

export async function getSupportStats(): Promise<SupportDashboardStats> {
  await sleep(250)
  return demoSupportStats
}

export async function getSupportTickets(params?: {
  page?: number
  pageSize?: number
  query?: string
  search?: string
  status?: string
}): Promise<Paginated<SupportTicket>> {
  await sleep(450)
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const searchTerm = (params?.query ?? params?.search ?? '').trim().toLowerCase()

  const filtered = searchTerm
    ? demoSupportTickets.filter(
        (t) =>
          t.subject.toLowerCase().includes(searchTerm) ||
          t.customerName.toLowerCase().includes(searchTerm) ||
          t.customerEmail.toLowerCase().includes(searchTerm),
      )
    : demoSupportTickets

  return paginate(filtered, page, pageSize)
}

export async function getAuditLogs(params?: {
  page?: number
  pageSize?: number
  query?: string
}): Promise<Paginated<AuditLogEntry>> {
  await sleep(350)
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  return paginate(demoAuditLogs, page, pageSize)
}

export async function getFeatureFlags(params?: {
  page?: number
  pageSize?: number
  query?: string
  search?: string
}): Promise<Paginated<FeatureFlag>> {
  await sleep(300)
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const searchTerm = (params?.query ?? params?.search ?? '').trim().toLowerCase()

  const filtered = searchTerm
    ? demoFeatureFlags.filter((f) => f.name.toLowerCase().includes(searchTerm) || f.key.toLowerCase().includes(searchTerm))
    : demoFeatureFlags

  return paginate(filtered, page, pageSize)
}

export async function getAiCampaigns(params?: {
  page?: number
  pageSize?: number
  query?: string
  search?: string
}): Promise<Paginated<AiCampaign>> {
  await sleep(300)
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const searchTerm = (params?.query ?? params?.search ?? '').trim().toLowerCase()

  const filtered = searchTerm
    ? demoAiCampaigns.filter((c) => c.name.toLowerCase().includes(searchTerm))
    : demoAiCampaigns

  return paginate(filtered, page, pageSize)
}

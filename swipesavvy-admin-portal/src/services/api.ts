// Single place to import APIs. Switches between mock and real based on environment.

import * as realApi from './apiClient'
import * as mockApi from './mockApi'

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'

// Create a unified API interface that works with both mock and real API
const createApi = () => {
  if (USE_MOCK_API) {
    return {
      authApi: {
        async login(email: string, password: string) {
          return mockApi.login({ email, password })
        },
      },
      dashboardApi: {
        async getOverview() {
          return mockApi.getDashboardOverview()
        },
        async getAnalyticsOverview() {
          return mockApi.getDashboardOverview()
        },
        async getTransactionsChart(days = 30) {
          return { data: [], title: 'Transactions', subtitle: `Last ${days} days` }
        },
        async getRevenueChart(days = 30) {
          return { data: [], title: 'Revenue', subtitle: `Last ${days} days` }
        },
      },
      supportApi: {
        async getStats() {
          return mockApi.getSupportStats()
        },
      },
      supportTicketsApi: {
        async listTickets(page?: any, pageSize?: any, status?: any, query?: any) {
          const res = await mockApi.getSupportTickets({ page, pageSize, status, query })
          return { tickets: res.items, total: res.total, page: res.page, pageSize: res.pageSize }
        },
        async getSupportTickets(params?: any) {
          const res = await mockApi.getSupportTickets(params)
          return { tickets: res.items, total: res.total, page: res.page, pageSize: res.pageSize }
        },
        async createTicket(data: any) {
          throw new Error('Create ticket not implemented in mock API')
        },
        async updateTicket(id: string, data: any) {
          throw new Error('Update ticket not implemented in mock API')
        },
        async updateTicketStatus(id: string, status: string) {
          throw new Error('Update status not implemented in mock API')
        },
        async deleteTicket(id: string) {
          throw new Error('Delete ticket not implemented in mock API')
        },
      },
      usersApi: {
        async listUsers(params?: any) {
          return mockApi.getCustomerUsers(params)
        },
        async getCustomerUsers(params?: any) {
          return mockApi.getCustomerUsers(params)
        },
        async getAdminUsers(params?: any) {
          return mockApi.getAdminUsers(params)
        },
        async createUser(data: any) {
          throw new Error('Create user not implemented in mock API')
        },
        async getUser(userId: string) {
          throw new Error('Get user not implemented in mock API')
        },
        async updateUserStatus(userId: string, status: string) {
          throw new Error('Update user status not implemented in mock API')
        },
        async getStats() {
          return { total_users: 0, active_users: 0, suspended_users: 0 }
        },
      },
      adminUsersApi: {
        async listAdminUsers(page?: any, perPage?: any, role?: any, search?: any) {
          return mockApi.getAdminUsers({ page, pageSize: perPage, search })
        },
        async getAdminUsers(params?: any) {
          return mockApi.getAdminUsers(params)
        },
        async createAdminUser(data: any) {
          throw new Error('Create admin user not implemented in mock API')
        },
        async updateAdminUser(id: string, data: any) {
          throw new Error('Update admin user not implemented in mock API')
        },
        async deleteAdminUser(id: string) {
          throw new Error('Delete admin user not implemented in mock API')
        },
      },
      merchantsApi: {
        async listMerchants(params?: any) {
          return mockApi.getMerchants(params)
        },
        async getMerchants(params?: any) {
          return mockApi.getMerchants(params)
        },
        async getMerchant(merchantId: string) {
          throw new Error('Get merchant not implemented in mock API')
        },
        async updateMerchantStatus(id: string, status: string) {
          throw new Error('Update merchant status not implemented in mock API')
        },
      },
      auditApi: {
        async getAuditLogs(params?: any) {
          return mockApi.getAuditLogs(params)
        },
      },
      featureFlagsApi: {
        async listFlags(page?: any, perPage?: any, search?: any) {
          const res = await mockApi.getFeatureFlags({ page, pageSize: perPage, search })
          return { flags: res.items, total: res.total, page: res.page, per_page: res.pageSize }
        },
        async getFeatureFlags(params?: any) {
          return mockApi.getFeatureFlags(params)
        },
        async toggleFlag(flagId: string, enabled: boolean) {
          return { success: true, enabled }
        },
        async updateRollout(flagId: string, rollout: number) {
          return { success: true, rollout }
        },
      },
      aiMarketingApi: {
        async getAiCampaigns(params?: any) {
          return mockApi.getAiCampaigns(params)
        },
      },
      supportDashboardApi: {
        async getStats() {
          return mockApi.getSupportStats()
        },
      },
      settingsApi: {
        async getSettings() {
          return { success: true, settings: {} }
        },
        async updateSettings(data: any) {
          return { success: true }
        },
      },
      auditLogsApi: {
        async listLogs(page?: any, perPage?: any, action?: string, actor?: string) {
          const res = await mockApi.getAuditLogs({ page, pageSize: perPage })
          return { logs: res.items, total: res.total, page: res.page, per_page: res.pageSize }
        },
        async getAuditLogs(params?: any) {
          return mockApi.getAuditLogs(params)
        },
      },
      aiCampaignsApi: {
        async listCampaigns(page?: any, perPage?: any) {
          const res = await mockApi.getAiCampaigns({ page, pageSize: perPage })
          return { campaigns: res.items, total: res.total }
        },
        async getAiCampaigns(params?: any) {
          return mockApi.getAiCampaigns(params)
        },
        async publishCampaign(campaignId: string) {
          return { success: true, id: campaignId, status: 'published' }
        },
        async updateCampaign(campaignId: string, data: any) {
          return { success: true, id: campaignId, ...data }
        },
        async generateCopy(data: any) {
          return {
            headline: 'AI Generated Headline',
            description: 'AI Generated Description',
            cta: 'Click Here',
            selling_points: ['Point 1', 'Point 2'],
          }
        },
        async getAudienceInsights(data: any) {
          return {
            characteristics: 'Your audience characteristics',
            opportunities: ['Opportunity 1', 'Opportunity 2'],
            offer_recommendation: 'Best offer type',
            channels: ['email', 'push'],
            challenges: ['Challenge 1'],
          }
        },
        async createCampaign(data: any) {
          return { success: true, id: `camp-${Date.now()}`, ...data }
        },
      },
    }
  }

  // Use real API - expose all API namespaces from apiClient
  return {
    authApi: realApi.authApi,
    dashboardApi: realApi.dashboardApi,
    supportApi: realApi.supportApi,
    supportTicketsApi: realApi.supportTicketsApi,
    usersApi: realApi.usersApi,
    adminUsersApi: realApi.adminUsersApi,
    merchantsApi: realApi.merchantsApi,
    featureFlagsApi: realApi.featureFlagsApi,
    aiCampaignsApi: realApi.aiCampaignsApi,
    auditLogsApi: realApi.auditLogsApi,
    settingsApi: realApi.settingsApi,
    supportDashboardApi: realApi.supportApi,
    auditApi: realApi.auditLogsApi,
    aiMarketingApi: realApi.aiCampaignsApi,
  }
}

const Api = createApi()

export { Api }
export const apiClient = realApi.apiClient
export const MockApi = mockApi

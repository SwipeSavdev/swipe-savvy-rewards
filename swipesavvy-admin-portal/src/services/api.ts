// Single place to import APIs. Switches between mock and real based on environment.

import * as realApi from './apiClient'
import * as mockApi from './mockApi'

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'

// Create a unified API interface
const Api = USE_MOCK_API ? {
  authApi: {
    async login(email: string, password: string) {
      return mockApi.login({ email, password })
    },
  },
  dashboardApi: {
    async getOverview() {
      return mockApi.getDashboardOverview()
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
    async getFeatureFlags(params?: any) {
      return mockApi.getFeatureFlags(params)
    },
    async toggleFlag(key: string) {
      throw new Error('Toggle flag not implemented in mock API')
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
  settingsApi: {} as any,
  auditLogsApi: {
    async getAuditLogs(params?: any) {
      return mockApi.getAuditLogs(params)
    },
  },
  aiCampaignsApi: {
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
} : (realApi as any)

export { Api }
export const apiClient = (realApi as any).apiClient
export const MockApi = mockApi

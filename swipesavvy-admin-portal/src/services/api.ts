// Single place to import APIs. Switches between mock and real based on environment.
// Also integrates with the event bus for cross-module communication.

import * as realApi from './apiClient'
import * as mockApi from './mockApi'
import { eventBus, type EventType } from '@/store/eventBusStore'

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'

// Helper to wrap API methods with event emission
function withEventEmit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  eventType: EventType,
  source: string
): T {
  return (async (...args: Parameters<T>) => {
    const result = await fn(...args)
    eventBus.emit(eventType, result, source)
    return result
  }) as T
}

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
        async createMerchant(data: any) {
          return { success: true, merchant: { id: `mock-${Date.now()}`, ...data } }
        },
        async updateMerchant(merchantId: string, data: any) {
          return { success: true, merchant: { id: merchantId, ...data } }
        },
        async deleteMerchant(merchantId: string) {
          return { success: true }
        },
        async getStats() {
          return { total_merchants: 10, active_merchants: 8, suspended_merchants: 2, total_monthly_volume: 250000, avg_success_rate: 95.5, top_performer: 'Acme Corp' }
        },
        async getOnboarding(merchantId: string) {
          return { success: true, has_onboarding: false, onboarding: null }
        },
        async startOnboarding(merchantId: string) {
          return { success: true, onboarding: { id: `onb-${Date.now()}`, merchant_id: merchantId, ext_ref_id: `SS-${Date.now()}`, status: 'draft', step: 1, completion_percentage: 0 } }
        },
        async updateOnboarding(merchantId: string, data: any) {
          return { success: true, onboarding: { ...data, merchant_id: merchantId } }
        },
        async submitOnboarding(merchantId: string) {
          return { success: true, message: 'Submitted (mock)', onboarding: { status: 'submitted' } }
        },
        async getOnboardingStatus(merchantId: string) {
          return { success: true, status: 'submitted', fiserv_status: 'Pending' }
        },
        async uploadOnboardingDocument(merchantId: string, docType: string, file: File) {
          return { success: true, document: { id: `doc-${Date.now()}`, type: docType, filename: file.name } }
        },
        async resubmitOnboarding(merchantId: string) {
          return { success: true }
        },
        async resubmitToCredit(merchantId: string) {
          return { success: true }
        },
        async resubmitToBOS(merchantId: string) {
          return { success: true }
        },
        async deleteOnboarding(merchantId: string) {
          return { success: true }
        },
        // E-Signature mock methods
        async sendEsignRequest(merchantId: string, data: { signer_name: string; signer_email: string; signer_title?: string }) {
          return { success: true, document_id: `esign-${Date.now()}`, message: 'E-signature request sent (mock)' }
        },
        async checkEsignStatus(merchantId: string, documentId: string) {
          return { completed: false, status: 'pending', signed_at: undefined }
        },
        async resendEsignRequest(merchantId: string, documentId: string) {
          return { success: true, message: 'E-signature request resent (mock)' }
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
        async uploadBrandingImage(formData: FormData) {
          return { success: true, image: null }
        },
        async deleteBrandingImage(imageId: string) {
          return { success: true }
        },
        async getBrandingImages() {
          return { images: [] }
        },
        async uploadBrandingAsset(type: string, file: File) {
          return { success: true }
        },
        async getApiQuotas() {
          return { remaining: 5000, total: 5000, resetTime: new Date().toISOString() }
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
      // Charity API (mock)
      charityApi: {
        async listCharities(params?: any) {
          return [
            { id: '1', name: 'Red Cross', email: 'contact@redcross.org', category: 'humanitarian', status: 'approved', completionPercentage: 100 },
            { id: '2', name: 'UNICEF', email: 'info@unicef.org', category: 'children', status: 'pending', completionPercentage: 75 },
          ]
        },
        async getCharity(charityId: string) {
          return { id: charityId, name: 'Mock Charity', email: 'charity@example.com', category: 'general', status: 'pending' }
        },
        async createCharity(data: any) {
          return { success: true, charity: { id: `charity-${Date.now()}`, ...data, status: 'incomplete' } }
        },
        async updateCharity(charityId: string, data: any) {
          return { success: true, charity: { id: charityId, ...data } }
        },
        async deleteCharity(charityId: string) {
          return { success: true }
        },
        async approveCharity(charityId: string) {
          return { success: true, charity: { id: charityId, status: 'approved' } }
        },
        async rejectCharity(charityId: string, notes?: string) {
          return { success: true, charity: { id: charityId, status: 'rejected', notes } }
        },
      },
      // AI Concierge API (mock)
      aiConciergeApi: {
        async sendMessage(_message: string, conversationId?: string) {
          return {
            response: 'This is a mock AI response. The AI concierge would normally analyze your request and provide helpful support suggestions.',
            conversation_id: conversationId || `conv-${Date.now()}`,
          }
        },
        async getConversation(conversationId: string) {
          return { id: conversationId, messages: [], created_at: new Date().toISOString() }
        },
        async listConversations(page?: any, perPage?: any) {
          return { conversations: [], total: 0, page: page || 1, per_page: perPage || 20 }
        },
        async getStats() {
          return { total_conversations: 0, avg_response_time: '2s', satisfaction_rate: 95 }
        },
        async getSuggestedResponses(_ticketId: string) {
          return { suggestions: ['Thank you for reaching out.', 'I understand your concern.', 'Let me help you with that.'] }
        },
        async analyzeTicket(_ticketId: string) {
          return { sentiment: 'neutral', priority_suggestion: 'medium', category_suggestion: 'general' }
        },
      },
      // RBAC API (mock)
      rbacApi: {
        async listRoles(_page?: any, _perPage?: any, _search?: string) {
          return {
            roles: [
              { id: '1', name: 'super_admin', display_name: 'Super Admin', description: 'Full access', permissions: ['*'], user_count: 1, status: 'active' },
              { id: '2', name: 'admin', display_name: 'Admin', description: 'Administrative access', permissions: [], user_count: 3, status: 'active' },
              { id: '3', name: 'support_manager', display_name: 'Support Manager', description: 'Support team access', permissions: [], user_count: 5, status: 'active' },
            ],
            total: 3,
          }
        },
        async getRole(roleId: string) {
          return { id: roleId, name: 'admin', display_name: 'Admin', description: 'Admin role', permissions: [], status: 'active' }
        },
        async createRole(data: any) {
          return { success: true, role: { id: `role-${Date.now()}`, ...data } }
        },
        async updateRole(roleId: string, data: any) {
          return { success: true, role: { id: roleId, ...data } }
        },
        async deleteRole(_roleId: string) {
          return { success: true }
        },
        async listPolicies(_page?: any, _perPage?: any, _search?: string) {
          return {
            policies: [
              { id: '1', name: 'full_access', display_name: 'Full Access', description: 'Full system access', resource: '*', actions: ['*'], effect: 'allow', status: 'active' },
              { id: '2', name: 'read_only', display_name: 'Read Only', description: 'Read only access', resource: '*', actions: ['read'], effect: 'allow', status: 'active' },
            ],
            total: 2,
          }
        },
        async getPolicy(policyId: string) {
          return { id: policyId, name: 'policy', display_name: 'Policy', description: 'A policy', resource: '*', actions: ['read'], effect: 'allow', status: 'active' }
        },
        async createPolicy(data: any) {
          return { success: true, policy: { id: `policy-${Date.now()}`, ...data } }
        },
        async updatePolicy(policyId: string, data: any) {
          return { success: true, policy: { id: policyId, ...data } }
        },
        async deletePolicy(_policyId: string) {
          return { success: true }
        },
        async listPermissions(_page?: any, _perPage?: any, _search?: string) {
          return {
            permissions: [
              { id: '1', name: 'users:read', display_name: 'Read Users', description: 'Can view users', category: 'User Management', resource: 'users', action: 'read' },
              { id: '2', name: 'users:write', display_name: 'Write Users', description: 'Can create/update users', category: 'User Management', resource: 'users', action: 'write' },
              { id: '3', name: 'merchants:read', display_name: 'Read Merchants', description: 'Can view merchants', category: 'Merchant Management', resource: 'merchants', action: 'read' },
            ],
            total: 3,
          }
        },
        async createPermission(data: any) {
          return { success: true, permission: { id: `perm-${Date.now()}`, ...data } }
        },
        async deletePermission(_permissionId: string) {
          return { success: true }
        },
      },
    }
  }

  // Use real API - expose all API namespaces from apiClient
  // Wrap CRUD operations with event emission for cross-module updates
  return {
    authApi: realApi.authApi,
    dashboardApi: realApi.dashboardApi,
    supportApi: realApi.supportApi,
    supportTicketsApi: {
      ...realApi.supportTicketsApi,
      createTicket: withEventEmit(realApi.supportTicketsApi.createTicket, 'ticket:created', 'supportTicketsApi'),
      updateTicketStatus: withEventEmit(realApi.supportTicketsApi.updateTicketStatus, 'ticket:status_changed', 'supportTicketsApi'),
    },
    usersApi: {
      ...realApi.usersApi,
      createUser: withEventEmit(realApi.usersApi.createUser, 'user:created', 'usersApi'),
      deleteUser: withEventEmit(realApi.usersApi.deleteUser, 'user:deleted', 'usersApi'),
      updateUserStatus: withEventEmit(realApi.usersApi.updateUserStatus, 'user:status_changed', 'usersApi'),
    },
    adminUsersApi: {
      ...realApi.adminUsersApi,
      createAdminUser: withEventEmit(realApi.adminUsersApi.createAdminUser, 'admin_user:created', 'adminUsersApi'),
      deleteAdminUser: withEventEmit(realApi.adminUsersApi.deleteAdminUser, 'admin_user:deleted', 'adminUsersApi'),
    },
    merchantsApi: {
      ...realApi.merchantsApi,
      createMerchant: withEventEmit(realApi.merchantsApi.createMerchant, 'merchant:created', 'merchantsApi'),
      updateMerchant: withEventEmit(realApi.merchantsApi.updateMerchant, 'merchant:updated', 'merchantsApi'),
      deleteMerchant: withEventEmit(realApi.merchantsApi.deleteMerchant, 'merchant:deleted', 'merchantsApi'),
      updateMerchantStatus: withEventEmit(realApi.merchantsApi.updateMerchantStatus, 'merchant:status_changed', 'merchantsApi'),
      startOnboarding: withEventEmit(realApi.merchantsApi.startOnboarding, 'merchant:onboarding_started', 'merchantsApi'),
      submitOnboarding: withEventEmit(realApi.merchantsApi.submitOnboarding, 'merchant:onboarding_submitted', 'merchantsApi'),
    },
    featureFlagsApi: {
      ...realApi.featureFlagsApi,
      toggleFlag: withEventEmit(realApi.featureFlagsApi.toggleFlag, 'feature_flag:toggled', 'featureFlagsApi'),
      createFlag: withEventEmit(realApi.featureFlagsApi.createFlag, 'feature_flag:created', 'featureFlagsApi'),
      updateFlag: withEventEmit(realApi.featureFlagsApi.updateFlag, 'feature_flag:updated', 'featureFlagsApi'),
      deleteFlag: withEventEmit(realApi.featureFlagsApi.deleteFlag, 'feature_flag:deleted', 'featureFlagsApi'),
    },
    aiCampaignsApi: {
      ...realApi.aiCampaignsApi,
      createCampaign: withEventEmit(realApi.aiCampaignsApi.createCampaign, 'campaign:created', 'aiCampaignsApi'),
      publishCampaign: withEventEmit(realApi.aiCampaignsApi.publishCampaign, 'campaign:published', 'aiCampaignsApi'),
    },
    auditLogsApi: realApi.auditLogsApi,
    settingsApi: {
      ...realApi.settingsApi,
      updateSettings: withEventEmit(realApi.settingsApi.updateSettings, 'settings:updated', 'settingsApi'),
    },
    supportDashboardApi: realApi.supportApi,
    auditApi: realApi.auditLogsApi,
    aiMarketingApi: realApi.aiCampaignsApi,
    // New marketing APIs
    marketingAnalyticsApi: realApi.marketingAnalyticsApi,
    abTestingApi: realApi.abTestingApi,
    audienceSegmentsApi: realApi.audienceSegmentsApi,
    // Charity & AI Concierge APIs
    charityApi: {
      ...realApi.charityApi,
      createCharity: withEventEmit(realApi.charityApi.createCharity, 'charity:created', 'charityApi'),
      updateCharity: withEventEmit(realApi.charityApi.updateCharity, 'charity:updated', 'charityApi'),
      deleteCharity: withEventEmit(realApi.charityApi.deleteCharity, 'charity:deleted', 'charityApi'),
      approveCharity: withEventEmit(realApi.charityApi.approveCharity, 'charity:approved', 'charityApi'),
      rejectCharity: withEventEmit(realApi.charityApi.rejectCharity, 'charity:rejected', 'charityApi'),
    },
    aiConciergeApi: realApi.aiConciergeApi,
    // RBAC APIs
    rbacApi: realApi.rbacApi,
  }
}

const Api = createApi()

export { Api }
export const apiClient = realApi.apiClient
export const MockApi = mockApi

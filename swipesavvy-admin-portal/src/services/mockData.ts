import type { DashboardOverview, RecentActivityItem } from '@/types/dashboard'
import type { CustomerUser, AdminUser } from '@/types/users'
import type { Merchant } from '@/types/merchants'
import type { SupportTicket, SupportDashboardStats } from '@/types/support'
import type { AuditLogEntry } from '@/types/audit'
import type { FeatureFlag } from '@/types/featureFlags'
import type { AiCampaign } from '@/types/aiMarketing'

function isoMinutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

export const demoDashboardOverview: DashboardOverview = {
  stats: {
    users: { label: 'Users', value: 12842, trendPct: 8.4, trendDirection: 'up' },
    transactions: { label: 'Transactions', value: 238741, trendPct: 3.2, trendDirection: 'up' },
    revenue: { label: 'Revenue', value: 1864320, trendPct: 1.1, trendDirection: 'up' },
    growth: { label: 'Growth', value: 14, trendPct: -0.8, trendDirection: 'down' },
  },
  recentActivity: [
    {
      id: 'act_1',
      type: 'transaction',
      title: 'Settlement batch completed',
      description: 'Batch #4821 processed successfully.',
      createdAt: isoMinutesAgo(8),
      status: 'success',
    },
    {
      id: 'act_2',
      type: 'support',
      title: 'New ticket created',
      description: 'Card declined — user needs assistance.',
      createdAt: isoMinutesAgo(22),
      status: 'info',
    },
    {
      id: 'act_3',
      type: 'merchant',
      title: 'Merchant onboarding pending',
      description: 'KYC review requested for “Northside Market”.',
      createdAt: isoMinutesAgo(41),
      status: 'warning',
    },
    {
      id: 'act_4',
      type: 'system',
      title: 'Feature flag updated',
      description: '“Instant Payouts (Beta)” rollout set to 25%.',
      createdAt: isoMinutesAgo(79),
      status: 'info',
    },
  ],
}

export const demoCustomerUsers: CustomerUser[] = Array.from({ length: 32 }).map((_, i) => ({
  id: `cu_${i + 1}`,
  name: `Customer ${i + 1}`,
  email: `customer${i + 1}@example.com`,
  phone: i % 3 === 0 ? `+1 555 01${String(i).padStart(2, '0')}` : undefined,
  status: i % 9 === 0 ? 'suspended' : 'active',
  createdAt: isoMinutesAgo(60 * 24 * (i + 2)),
}))

export const demoAdminUsers: AdminUser[] = [
  {
    id: 'au_1',
    name: 'Avery Morgan',
    email: 'admin@swipesavvy.com',
    role: 'super_admin',
    status: 'active',
    lastLoginAt: isoMinutesAgo(12),
    createdAt: isoMinutesAgo(60 * 24 * 250),
  },
  {
    id: 'au_2',
    name: 'Jordan Lee',
    email: 'support@swipesavvy.com',
    role: 'support',
    status: 'active',
    lastLoginAt: isoMinutesAgo(95),
    createdAt: isoMinutesAgo(60 * 24 * 180),
  },
  {
    id: 'au_3',
    name: 'Taylor Singh',
    email: 'analyst@swipesavvy.com',
    role: 'analyst',
    status: 'invited',
    createdAt: isoMinutesAgo(60 * 24 * 5),
  },
]

export const demoMerchants: Merchant[] = Array.from({ length: 18 }).map((_, i) => ({
  id: `m_${i + 1}`,
  name: i % 4 === 0 ? `Northside Market` : `Merchant ${i + 1}`,
  email: `merchant${i + 1}@example.com`,
  phone: `+1-555-${String(i + 1).padStart(4, '0')}`,
  category: ['Grocery', 'Restaurant', 'Retail', 'Services'][i % 4],
  status: i % 7 === 0 ? 'pending' : 'active',
  createdAt: isoMinutesAgo(60 * 24 * (i + 6)),
  joinDate: isoMinutesAgo(60 * 24 * (i + 6)),
  location: ['San Francisco', 'New York', 'Los Angeles', 'Chicago'][i % 4],
  country: 'US',
  transactionCount: 100 + i * 50,
  successRate: 0.98 + (Math.random() * 0.02),
  monthlyVolume: 5000 + i * 1000,
  avgTransaction: 50 + i * 5,
}))

export const demoSupportStats: SupportDashboardStats = {
  openTickets: 18,
  inProgressTickets: 7,
  resolvedToday: 12,
  firstResponseTimeHours: 1.2,
  avgResponseTime: 2.5,
  slaMetrics: {
    firstResponseSLA: 88,
    resolutionSLA: 72,
    csat: 4.6,
  },
}

export const demoSupportTickets: SupportTicket[] = Array.from({ length: 26 }).map((_, i) => ({
  id: `t_${i + 1}`,
  subject: ['Card declined', 'Refund request', 'Merchant dispute', 'Account access'][i % 4],
  description: `Issue details for ticket ${i + 1}. Customer is experiencing issues with their account and needs immediate assistance.`,
  customerName: `Customer ${i + 1}`,
  customerEmail: `customer${i + 1}@example.com`,
  status: (['open', 'in_progress', 'resolved', 'closed'] as const)[i % 4],
  priority: (['low', 'medium', 'high', 'urgent'] as const)[i % 4],
  createdAt: isoMinutesAgo(30 * (i + 1)),
  updatedAt: isoMinutesAgo(12 * (i + 1)),
}))

export const demoAuditLogs: AuditLogEntry[] = Array.from({ length: 24 }).map((_, i) => ({
  id: `al_${i + 1}`,
  actor: {
    id: i % 3 === 0 ? 'au_1' : 'au_2',
    name: i % 3 === 0 ? 'Avery Morgan' : 'Jordan Lee',
    email: i % 3 === 0 ? 'admin@swipesavvy.com' : 'support@swipesavvy.com',
  },
  action: (['login', 'support_ticket_update', 'feature_flag_update', 'user_update'] as const)[i % 4],
  target:
    i % 2 === 0
      ? {
          type: 'support_ticket',
          id: `t_${(i % 10) + 1}`,
          label: 'Support Ticket',
        }
      : undefined,
  ip: '10.14.22.3',
  userAgent: 'SwipeSavvyPortal/1.0',
  createdAt: isoMinutesAgo(17 * (i + 1)),
  meta: i % 4 === 2 ? { rolloutPct: 25 } : undefined,
}))

export const demoFeatureFlags: FeatureFlag[] = [
  {
    id: 'flag_1',
    key: 'instant_payouts_beta',
    name: 'Instant Payouts (Beta)',
    displayName: 'Instant Payouts (Beta)',
    description: 'Enable instant payouts for a percentage of merchants.',
    enabled: true,
    status: 'on',
    rolloutPercentage: 25,
    rolloutPct: 25,
    targetedUsers: ['user_1', 'user_2'],
    createdAt: isoMinutesAgo(200),
    updatedAt: isoMinutesAgo(70),
    createdBy: 'admin@swipesavvy.com',
    updatedBy: 'Avery Morgan',
    environment: 'production',
  },
  {
    id: 'flag_2',
    key: 'new_support_console',
    name: 'New Support Console',
    displayName: 'New Support Console',
    description: 'Modern ticket workflow and SLA dashboards.',
    enabled: false,
    status: 'off',
    rolloutPercentage: 0,
    rolloutPct: 0,
    targetedUsers: [],
    createdAt: isoMinutesAgo(60 * 24 * 5),
    updatedAt: isoMinutesAgo(60 * 24 * 2),
    createdBy: 'admin@swipesavvy.com',
    updatedBy: 'Jordan Lee',
    environment: 'staging',
  },
  {
    id: 'flag_3',
    key: 'ai_fraud_scoring',
    name: 'AI Fraud Scoring',
    displayName: 'AI Fraud Scoring',
    description: 'Experimental fraud scoring pipeline (internal only).',
    enabled: true,
    status: 'on',
    rolloutPercentage: 100,
    rolloutPct: 100,
    targetedUsers: ['user_1', 'user_3', 'user_5'],
    createdAt: isoMinutesAgo(60 * 24 * 10),
    updatedAt: isoMinutesAgo(60 * 5),
    createdBy: 'admin@swipesavvy.com',
    updatedBy: 'Avery Morgan',
    environment: 'production',
  },
]

export const demoAiCampaigns: AiCampaign[] = [
  {
    id: 'c_1',
    name: 'Winback — 30 Day Inactive',
    description: 'Re-engage inactive users with personalized offers',
    objective: 'winback',
    status: 'running',
    type: 'retention',
    targetAudience: 'Inactive for 30 days',
    audienceSize: 4210,
    reach: 4210,
    channel: 'email',
    startDate: isoMinutesAgo(60 * 24 * 5),
    endDate: isoMinutesAgo(60 * 24 * -10),
    budget: 2500,
    spent: 1200,
    engagement: 820,
    conversions: 145,
    roi: 1.5,
    createdBy: 'admin@swipesavvy.com',
    lastUpdatedAt: isoMinutesAgo(120),
    lastUpdated: isoMinutesAgo(120),
  },
  {
    id: 'c_2',
    name: 'Activation — New Users (Day 1)',
    description: 'Onboard and activate new user signups',
    objective: 'activation',
    status: 'running',
    type: 'promotional',
    targetAudience: 'New users',
    audienceSize: 980,
    reach: 980,
    channel: 'push',
    startDate: isoMinutesAgo(60 * 24 * 2),
    endDate: isoMinutesAgo(60 * 24 * -7),
    budget: 1500,
    spent: 800,
    engagement: 520,
    conversions: 125,
    roi: 1.8,
    createdBy: 'admin@swipesavvy.com',
    lastUpdatedAt: isoMinutesAgo(60 * 24),
    lastUpdated: isoMinutesAgo(60 * 24),
  },
  {
    id: 'c_3',
    name: 'Upsell — Premium Features',
    description: 'Promote premium feature upgrades',
    objective: 'upsell',
    status: 'draft',
    type: 'promotional',
    targetAudience: 'Mid-tier users',
    audienceSize: 2100,
    reach: 0,
    channel: 'email',
    startDate: isoMinutesAgo(60 * 24 * -5),
    endDate: isoMinutesAgo(60 * 24 * -15),
    budget: 3000,
    spent: 0,
    engagement: 0,
    conversions: 0,
    roi: 0,
    createdBy: 'admin@swipesavvy.com',
    lastUpdatedAt: isoMinutesAgo(60 * 48),
    lastUpdated: isoMinutesAgo(60 * 48),
  },
]

export const demoRecentActivity = demoDashboardOverview.recentActivity satisfies RecentActivityItem[]

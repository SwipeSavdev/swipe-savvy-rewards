export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type SupportTicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface SupportTicket {
  id: string
  subject: string
  description: string
  customerName: string
  customerEmail: string
  status: SupportTicketStatus
  priority: SupportTicketPriority
  createdAt: string
  updatedAt: string
  notes?: string
}

export interface SupportDashboardStats {
  openTickets: number
  inProgressTickets: number
  resolvedToday: number
  firstResponseTimeHours: number
  avgResponseTime: number
  slaMetrics: {
    firstResponseSLA: number
    resolutionSLA: number
    csat: number
  }
}

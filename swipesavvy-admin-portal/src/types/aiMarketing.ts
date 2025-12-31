export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'active'

export interface AiCampaign {
  id: string
  name: string
  description: string
  objective?: 'activation' | 'retention' | 'upsell' | 'winback'
  status: CampaignStatus
  type?: string
  targetAudience?: string
  audienceSize?: number
  reach?: number
  channel?: 'email' | 'sms' | 'push'
  startDate: string
  endDate: string
  budget: number
  spent: number
  engagement?: number
  conversions?: number
  roi: number
  createdBy: string
  lastUpdatedAt?: string
  lastUpdated?: string
  createdAt?: string
}

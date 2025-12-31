export type FeatureFlagStatus = 'on' | 'off'
export type FeatureCategory = 'authentication' | 'accounts' | 'transfers' | 'ai_concierge' | 'support' | 'rewards' | 'profile' | 'design'

export interface FeatureFlag {
  id: string
  key: string
  name: string
  displayName: string
  description: string
  category?: FeatureCategory
  enabled: boolean
  status?: FeatureFlagStatus
  rolloutPercentage: number
  rolloutPct?: number
  targetedUsers: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy?: string
  environment: string
}

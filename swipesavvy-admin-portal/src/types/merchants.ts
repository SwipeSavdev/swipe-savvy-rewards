export type MerchantStatus = 'active' | 'pending' | 'disabled'

export interface Merchant {
  id: string
  name: string
  email?: string
  phone?: string
  category: string
  status: MerchantStatus
  createdAt: string
  joinDate?: string
  location?: string
  country?: string
  transactionCount?: number
  successRate?: number
  monthlyVolume?: number
  avgTransaction?: number
}

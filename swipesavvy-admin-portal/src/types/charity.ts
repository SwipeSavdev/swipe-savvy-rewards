/**
 * Charity-related TypeScript types for the donations feature
 */

export interface CharityApplication {
  id: string
  name: string
  email: string
  phone: string
  category: string
  registrationNumber: string
  country: string
  website?: string
  documentsSubmitted: number
  status: 'pending' | 'approved' | 'rejected' | 'incomplete'
  completionPercentage: number
  submittedAt: string
  approvedAt?: string
  notes?: string
}

export interface CharityProfile extends CharityApplication {
  description: string
  yearFounded: number
  staffCount: number
  beneficiaryGroups: string[]
  impactMetrics: {
    peopleServed: number
    projectsRunning: number
    averageGrant: number
  }
  socialLinks?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
  bankDetails?: {
    accountHolder: string
    bankName: string
    accountNumber: string
    routingNumber: string
    swiftCode?: string
  }
}

export interface CharityDocument {
  id: string
  charityId: string
  documentType: 'registration_cert' | 'tax_id' | 'financial_statement' | 'impact_report' | 'bank_verification'
  fileName: string
  fileUrl: string
  uploadedAt: string
  expiresAt?: string
  verified: boolean
  verificationNotes?: string
}

export interface Donation {
  id: string
  charityId: string
  donorId: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  transactionId: string
  donatedAt: string
  completedAt?: string
  refundedAt?: string
  recurringDonation: boolean
  recurringFrequency?: 'monthly' | 'quarterly' | 'yearly'
  notes?: string
}

export interface DonationCampaign {
  id: string
  charityId: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  currency: string
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  imageUrl?: string
  category: string
  donationCount: number
  createdAt: string
}

export interface CharityStats {
  charityId: string
  totalDonations: number
  totalDonors: number
  totalAmount: number
  averageDonation: number
  largestDonation: number
  monthlyDonations: number
  monthlyAmount: number
  impactMetrics?: Record<string, number | string>
}

export interface CharityOnboardingStep {
  step: number
  title: string
  description: string
  required: boolean
  documentType: string
}

export interface CharityVerification {
  charityId: string
  verified: boolean
  verificationDate: string
  verifiedBy: string
  registrationVerified: boolean
  taxStatusVerified: boolean
  bankVerified: boolean
  documentsVerified: boolean
  notes?: string
  expiresAt: string
}

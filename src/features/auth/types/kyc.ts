/**
 * KYC (Know Your Customer) Types for SwipeSavvy Mobile App
 * Stub implementation for registration flow
 */

export type KYCTier = 'tier1' | 'tier2' | 'tier3';

export type KYCStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'requires_info';

export type DocumentType = 'drivers_license' | 'passport' | 'state_id' | 'ssn_card';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string; // ISO date string YYYY-MM-DD
}

export interface AddressInfo {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IdentityInfo {
  ssn: string; // Last 4 digits only for initial KYC
  documentType?: DocumentType;
  documentNumber?: string;
}

export interface SignupData {
  personal: PersonalInfo;
  address: AddressInfo;
  identity: IdentityInfo;
  password: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
}

export interface KYCVerificationResult {
  success: boolean;
  tier: KYCTier;
  status: KYCStatus;
  userId?: string;
  message?: string;
  requiresAdditionalInfo?: boolean;
  missingFields?: string[];
}

export interface SignupStep {
  id: number;
  title: string;
  subtitle: string;
  isComplete: boolean;
}

export const SIGNUP_STEPS: SignupStep[] = [
  { id: 1, title: 'Personal Info', subtitle: 'Name & contact details', isComplete: false },
  { id: 2, title: 'Address', subtitle: 'Residential address', isComplete: false },
  { id: 3, title: 'Identity', subtitle: 'Verify your identity', isComplete: false },
  { id: 4, title: 'Security', subtitle: 'Create password', isComplete: false },
];

export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' },
];

/**
 * ============================================================================
 * MERCHANT ONBOARDING PAGE - COMPLETE FISERV INTEGRATION
 * 6-Step Wizard with Full AccessOne North API Coverage
 * ============================================================================
 *
 * Complete onboarding form with all Fiserv AccessOne required sections:
 * 1. Business Information (Legal entity, address, industry)
 * 2. Owner/Principal Information (Supports up to 4 owners)
 * 3. Banking & Settlement (Bank accounts, funding configuration)
 * 4. Pricing & Entitlements (Rates, card networks, equipment)
 * 5. Site & Equipment (Location, terminal configuration, FE settings)
 * 6. Review & Submit (Documents, signatures, final confirmation)
 */

import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import ProgressBar from '@/components/ui/ProgressBar'
import Icon from '@/components/ui/Icon'
import FileInput from '@/components/ui/FileInput'
import Accordion from '@/components/ui/Accordion'
import SmartAddressInput, { type ParsedAddress } from '@/components/ui/SmartAddressInput'
import { Api } from '@/services/api'
import { useToastStore } from '@/store/toastStore'

// =============================================================================
// TYPES
// =============================================================================

interface OnboardingData {
  id: string
  merchant_id: string
  ext_ref_id: string
  mpa_id?: string
  north_number?: string
  status: string
  fiserv_status?: string
  fiserv_status_message?: string
  step: number
  completion_percentage: number
  [key: string]: any
}

interface OwnerData {
  id: string
  first_name: string
  middle_name: string
  last_name: string
  title: string
  ssn: string
  dob: string
  email: string
  phone: string
  address: ParsedAddress
  ownership_percent: string
  is_guarantor: boolean
  same_as_business: boolean
}

interface CardEntitlement {
  card_type: string
  enabled: boolean
  mcc_code?: string
}

interface EquipmentConfig {
  terminal_type: string
  terminal_quantity: number
  auto_close: boolean
  auto_close_time: string
  tip_enabled: boolean
  pin_debit_enabled: boolean
  contactless_enabled: boolean
  emv_enabled: boolean
}

interface SiteInfo {
  location_type: string
  square_footage: string
  num_registers: string
  seasonal_business: boolean
  seasonal_months: string[]
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STEPS = [
  { id: 1, title: 'Business', description: 'Legal entity & address' },
  { id: 2, title: 'Owners', description: 'Principal information' },
  { id: 3, title: 'Banking', description: 'Settlement accounts' },
  { id: 4, title: 'Pricing & Cards', description: 'Rates & entitlements' },
  { id: 5, title: 'Site & Equipment', description: 'Location & terminals' },
  { id: 6, title: 'Review & Sign', description: 'Documents & signature' },
]

const ENTITY_TYPES = [
  { value: 'S', label: 'Sole Proprietor' },
  { value: 'L', label: 'LLC - Limited Liability Company' },
  { value: 'C', label: 'Corporation' },
  { value: 'P', label: 'Partnership' },
  { value: 'T', label: 'Tax Exempt / Non-Profit' },
  { value: 'G', label: 'Government Entity' },
]

const OWNER_TITLES = [
  { value: 'Owner', label: 'Owner' },
  { value: 'President', label: 'President' },
  { value: 'CEO', label: 'CEO' },
  { value: 'CFO', label: 'CFO' },
  { value: 'Partner', label: 'Partner' },
  { value: 'Member', label: 'Member' },
  { value: 'Manager', label: 'Manager' },
]

const ACCOUNT_TYPES = [
  { value: 'C', label: 'Checking' },
  { value: 'S', label: 'Savings' },
]

const PROCESSING_TYPES = [
  { value: 'RETAIL', label: 'Retail / Card Present' },
  { value: 'ECOM', label: 'E-Commerce / Card Not Present' },
  { value: 'MOTO', label: 'Mail Order / Telephone Order' },
  { value: 'MIXED', label: 'Mixed (Retail + E-Commerce)' },
]

const PRICING_TYPES = [
  { value: 'IC+', label: 'Interchange Plus (Recommended)' },
  { value: 'FLAT', label: 'Flat Rate Pricing' },
  { value: 'TIERED', label: 'Tiered / Qualified Pricing' },
  { value: 'ERR', label: 'Enhanced Recover Reduced (ERR)' },
]

const TERMINAL_TYPES = [
  { value: 'CLOVER_FLEX', label: 'Clover Flex - Handheld' },
  { value: 'CLOVER_MINI', label: 'Clover Mini - Countertop' },
  { value: 'CLOVER_STATION', label: 'Clover Station - Full POS' },
  { value: 'VERIFONE_VX520', label: 'Verifone VX520' },
  { value: 'VERIFONE_VX680', label: 'Verifone VX680 (Wireless)' },
  { value: 'INGENICO_DESK3500', label: 'Ingenico Desk 3500' },
  { value: 'PAX_A920', label: 'PAX A920 Smart Terminal' },
  { value: 'VIRTUAL_TERMINAL', label: 'Virtual Terminal (Web-based)' },
  { value: 'MOBILE_READER', label: 'Mobile Card Reader' },
  { value: 'GATEWAY_ONLY', label: 'Payment Gateway Only' },
]

const LOCATION_TYPES = [
  { value: 'STOREFRONT', label: 'Storefront / Retail Location' },
  { value: 'OFFICE', label: 'Office Building' },
  { value: 'HOME', label: 'Home-Based Business' },
  { value: 'MOBILE', label: 'Mobile / No Fixed Location' },
  { value: 'MALL', label: 'Mall / Shopping Center' },
  { value: 'KIOSK', label: 'Kiosk' },
  { value: 'WAREHOUSE', label: 'Warehouse / Industrial' },
]

const FE_NETWORKS = [
  { value: 'NASHVILLE', label: 'Nashville (Primary)' },
  { value: 'OMAHA', label: 'Omaha' },
  { value: 'BUYPASS', label: 'Buypass' },
]

const MCC_CODES = [
  { value: '5411', label: '5411 - Grocery Stores, Supermarkets' },
  { value: '5812', label: '5812 - Eating Places, Restaurants' },
  { value: '5814', label: '5814 - Fast Food Restaurants' },
  { value: '5999', label: '5999 - Miscellaneous & Specialty Retail' },
  { value: '7299', label: '7299 - Miscellaneous Recreation Services' },
  { value: '5734', label: '5734 - Computer Software Stores' },
  { value: '5945', label: '5945 - Hobby, Toy & Game Shops' },
  { value: '5541', label: '5541 - Service Stations (with fuel)' },
  { value: '5462', label: '5462 - Bakeries' },
  { value: '5691', label: '5691 - Clothing Stores' },
  { value: '7230', label: '7230 - Barber & Beauty Shops' },
  { value: '8011', label: '8011 - Doctors & Physicians' },
  { value: '8021', label: '8021 - Dentists & Orthodontists' },
  { value: '8099', label: '8099 - Health Practitioners' },
  { value: '5912', label: '5912 - Drug Stores & Pharmacies' },
  { value: '5311', label: '5311 - Department Stores' },
  { value: '5712', label: '5712 - Furniture Stores' },
  { value: '5947', label: '5947 - Gift, Card, Novelty Shops' },
  { value: '7011', label: '7011 - Hotels & Motels' },
  { value: '7512', label: '7512 - Automobile Rental' },
]

const DEFAULT_CARD_ENTITLEMENTS: CardEntitlement[] = [
  { card_type: 'VISA', enabled: true },
  { card_type: 'MASTERCARD', enabled: true },
  { card_type: 'DISCOVER', enabled: true },
  { card_type: 'AMEX', enabled: false },
  { card_type: 'PIN_DEBIT', enabled: true },
  { card_type: 'EBT', enabled: false },
  { card_type: 'FLEET', enabled: false },
]

const EMPTY_ADDRESS: ParsedAddress = {
  street: '',
  city: '',
  state: '',
  zip: '',
  country: 'US',
  formatted: '',
}

// =============================================================================
// HELPERS
// =============================================================================

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length >= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  } else if (digits.length >= 3) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  }
  return digits
}

const formatTaxId = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  if (digits.length > 2) {
    return `${digits.slice(0, 2)}-${digits.slice(2)}`
  }
  return digits
}

const formatSSN = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  if (digits.length > 5) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
  } else if (digits.length > 3) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  }
  return digits
}

const generateOwnerId = () => `owner_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

const createEmptyOwner = (sequenceNumber: number): OwnerData => ({
  id: generateOwnerId(),
  first_name: '',
  middle_name: '',
  last_name: '',
  title: sequenceNumber === 1 ? 'Owner' : '',
  ssn: '',
  dob: '',
  email: '',
  phone: '',
  address: { ...EMPTY_ADDRESS },
  ownership_percent: sequenceNumber === 1 ? '100' : '',
  is_guarantor: true,
  same_as_business: false,
})

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function MerchantOnboardingPage() {
  const { merchantId } = useParams<{ merchantId: string }>()
  const navigate = useNavigate()
  const pushToast = useToastStore((s) => s.push)

  // UI state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [bankLookupLoading, setBankLookupLoading] = useState(false)

  // ==========================================================================
  // FORM STATE - Step 1: Business Info
  // ==========================================================================
  const [businessInfo, setBusinessInfo] = useState({
    legal_name: '',
    dba_name: '',
    tax_id: '',
    business_type: '',
    mcc_code: '',
    website: '',
    customer_service_phone: '',
    business_start_date: '',
  })
  const [businessAddress, setBusinessAddress] = useState<ParsedAddress>({ ...EMPTY_ADDRESS })

  // ==========================================================================
  // FORM STATE - Step 2: Owners
  // ==========================================================================
  const [owners, setOwners] = useState<OwnerData[]>([createEmptyOwner(1)])

  // ==========================================================================
  // FORM STATE - Step 3: Banking
  // ==========================================================================
  const [bankInfo, setBankInfo] = useState({
    bank_name: '',
    routing_number: '',
    account_number: '',
    account_type: 'C',
  })

  const [processingInfo, setProcessingInfo] = useState({
    monthly_volume: '',
    avg_ticket: '',
    high_ticket: '',
    processing_type: 'RETAIL',
  })

  // ==========================================================================
  // FORM STATE - Step 4: Pricing & Entitlements
  // ==========================================================================
  const [pricingInfo, setPricingInfo] = useState({
    pricing_type: 'IC+',
    discount_rate: '',
    transaction_fee: '0.10',
    monthly_fee: '9.95',
    annual_fee: '0',
    pci_fee: '14.95',
    statement_fee: '0',
    batch_fee: '0.25',
    chargeback_fee: '25.00',
    early_termination_fee: '0',
    // Additional fees
    retrieval_fee: '15.00',
    voice_auth_fee: '0.75',
    aru_fee: '0.05',
    wireless_fee: '0',
    gateway_fee: '0',
    equipment_lease_fee: '0',
    debit_discount_rate: '',
    debit_transaction_fee: '0.10',
    amex_discount_rate: '',
    amex_transaction_fee: '0.10',
    ebt_transaction_fee: '0',
    address_verification_fee: '0.05',
    pin_debit_fee: '0.10',
    non_qualified_surcharge: '0',
    regulatory_fee: '0',
    irs_reporting_fee: '0',
    tin_invalid_fee: '0',
  })

  const [cardEntitlements, setCardEntitlements] = useState<CardEntitlement[]>(DEFAULT_CARD_ENTITLEMENTS)

  // ==========================================================================
  // FORM STATE - Step 5: Site & Equipment
  // ==========================================================================
  const [siteInfo, setSiteInfo] = useState<SiteInfo>({
    location_type: 'STOREFRONT',
    square_footage: '',
    num_registers: '1',
    seasonal_business: false,
    seasonal_months: [],
  })

  const [siteAddress, setSiteAddress] = useState<ParsedAddress>({ ...EMPTY_ADDRESS })
  const [siteAddressSameAsBusiness, setSiteAddressSameAsBusiness] = useState(true)

  const [equipmentConfig, setEquipmentConfig] = useState<EquipmentConfig>({
    terminal_type: 'CLOVER_FLEX',
    terminal_quantity: 1,
    auto_close: true,
    auto_close_time: '23:00',
    tip_enabled: false,
    pin_debit_enabled: true,
    contactless_enabled: true,
    emv_enabled: true,
  })

  const [feConfig, setFeConfig] = useState({
    front_end_network: 'NASHVILLE',
    auth_network: 'A',
    avs_enabled: true,
    cvv_enabled: true,
    address_verification: true,
  })

  // ==========================================================================
  // FORM STATE - Step 6: Documents & Signature
  // ==========================================================================
  const [uploadedDocs, setUploadedDocs] = useState<Array<{ id: string; type: string; filename: string }>>([])
  const [signatureMethod, setSignatureMethod] = useState<'ESIGN' | 'C2A'>('C2A')
  const [signatureData, setSignatureData] = useState({
    signer_name: '',
    signer_title: '',
    signer_email: '',
    signer_phone: '',
    agreed_to_terms: false,
    agreed_to_pricing: false,
    agreed_to_ach: false,
    agreed_to_pci: false,
    signature_date: new Date().toISOString().split('T')[0],
    // E-Signature specific fields
    esign_consent: false,
    esign_sent: false,
    esign_completed: false,
    esign_document_id: '',
  })
  const [sendingEsign, setSendingEsign] = useState(false)

  // ==========================================================================
  // DATA LOADING
  // ==========================================================================

  useEffect(() => {
    if (!merchantId) return

    const loadOnboarding = async () => {
      setLoading(true)
      try {
        const res = await Api.merchantsApi.getOnboarding(merchantId)
        if (res.has_onboarding && res.onboarding) {
          const data = res.onboarding
          setOnboarding(data)
          setCurrentStep(data.step || 1)
          populateFormFromData(data)
        } else {
          const startRes = await Api.merchantsApi.startOnboarding(merchantId)
          if (startRes.onboarding) {
            setOnboarding(startRes.onboarding)
            populateFormFromData(startRes.onboarding)
          }
        }
      } catch (error: any) {
        pushToast({
          variant: 'error',
          title: 'Load Failed',
          message: error?.message || 'Failed to load onboarding data',
        })
      } finally {
        setLoading(false)
      }
    }

    loadOnboarding()
  }, [merchantId])

  const populateFormFromData = (data: OnboardingData) => {
    // Business info
    setBusinessInfo({
      legal_name: data.legal_name || '',
      dba_name: data.dba_name || '',
      tax_id: data.tax_id || '',
      business_type: data.business_type || '',
      mcc_code: data.mcc_code || '',
      website: data.website || '',
      customer_service_phone: data.customer_service_phone || '',
      business_start_date: data.business_start_date || '',
    })

    setBusinessAddress({
      street: data.business_street || '',
      city: data.business_city || '',
      state: data.business_state || '',
      zip: data.business_zip || '',
      country: 'US',
      formatted: data.business_street
        ? `${data.business_street}, ${data.business_city}, ${data.business_state} ${data.business_zip}`
        : '',
    })

    // Owners
    if (data.owners && Array.isArray(data.owners) && data.owners.length > 0) {
      setOwners(data.owners.map((o: any) => ({
        id: o.id || generateOwnerId(),
        first_name: o.first_name || '',
        middle_name: o.middle_name || '',
        last_name: o.last_name || '',
        title: o.title || 'Owner',
        ssn: o.ssn || '',
        dob: o.dob || '',
        email: o.email || '',
        phone: o.phone || '',
        address: {
          street: o.street || '',
          city: o.city || '',
          state: o.state || '',
          zip: o.zip || '',
          country: 'US',
          formatted: o.street ? `${o.street}, ${o.city}, ${o.state} ${o.zip}` : '',
        },
        ownership_percent: o.ownership_percent?.toString() || '',
        is_guarantor: o.is_guarantor !== false,
        same_as_business: false,
      })))
    }

    // Bank info
    setBankInfo({
      bank_name: data.bank_name || '',
      routing_number: data.routing_number || '',
      account_number: data.account_number_encrypted || '',
      account_type: data.account_type || 'C',
    })

    // Processing info
    setProcessingInfo({
      monthly_volume: data.monthly_volume?.toString() || '',
      avg_ticket: data.avg_ticket?.toString() || '',
      high_ticket: data.high_ticket?.toString() || '',
      processing_type: data.processing_type || 'RETAIL',
    })

    // Pricing
    if (data.pricing_type) {
      setPricingInfo(prev => ({ ...prev, pricing_type: data.pricing_type }))
    }

    // Card entitlements
    if (data.card_entitlements) {
      setCardEntitlements(data.card_entitlements)
    }

    // Equipment
    if (data.terminal_type) {
      setEquipmentConfig(prev => ({
        ...prev,
        terminal_type: data.terminal_type,
        terminal_quantity: data.terminal_quantity || 1,
      }))
    }

    // Site info
    if (data.location_type) {
      setSiteInfo(prev => ({
        ...prev,
        location_type: data.location_type,
      }))
    }

    // Documents
    setUploadedDocs(data.documents || [])
  }

  // ==========================================================================
  // ROUTING NUMBER LOOKUP
  // ==========================================================================

  const lookupRoutingNumber = useCallback(async (routingNumber: string) => {
    if (routingNumber.length !== 9) return

    setBankLookupLoading(true)
    try {
      const response = await fetch(`/api/v1/utils/aba-lookup?routing=${routingNumber}`)
      if (response.ok) {
        const data = await response.json()
        if (data.bank_name) {
          setBankInfo((prev) => ({ ...prev, bank_name: data.bank_name }))
        }
      }
    } catch {
      // Silently fail - user can enter manually
    } finally {
      setBankLookupLoading(false)
    }
  }, [])

  // ==========================================================================
  // OWNER MANAGEMENT
  // ==========================================================================

  const addOwner = () => {
    if (owners.length >= 4) {
      pushToast({
        variant: 'warning',
        title: 'Maximum Owners',
        message: 'Maximum of 4 owners/principals allowed',
      })
      return
    }
    setOwners((prev) => [...prev, createEmptyOwner(prev.length + 1)])
  }

  const removeOwner = (ownerId: string) => {
    if (owners.length <= 1) {
      pushToast({
        variant: 'warning',
        title: 'Required',
        message: 'At least one owner is required',
      })
      return
    }
    setOwners((prev) => prev.filter((o) => o.id !== ownerId))
  }

  const updateOwner = (ownerId: string, field: keyof OwnerData, value: any) => {
    setOwners((prev) =>
      prev.map((o) => {
        if (o.id !== ownerId) return o
        if (field === 'same_as_business' && value === true) {
          return { ...o, same_as_business: true, address: { ...businessAddress } }
        }
        return { ...o, [field]: value }
      })
    )
  }

  const getTotalOwnership = () => {
    return owners.reduce((sum, o) => sum + (parseFloat(o.ownership_percent) || 0), 0)
  }

  // ==========================================================================
  // CARD ENTITLEMENTS
  // ==========================================================================

  const toggleCardEntitlement = (cardType: string) => {
    setCardEntitlements(prev =>
      prev.map(e => e.card_type === cardType ? { ...e, enabled: !e.enabled } : e)
    )
  }

  // ==========================================================================
  // SAVE & SUBMIT
  // ==========================================================================

  const saveStep = async (nextStep?: number) => {
    if (!merchantId) return

    setSaving(true)
    try {
      const updateData: any = { step: nextStep || currentStep }

      // Build complete payload
      updateData.business_info = {
        ...businessInfo,
        business_street: businessAddress.street,
        business_city: businessAddress.city,
        business_state: businessAddress.state,
        business_zip: businessAddress.zip,
        dba_name: businessInfo.dba_name || businessInfo.legal_name,
      }

      updateData.owners = owners.map((o, idx) => ({
        sequence_number: idx + 1,
        first_name: o.first_name,
        middle_name: o.middle_name,
        last_name: o.last_name,
        title: o.title,
        ssn: o.ssn.replace(/\D/g, ''),
        dob: o.dob,
        email: o.email,
        phone: o.phone.replace(/\D/g, ''),
        street: o.address.street,
        city: o.address.city,
        state: o.address.state,
        zip: o.address.zip,
        ownership_percent: parseFloat(o.ownership_percent) || 0,
        is_guarantor: o.is_guarantor,
      }))

      updateData.bank_info = {
        ...bankInfo,
        routing_number: bankInfo.routing_number.replace(/\D/g, ''),
        account_number: bankInfo.account_number.replace(/\D/g, ''),
      }

      updateData.processing_info = {
        monthly_volume: parseFloat(processingInfo.monthly_volume) || 0,
        avg_ticket: parseFloat(processingInfo.avg_ticket) || 0,
        high_ticket: parseFloat(processingInfo.high_ticket) || 0,
        processing_type: processingInfo.processing_type,
      }

      updateData.pricing_info = pricingInfo
      updateData.card_entitlements = cardEntitlements

      updateData.equipment_config = equipmentConfig

      updateData.site_info = {
        ...siteInfo,
        site_street: siteAddressSameAsBusiness ? businessAddress.street : siteAddress.street,
        site_city: siteAddressSameAsBusiness ? businessAddress.city : siteAddress.city,
        site_state: siteAddressSameAsBusiness ? businessAddress.state : siteAddress.state,
        site_zip: siteAddressSameAsBusiness ? businessAddress.zip : siteAddress.zip,
      }

      updateData.fe_config = feConfig

      // Signature method and data
      updateData.signature_method = signatureMethod
      if (signatureData.signer_name) {
        updateData.signature_info = {
          ...signatureData,
          signature_method: signatureMethod,
        }
      }

      const res = await Api.merchantsApi.updateOnboarding(merchantId, updateData)
      if (res.onboarding) {
        setOnboarding(res.onboarding)
      }

      if (nextStep) {
        setCurrentStep(nextStep)
      }

      pushToast({
        variant: 'success',
        title: 'Saved',
        message: 'Progress saved successfully',
      })
    } catch (error: any) {
      pushToast({
        variant: 'error',
        title: 'Save Failed',
        message: error?.message || 'Failed to save progress',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDocUpload = async (file: File | null, docType: string) => {
    if (!file || !merchantId) return

    setSaving(true)
    try {
      const res = await Api.merchantsApi.uploadOnboardingDocument(merchantId, docType, file)
      if (res.document) {
        setUploadedDocs((prev) => {
          const filtered = prev.filter((d) => d.type !== docType)
          return [...filtered, res.document]
        })
        pushToast({
          variant: 'success',
          title: 'Uploaded',
          message: `${file.name} uploaded successfully`,
        })
      }
    } catch (error: any) {
      pushToast({
        variant: 'error',
        title: 'Upload Failed',
        message: error?.message || 'Failed to upload document',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!merchantId) return

    // Validate documents
    const hasGovernmentId = uploadedDocs.some((d) => d.type === 'government_id')
    const hasVoidedCheck = uploadedDocs.some((d) => d.type === 'voided_check')

    if (!hasGovernmentId || !hasVoidedCheck) {
      pushToast({
        variant: 'error',
        title: 'Documents Required',
        message: 'Please upload Driver\'s License and Voided Check before submitting',
      })
      return
    }

    // Validate signature based on method
    if (!signatureData.signer_name) {
      pushToast({
        variant: 'error',
        title: 'Signer Required',
        message: 'Please provide the authorized signer name',
      })
      return
    }

    if (signatureMethod === 'C2A') {
      // Click 2 Agree validation - all checkboxes must be checked
      if (!signatureData.agreed_to_terms || !signatureData.agreed_to_pricing ||
          !signatureData.agreed_to_ach || !signatureData.agreed_to_pci) {
        pushToast({
          variant: 'error',
          title: 'Agreement Required',
          message: 'Please agree to all terms and conditions before submitting',
        })
        return
      }
    } else if (signatureMethod === 'ESIGN') {
      // E-Signature validation - must be completed
      if (!signatureData.esign_completed) {
        pushToast({
          variant: 'error',
          title: 'E-Signature Required',
          message: 'Please complete the e-signature process before submitting',
        })
        return
      }
    }

    // Validate ownership
    if (getTotalOwnership() < 75) {
      pushToast({
        variant: 'error',
        title: 'Ownership Required',
        message: 'Total ownership must be at least 75%',
      })
      return
    }

    setSubmitting(true)
    try {
      await saveStep()
      const res = await Api.merchantsApi.submitOnboarding(merchantId)
      if (res.success) {
        setOnboarding(res.onboarding)
        pushToast({
          variant: 'success',
          title: 'Submitted',
          message: 'Application submitted to Fiserv for processing',
        })
      } else {
        pushToast({
          variant: 'error',
          title: 'Submission Failed',
          message: res.message || 'Failed to submit application',
        })
      }
    } catch (error: any) {
      pushToast({
        variant: 'error',
        title: 'Submission Failed',
        message: error?.message || 'Failed to submit application',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const checkStatus = async () => {
    if (!merchantId) return

    setSaving(true)
    try {
      const res = await Api.merchantsApi.getOnboardingStatus(merchantId)
      if (res.onboarding) {
        setOnboarding(res.onboarding)
      }
      pushToast({
        variant: 'info',
        title: 'Status Updated',
        message: `Current status: ${res.fiserv_status || res.status}`,
      })
    } catch (error: any) {
      pushToast({
        variant: 'error',
        title: 'Check Failed',
        message: error?.message || 'Failed to check status',
      })
    } finally {
      setSaving(false)
    }
  }

  // ==========================================================================
  // STATUS BADGE
  // ==========================================================================

  const getStatusBadge = () => {
    if (!onboarding) return null

    const statusMap: Record<string, { variant: 'info' | 'warning' | 'success' | 'danger'; label: string }> = {
      draft: { variant: 'info', label: 'Draft' },
      submitted: { variant: 'warning', label: 'Submitted' },
      pending_credit: { variant: 'warning', label: 'Pending Credit Review' },
      pending_bos: { variant: 'warning', label: 'Pending BOS' },
      approved: { variant: 'success', label: 'Approved' },
      rejected: { variant: 'danger', label: 'Rejected' },
    }

    const config = statusMap[onboarding.status] || { variant: 'info' as const, label: onboarding.status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  // ==========================================================================
  // RENDER STEP 1: BUSINESS INFO
  // ==========================================================================

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="border-b border-[var(--ss-border)] pb-4">
        <h3 className="text-sm font-semibold text-[var(--ss-text)] mb-3 uppercase tracking-wide">
          Legal Entity Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Legal Business Name"
            value={businessInfo.legal_name}
            onChange={(e) => setBusinessInfo((f) => ({ ...f, legal_name: e.target.value }))}
            placeholder="Acme Corporation Inc."
            isRequired
          />
          <Select
            label="Entity Type"
            value={businessInfo.business_type}
            onChange={(e) => setBusinessInfo((f) => ({ ...f, business_type: e.target.value }))}
            options={[{ value: '', label: 'Select entity type...' }, ...ENTITY_TYPES]}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="Federal Tax ID (EIN)"
            value={businessInfo.tax_id}
            onChange={(e) => setBusinessInfo((f) => ({ ...f, tax_id: formatTaxId(e.target.value) }))}
            placeholder="XX-XXXXXXX"
            maxLength={10}
            isRequired
          />
          <Input
            label="DBA Name (Doing Business As)"
            value={businessInfo.dba_name}
            onChange={(e) => setBusinessInfo((f) => ({ ...f, dba_name: e.target.value }))}
            placeholder="Leave blank if same as legal name"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="Business Start Date"
            type="date"
            value={businessInfo.business_start_date}
            onChange={(e) => setBusinessInfo((f) => ({ ...f, business_start_date: e.target.value }))}
          />
          <Select
            label="Merchant Category Code (MCC)"
            value={businessInfo.mcc_code}
            onChange={(e) => setBusinessInfo((f) => ({ ...f, mcc_code: e.target.value }))}
            options={[{ value: '', label: 'Select industry category...' }, ...MCC_CODES]}
          />
        </div>
      </div>

      <div className="border-b border-[var(--ss-border)] pb-4">
        <h3 className="text-sm font-semibold text-[var(--ss-text)] mb-3 uppercase tracking-wide">
          Business Location
        </h3>
        <SmartAddressInput
          label="Business Address"
          value={businessAddress}
          onChange={setBusinessAddress}
          placeholder="Start typing address..."
          required
          usOnly
          allowManualEntry
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[var(--ss-text)] mb-3 uppercase tracking-wide">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Customer Service Phone"
            value={businessInfo.customer_service_phone}
            onChange={(e) => setBusinessInfo((f) => ({ ...f, customer_service_phone: formatPhone(e.target.value) }))}
            placeholder="(555) 123-4567"
            maxLength={14}
            isRequired
          />
          <Input
            label="Website URL"
            value={businessInfo.website}
            onChange={(e) => setBusinessInfo((f) => ({ ...f, website: e.target.value }))}
            placeholder="https://www.example.com"
          />
        </div>
      </div>
    </div>
  )

  // ==========================================================================
  // RENDER STEP 2: OWNERS
  // ==========================================================================

  const renderStep2 = () => {
    const totalOwnership = getTotalOwnership()
    const needsMoreOwners = totalOwnership < 75

    return (
      <div className="space-y-6">
        <div className={`rounded-lg border p-4 ${needsMoreOwners ? 'border-[var(--ss-warning)] bg-[var(--ss-warning)]/5' : 'border-[var(--ss-success)] bg-[var(--ss-success)]/5'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[var(--ss-text)]">Total Ownership: {totalOwnership}%</p>
              <p className="text-sm text-[var(--ss-text-muted)]">
                {needsMoreOwners ? 'At least 75% ownership required' : 'Ownership requirement met'}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={addOwner} disabled={owners.length >= 4}>
              <Icon name="plus" className="w-4 h-4 mr-1" />
              Add Owner
            </Button>
          </div>
        </div>

        {owners.map((owner, index) => (
          <Card key={owner.id} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--ss-text)]">
                {index === 0 ? 'Primary Owner/Principal' : `Additional Owner ${index + 1}`}
              </h3>
              {owners.length > 1 && (
                <button type="button" onClick={() => removeOwner(owner.id)} className="text-sm text-[var(--ss-danger)] hover:underline">
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input label="First Name" value={owner.first_name} onChange={(e) => updateOwner(owner.id, 'first_name', e.target.value)} isRequired />
              <Input label="Middle Name" value={owner.middle_name} onChange={(e) => updateOwner(owner.id, 'middle_name', e.target.value)} />
              <Input label="Last Name" value={owner.last_name} onChange={(e) => updateOwner(owner.id, 'last_name', e.target.value)} isRequired />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Select label="Title/Role" value={owner.title} onChange={(e) => updateOwner(owner.id, 'title', e.target.value)} options={OWNER_TITLES} />
              <Input label="Ownership %" type="number" min="1" max="100" value={owner.ownership_percent} onChange={(e) => updateOwner(owner.id, 'ownership_percent', e.target.value)} isRequired />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input label="Social Security Number" value={owner.ssn} onChange={(e) => updateOwner(owner.id, 'ssn', formatSSN(e.target.value))} maxLength={11} type="password" isRequired />
              <Input label="Date of Birth" type="date" value={owner.dob} onChange={(e) => updateOwner(owner.id, 'dob', e.target.value)} isRequired />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input label="Email" type="email" value={owner.email} onChange={(e) => updateOwner(owner.id, 'email', e.target.value)} isRequired />
              <Input label="Phone" value={owner.phone} onChange={(e) => updateOwner(owner.id, 'phone', formatPhone(e.target.value))} maxLength={14} isRequired />
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--ss-text)]">Home Address</span>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={owner.same_as_business} onChange={(e) => updateOwner(owner.id, 'same_as_business', e.target.checked)} className="rounded" />
                  Same as business
                </label>
              </div>
              <SmartAddressInput value={owner.address} onChange={(addr) => updateOwner(owner.id, 'address', addr)} required disabled={owner.same_as_business} usOnly allowManualEntry />
            </div>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-alt)] cursor-pointer">
              <input type="checkbox" checked={owner.is_guarantor} onChange={(e) => updateOwner(owner.id, 'is_guarantor', e.target.checked)} className="mt-0.5 rounded" />
              <div>
                <span className="font-medium text-[var(--ss-text)]">Personal Guarantee</span>
                <p className="text-xs text-[var(--ss-text-muted)] mt-0.5">Required for owners with 25%+ ownership</p>
              </div>
            </label>
          </Card>
        ))}
      </div>
    )
  }

  // ==========================================================================
  // RENDER STEP 3: BANKING
  // ==========================================================================

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--ss-primary)]/30 bg-[var(--ss-primary)]/5 p-4 mb-4">
        <div className="flex gap-3">
          <Icon name="finance" className="w-5 h-5 text-[var(--ss-primary)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[var(--ss-text)]">Settlement Account</p>
            <p className="text-sm text-[var(--ss-text-muted)] mt-1">
              This bank account will receive daily settlement deposits via ACH.
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--ss-border)] pb-4">
        <h3 className="text-sm font-semibold text-[var(--ss-text)] mb-3 uppercase tracking-wide">Bank Account Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="ABA Routing Number"
            value={bankInfo.routing_number}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 9)
              setBankInfo((f) => ({ ...f, routing_number: value }))
              if (value.length === 9) lookupRoutingNumber(value)
            }}
            maxLength={9}
            isRequired
            rightIcon={bankLookupLoading ? <div className="animate-spin w-4 h-4 border-2 border-[var(--ss-primary)] border-t-transparent rounded-full" /> : undefined}
          />
          <Input label="Bank Name" value={bankInfo.bank_name} onChange={(e) => setBankInfo((f) => ({ ...f, bank_name: e.target.value }))} isRequired />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input label="Account Number" value={bankInfo.account_number} onChange={(e) => setBankInfo((f) => ({ ...f, account_number: e.target.value.replace(/\D/g, '') }))} type="password" isRequired />
          <Select label="Account Type" value={bankInfo.account_type} onChange={(e) => setBankInfo((f) => ({ ...f, account_type: e.target.value }))} options={ACCOUNT_TYPES} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[var(--ss-text)] mb-3 uppercase tracking-wide">Processing Volume</h3>
        <Select label="Processing Type" value={processingInfo.processing_type} onChange={(e) => setProcessingInfo((f) => ({ ...f, processing_type: e.target.value }))} options={PROCESSING_TYPES} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Input label="Monthly Volume ($)" type="number" value={processingInfo.monthly_volume} onChange={(e) => setProcessingInfo((f) => ({ ...f, monthly_volume: e.target.value }))} isRequired />
          <Input label="Average Transaction ($)" type="number" value={processingInfo.avg_ticket} onChange={(e) => setProcessingInfo((f) => ({ ...f, avg_ticket: e.target.value }))} isRequired />
          <Input label="Highest Transaction ($)" type="number" value={processingInfo.high_ticket} onChange={(e) => setProcessingInfo((f) => ({ ...f, high_ticket: e.target.value }))} isRequired />
        </div>
      </div>
    </div>
  )

  // ==========================================================================
  // RENDER STEP 4: PRICING & ENTITLEMENTS
  // ==========================================================================

  const renderStep4 = () => (
    <div className="space-y-6">
      {/* Pricing Section */}
      <div className="border-b border-[var(--ss-border)] pb-6">
        <h3 className="text-sm font-semibold text-[var(--ss-text)] mb-4 uppercase tracking-wide">
          Pricing Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Pricing Model"
            value={pricingInfo.pricing_type}
            onChange={(e) => setPricingInfo((f) => ({ ...f, pricing_type: e.target.value }))}
            options={PRICING_TYPES}
          />
          <Input
            label="Discount Rate (%)"
            value={pricingInfo.discount_rate}
            onChange={(e) => setPricingInfo((f) => ({ ...f, discount_rate: e.target.value }))}
            placeholder="2.50"
            helperText="Percentage of each transaction"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Input
            label="Transaction Fee ($)"
            value={pricingInfo.transaction_fee}
            onChange={(e) => setPricingInfo((f) => ({ ...f, transaction_fee: e.target.value }))}
            placeholder="0.10"
          />
          <Input
            label="Monthly Fee ($)"
            value={pricingInfo.monthly_fee}
            onChange={(e) => setPricingInfo((f) => ({ ...f, monthly_fee: e.target.value }))}
            placeholder="9.95"
          />
          <Input
            label="PCI Compliance Fee ($)"
            value={pricingInfo.pci_fee}
            onChange={(e) => setPricingInfo((f) => ({ ...f, pci_fee: e.target.value }))}
            placeholder="14.95"
          />
        </div>

        <Accordion
          items={[
            {
              key: 'standard-fees',
              title: 'Standard Fees',
              content: (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <Input label="Batch Fee ($)" value={pricingInfo.batch_fee} onChange={(e) => setPricingInfo((f) => ({ ...f, batch_fee: e.target.value }))} helperText="Per batch settlement" />
                  <Input label="Statement Fee ($)" value={pricingInfo.statement_fee} onChange={(e) => setPricingInfo((f) => ({ ...f, statement_fee: e.target.value }))} helperText="Monthly statement" />
                  <Input label="Annual Fee ($)" value={pricingInfo.annual_fee} onChange={(e) => setPricingInfo((f) => ({ ...f, annual_fee: e.target.value }))} helperText="Yearly account fee" />
                  <Input label="Regulatory Fee ($)" value={pricingInfo.regulatory_fee} onChange={(e) => setPricingInfo((f) => ({ ...f, regulatory_fee: e.target.value }))} helperText="Monthly compliance" />
                  <Input label="IRS Reporting Fee ($)" value={pricingInfo.irs_reporting_fee} onChange={(e) => setPricingInfo((f) => ({ ...f, irs_reporting_fee: e.target.value }))} helperText="1099-K reporting" />
                  <Input label="TIN Invalid Fee ($)" value={pricingInfo.tin_invalid_fee} onChange={(e) => setPricingInfo((f) => ({ ...f, tin_invalid_fee: e.target.value }))} helperText="Invalid tax ID penalty" />
                </div>
              ),
            },
            {
              key: 'chargeback-fees',
              title: 'Chargeback & Dispute Fees',
              content: (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <Input label="Chargeback Fee ($)" value={pricingInfo.chargeback_fee} onChange={(e) => setPricingInfo((f) => ({ ...f, chargeback_fee: e.target.value }))} helperText="Per chargeback" />
                  <Input label="Retrieval Fee ($)" value={pricingInfo.retrieval_fee} onChange={(e) => setPricingInfo((f) => ({ ...f, retrieval_fee: e.target.value }))} helperText="Per retrieval request" />
                  <Input label="Early Termination Fee ($)" value={pricingInfo.early_termination_fee} onChange={(e) => setPricingInfo((f) => ({ ...f, early_termination_fee: e.target.value }))} helperText="Contract cancellation" />
                </div>
              ),
            },
            {
              key: 'authorization-fees',
              title: 'Authorization & Service Fees',
              content: (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <Input label="Voice Auth Fee ($)" value={pricingInfo.voice_auth_fee} onChange={(e) => setPricingInfo((f) => ({ ...f, voice_auth_fee: e.target.value }))} helperText="Manual phone auth" />
                  <Input label="ARU Fee ($)" value={pricingInfo.aru_fee} onChange={(e) => setPricingInfo((f) => ({ ...f, aru_fee: e.target.value }))} helperText="Automated response unit" />
                  <Input label="AVS Fee ($)" value={pricingInfo.address_verification_fee} onChange={(e) => setPricingInfo((f) => ({ ...f, address_verification_fee: e.target.value }))} helperText="Address verification" />
                </div>
              ),
            },
            {
              key: 'equipment-fees',
              title: 'Equipment & Gateway Fees',
              content: (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <Input label="Wireless Fee ($)" value={pricingInfo.wireless_fee} onChange={(e) => setPricingInfo((f) => ({ ...f, wireless_fee: e.target.value }))} helperText="Monthly wireless/cellular" />
                  <Input label="Gateway Fee ($)" value={pricingInfo.gateway_fee} onChange={(e) => setPricingInfo((f) => ({ ...f, gateway_fee: e.target.value }))} helperText="Monthly gateway access" />
                  <Input label="Equipment Lease ($)" value={pricingInfo.equipment_lease_fee} onChange={(e) => setPricingInfo((f) => ({ ...f, equipment_lease_fee: e.target.value }))} helperText="Monthly terminal lease" />
                </div>
              ),
            },
            {
              key: 'card-specific-fees',
              title: 'Card-Specific Pricing',
              content: (
                <div className="space-y-4 pt-2">
                  <div className="p-3 rounded-lg bg-[var(--ss-surface-alt)]">
                    <p className="text-sm font-medium text-[var(--ss-text)] mb-3">Debit Card Pricing</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input label="Debit Discount Rate (%)" value={pricingInfo.debit_discount_rate} onChange={(e) => setPricingInfo((f) => ({ ...f, debit_discount_rate: e.target.value }))} placeholder="1.00" />
                      <Input label="Debit Transaction Fee ($)" value={pricingInfo.debit_transaction_fee} onChange={(e) => setPricingInfo((f) => ({ ...f, debit_transaction_fee: e.target.value }))} />
                      <Input label="PIN Debit Fee ($)" value={pricingInfo.pin_debit_fee} onChange={(e) => setPricingInfo((f) => ({ ...f, pin_debit_fee: e.target.value }))} />
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--ss-surface-alt)]">
                    <p className="text-sm font-medium text-[var(--ss-text)] mb-3">American Express Pricing</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Amex Discount Rate (%)" value={pricingInfo.amex_discount_rate} onChange={(e) => setPricingInfo((f) => ({ ...f, amex_discount_rate: e.target.value }))} placeholder="2.75" helperText="If accepting Amex" />
                      <Input label="Amex Transaction Fee ($)" value={pricingInfo.amex_transaction_fee} onChange={(e) => setPricingInfo((f) => ({ ...f, amex_transaction_fee: e.target.value }))} />
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--ss-surface-alt)]">
                    <p className="text-sm font-medium text-[var(--ss-text)] mb-3">Other Card Types</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="EBT Transaction Fee ($)" value={pricingInfo.ebt_transaction_fee} onChange={(e) => setPricingInfo((f) => ({ ...f, ebt_transaction_fee: e.target.value }))} helperText="If accepting EBT/SNAP" />
                      <Input label="Non-Qualified Surcharge (%)" value={pricingInfo.non_qualified_surcharge} onChange={(e) => setPricingInfo((f) => ({ ...f, non_qualified_surcharge: e.target.value }))} helperText="Tiered pricing only" />
                    </div>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Card Entitlements Section */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--ss-text)] mb-4 uppercase tracking-wide">
          Card Network Entitlements
        </h3>
        <p className="text-sm text-[var(--ss-text-muted)] mb-4">
          Select which card networks the merchant will accept
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {cardEntitlements.map((entitlement) => (
            <label
              key={entitlement.card_type}
              className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                entitlement.enabled
                  ? 'border-[var(--ss-primary)] bg-[var(--ss-primary)]/5'
                  : 'border-[var(--ss-border)] bg-[var(--ss-surface)]'
              }`}
            >
              <input
                type="checkbox"
                checked={entitlement.enabled}
                onChange={() => toggleCardEntitlement(entitlement.card_type)}
                className="rounded"
              />
              <div>
                <span className="font-medium text-[var(--ss-text)]">
                  {entitlement.card_type === 'PIN_DEBIT' ? 'PIN Debit' :
                   entitlement.card_type === 'EBT' ? 'EBT/SNAP' :
                   entitlement.card_type.charAt(0) + entitlement.card_type.slice(1).toLowerCase()}
                </span>
                {entitlement.card_type === 'AMEX' && (
                  <p className="text-xs text-[var(--ss-text-muted)]">Requires separate Amex agreement</p>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  // ==========================================================================
  // RENDER STEP 5: SITE & EQUIPMENT
  // ==========================================================================

  const renderStep5 = () => (
    <div className="space-y-6">
      {/* Site Information */}
      <div className="border-b border-[var(--ss-border)] pb-6">
        <h3 className="text-sm font-semibold text-[var(--ss-text)] mb-4 uppercase tracking-wide">
          Site Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Select
            label="Location Type"
            value={siteInfo.location_type}
            onChange={(e) => setSiteInfo((f) => ({ ...f, location_type: e.target.value }))}
            options={LOCATION_TYPES}
          />
          <Input
            label="Square Footage"
            type="number"
            value={siteInfo.square_footage}
            onChange={(e) => setSiteInfo((f) => ({ ...f, square_footage: e.target.value }))}
            placeholder="1500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="Number of Registers/Lanes"
            type="number"
            min="1"
            value={siteInfo.num_registers}
            onChange={(e) => setSiteInfo((f) => ({ ...f, num_registers: e.target.value }))}
          />
          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="seasonal"
              checked={siteInfo.seasonal_business}
              onChange={(e) => setSiteInfo((f) => ({ ...f, seasonal_business: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="seasonal" className="text-sm text-[var(--ss-text)]">Seasonal Business</label>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--ss-text)]">Terminal Location Address</span>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={siteAddressSameAsBusiness} onChange={(e) => setSiteAddressSameAsBusiness(e.target.checked)} className="rounded" />
              Same as business address
            </label>
          </div>
          {!siteAddressSameAsBusiness && (
            <SmartAddressInput value={siteAddress} onChange={setSiteAddress} required usOnly allowManualEntry />
          )}
        </div>
      </div>

      {/* Equipment Configuration */}
      <div className="border-b border-[var(--ss-border)] pb-6">
        <h3 className="text-sm font-semibold text-[var(--ss-text)] mb-4 uppercase tracking-wide">
          Equipment Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Select
            label="Terminal Type"
            value={equipmentConfig.terminal_type}
            onChange={(e) => setEquipmentConfig((f) => ({ ...f, terminal_type: e.target.value }))}
            options={TERMINAL_TYPES}
          />
          <Input
            label="Quantity"
            type="number"
            min="1"
            value={equipmentConfig.terminal_quantity.toString()}
            onChange={(e) => setEquipmentConfig((f) => ({ ...f, terminal_quantity: parseInt(e.target.value) || 1 }))}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'emv_enabled', label: 'EMV Chip' },
            { key: 'contactless_enabled', label: 'Contactless/NFC' },
            { key: 'pin_debit_enabled', label: 'PIN Debit' },
            { key: 'tip_enabled', label: 'Tip Adjust' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 p-3 rounded-lg border border-[var(--ss-border)] cursor-pointer">
              <input
                type="checkbox"
                checked={equipmentConfig[key as keyof EquipmentConfig] as boolean}
                onChange={(e) => setEquipmentConfig((f) => ({ ...f, [key]: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-[var(--ss-text)]">{label}</span>
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoClose"
              checked={equipmentConfig.auto_close}
              onChange={(e) => setEquipmentConfig((f) => ({ ...f, auto_close: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="autoClose" className="text-sm text-[var(--ss-text)]">Auto-Close Batch</label>
          </div>
          {equipmentConfig.auto_close && (
            <Input
              label="Auto-Close Time"
              type="time"
              value={equipmentConfig.auto_close_time}
              onChange={(e) => setEquipmentConfig((f) => ({ ...f, auto_close_time: e.target.value }))}
            />
          )}
        </div>
      </div>

      {/* Front End Configuration */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--ss-text)] mb-4 uppercase tracking-wide">
          Front End (FE) Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Select
            label="Authorization Network"
            value={feConfig.front_end_network}
            onChange={(e) => setFeConfig((f) => ({ ...f, front_end_network: e.target.value }))}
            options={FE_NETWORKS}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <label className="flex items-center gap-2 p-3 rounded-lg border border-[var(--ss-border)] cursor-pointer">
            <input type="checkbox" checked={feConfig.avs_enabled} onChange={(e) => setFeConfig((f) => ({ ...f, avs_enabled: e.target.checked }))} className="rounded" />
            <span className="text-sm text-[var(--ss-text)]">AVS (Address Verification)</span>
          </label>
          <label className="flex items-center gap-2 p-3 rounded-lg border border-[var(--ss-border)] cursor-pointer">
            <input type="checkbox" checked={feConfig.cvv_enabled} onChange={(e) => setFeConfig((f) => ({ ...f, cvv_enabled: e.target.checked }))} className="rounded" />
            <span className="text-sm text-[var(--ss-text)]">CVV Verification</span>
          </label>
          <label className="flex items-center gap-2 p-3 rounded-lg border border-[var(--ss-border)] cursor-pointer">
            <input type="checkbox" checked={feConfig.address_verification} onChange={(e) => setFeConfig((f) => ({ ...f, address_verification: e.target.checked }))} className="rounded" />
            <span className="text-sm text-[var(--ss-text)]">Address Match</span>
          </label>
        </div>
      </div>
    </div>
  )

  // ==========================================================================
  // RENDER STEP 6: REVIEW & SIGN
  // ==========================================================================

  const renderStep6 = () => {
    const hasGovernmentId = uploadedDocs.some((d) => d.type === 'government_id')
    const hasVoidedCheck = uploadedDocs.some((d) => d.type === 'voided_check')

    return (
      <div className="space-y-6">
        {/* Documents Section */}
        <Card className="p-4">
          <h3 className="font-semibold text-[var(--ss-text)] mb-4">Required Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FileInput label="Driver's License" hint="Government-issued photo ID" accept=".pdf,.jpg,.jpeg,.png" onFileSelected={(file) => handleDocUpload(file, 'government_id')} />
              {hasGovernmentId && (
                <div className="flex items-center gap-2 mt-2 text-sm text-[var(--ss-success)]">
                  <Icon name="check_circle" className="w-4 h-4" /> Uploaded
                </div>
              )}
            </div>
            <div>
              <FileInput label="Voided Check" hint="For bank account verification" accept=".pdf,.jpg,.jpeg,.png" onFileSelected={(file) => handleDocUpload(file, 'voided_check')} />
              {hasVoidedCheck && (
                <div className="flex items-center gap-2 mt-2 text-sm text-[var(--ss-success)]">
                  <Icon name="check_circle" className="w-4 h-4" /> Uploaded
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Signature Method Selection */}
        <Card className="p-4">
          <h3 className="font-semibold text-[var(--ss-text)] mb-4">Signature Method</h3>
          <p className="text-sm text-[var(--ss-text-muted)] mb-4">
            Select how the merchant will sign the application agreement
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Click 2 Agree (C2A) Option */}
            <label
              className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                signatureMethod === 'C2A'
                  ? 'border-[var(--ss-primary)] bg-[var(--ss-primary)]/5'
                  : 'border-[var(--ss-border)] hover:border-[var(--ss-primary)]/50'
              }`}
            >
              <input
                type="radio"
                name="signatureMethod"
                value="C2A"
                checked={signatureMethod === 'C2A'}
                onChange={() => setSignatureMethod('C2A')}
                className="sr-only"
              />
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  signatureMethod === 'C2A' ? 'border-[var(--ss-primary)]' : 'border-[var(--ss-border)]'
                }`}>
                  {signatureMethod === 'C2A' && (
                    <div className="w-3 h-3 rounded-full bg-[var(--ss-primary)]" />
                  )}
                </div>
                <span className="font-semibold text-[var(--ss-text)]">Click 2 Agree (C2A)</span>
                <Badge variant="success">Instant</Badge>
              </div>
              <p className="text-sm text-[var(--ss-text-muted)] ml-8">
                Merchant agrees to terms by checking boxes and clicking submit. Fastest method for immediate processing.
              </p>
              <ul className="mt-3 ml-8 space-y-1 text-xs text-[var(--ss-text-muted)]">
                <li className="flex items-center gap-2">
                  <Icon name="check_circle" className="w-3 h-3 text-[var(--ss-success)]" />
                  Immediate submission
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="check_circle" className="w-3 h-3 text-[var(--ss-success)]" />
                  No external signing required
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="check_circle" className="w-3 h-3 text-[var(--ss-success)]" />
                  Digital consent recorded
                </li>
              </ul>
            </label>

            {/* E-Signature Option */}
            <label
              className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                signatureMethod === 'ESIGN'
                  ? 'border-[var(--ss-primary)] bg-[var(--ss-primary)]/5'
                  : 'border-[var(--ss-border)] hover:border-[var(--ss-primary)]/50'
              }`}
            >
              <input
                type="radio"
                name="signatureMethod"
                value="ESIGN"
                checked={signatureMethod === 'ESIGN'}
                onChange={() => setSignatureMethod('ESIGN')}
                className="sr-only"
              />
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  signatureMethod === 'ESIGN' ? 'border-[var(--ss-primary)]' : 'border-[var(--ss-border)]'
                }`}>
                  {signatureMethod === 'ESIGN' && (
                    <div className="w-3 h-3 rounded-full bg-[var(--ss-primary)]" />
                  )}
                </div>
                <span className="font-semibold text-[var(--ss-text)]">E-Signature</span>
                <Badge variant="info">DocuSign</Badge>
              </div>
              <p className="text-sm text-[var(--ss-text-muted)] ml-8">
                Send documents for formal electronic signature via email. Required for certain merchant categories.
              </p>
              <ul className="mt-3 ml-8 space-y-1 text-xs text-[var(--ss-text-muted)]">
                <li className="flex items-center gap-2">
                  <Icon name="check_circle" className="w-3 h-3 text-[var(--ss-success)]" />
                  Legally binding e-signature
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="check_circle" className="w-3 h-3 text-[var(--ss-success)]" />
                  Full document review
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="clock" className="w-3 h-3 text-[var(--ss-warning)]" />
                  Requires merchant email response
                </li>
              </ul>
            </label>
          </div>
        </Card>

        {/* Signer Information */}
        <Card className="p-4">
          <h3 className="font-semibold text-[var(--ss-text)] mb-4">Authorized Signer Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Signer Name (Print)"
              value={signatureData.signer_name}
              onChange={(e) => setSignatureData((f) => ({ ...f, signer_name: e.target.value }))}
              placeholder="John Smith"
              isRequired
            />
            <Input
              label="Title"
              value={signatureData.signer_title}
              onChange={(e) => setSignatureData((f) => ({ ...f, signer_title: e.target.value }))}
              placeholder="Owner"
              isRequired
            />
          </div>

          {signatureMethod === 'ESIGN' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="Email for E-Signature"
                type="email"
                value={signatureData.signer_email}
                onChange={(e) => setSignatureData((f) => ({ ...f, signer_email: e.target.value }))}
                placeholder="signer@company.com"
                helperText="Signature request will be sent to this email"
                isRequired
              />
              <Input
                label="Phone Number"
                value={signatureData.signer_phone}
                onChange={(e) => setSignatureData((f) => ({ ...f, signer_phone: e.target.value }))}
                placeholder="(555) 123-4567"
                helperText="For SMS verification (optional)"
              />
            </div>
          )}
        </Card>

        {/* Click 2 Agree Section */}
        {signatureMethod === 'C2A' && (
          <Card className="p-4">
            <h3 className="font-semibold text-[var(--ss-text)] mb-4">Agreement & Consent</h3>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 rounded-lg border border-[var(--ss-border)] cursor-pointer hover:bg-[var(--ss-surface-alt)]">
                <input
                  type="checkbox"
                  checked={signatureData.agreed_to_terms}
                  onChange={(e) => setSignatureData((f) => ({ ...f, agreed_to_terms: e.target.checked }))}
                  className="mt-0.5 rounded"
                />
                <div>
                  <span className="font-medium text-[var(--ss-text)]">Merchant Processing Agreement (MPA)</span>
                  <p className="text-xs text-[var(--ss-text-muted)] mt-1">
                    I have read and agree to the Merchant Processing Agreement, including all terms, conditions, and operating regulations.
                  </p>
                  <button type="button" className="text-xs text-[var(--ss-primary)] mt-1 hover:underline">
                    View Full Agreement
                  </button>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-lg border border-[var(--ss-border)] cursor-pointer hover:bg-[var(--ss-surface-alt)]">
                <input
                  type="checkbox"
                  checked={signatureData.agreed_to_pricing}
                  onChange={(e) => setSignatureData((f) => ({ ...f, agreed_to_pricing: e.target.checked }))}
                  className="mt-0.5 rounded"
                />
                <div>
                  <span className="font-medium text-[var(--ss-text)]">Pricing Schedule & Fee Disclosure</span>
                  <p className="text-xs text-[var(--ss-text-muted)] mt-1">
                    I acknowledge and accept the pricing schedule including all rates, fees, and charges as disclosed in this application.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-lg border border-[var(--ss-border)] cursor-pointer hover:bg-[var(--ss-surface-alt)]">
                <input
                  type="checkbox"
                  checked={signatureData.agreed_to_ach}
                  onChange={(e) => setSignatureData((f) => ({ ...f, agreed_to_ach: e.target.checked }))}
                  className="mt-0.5 rounded"
                />
                <div>
                  <span className="font-medium text-[var(--ss-text)]">ACH Authorization</span>
                  <p className="text-xs text-[var(--ss-text-muted)] mt-1">
                    I authorize Fiserv to initiate ACH debits and credits to the bank account provided for fees, chargebacks, and adjustments.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-lg border border-[var(--ss-border)] cursor-pointer hover:bg-[var(--ss-surface-alt)]">
                <input
                  type="checkbox"
                  checked={signatureData.agreed_to_pci}
                  onChange={(e) => setSignatureData((f) => ({ ...f, agreed_to_pci: e.target.checked }))}
                  className="mt-0.5 rounded"
                />
                <div>
                  <span className="font-medium text-[var(--ss-text)]">PCI DSS Compliance Agreement</span>
                  <p className="text-xs text-[var(--ss-text-muted)] mt-1">
                    I agree to maintain PCI DSS compliance and complete the annual Self-Assessment Questionnaire (SAQ).
                  </p>
                </div>
              </label>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-[var(--ss-surface-alt)] border border-[var(--ss-border)]">
              <p className="text-sm text-[var(--ss-text)]">
                <strong>Signature Date:</strong> {new Date().toLocaleDateString()}
              </p>
              <p className="text-xs text-[var(--ss-text-muted)] mt-2">
                By clicking "Submit Application", I certify that the information provided is true and accurate. I understand that my electronic consent constitutes a legal signature under the E-SIGN Act.
              </p>
            </div>
          </Card>
        )}

        {/* E-Signature Section */}
        {signatureMethod === 'ESIGN' && (
          <Card className="p-4">
            <h3 className="font-semibold text-[var(--ss-text)] mb-4">E-Signature Process</h3>

            {!signatureData.esign_sent ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-[var(--ss-primary)]/30 bg-[var(--ss-primary)]/5 p-4">
                  <div className="flex gap-3">
                    <Icon name="money_transfer" className="w-5 h-5 text-[var(--ss-primary)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[var(--ss-text)]">Ready to Send</p>
                      <p className="text-sm text-[var(--ss-text-muted)] mt-1">
                        Click the button below to send the Merchant Processing Agreement to <strong>{signatureData.signer_email || 'the signer'}</strong> for electronic signature.
                      </p>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3 p-4 rounded-lg border border-[var(--ss-border)] cursor-pointer hover:bg-[var(--ss-surface-alt)]">
                  <input
                    type="checkbox"
                    checked={signatureData.esign_consent}
                    onChange={(e) => setSignatureData((f) => ({ ...f, esign_consent: e.target.checked }))}
                    className="mt-0.5 rounded"
                  />
                  <div>
                    <span className="font-medium text-[var(--ss-text)]">E-Signature Consent</span>
                    <p className="text-xs text-[var(--ss-text-muted)] mt-1">
                      I consent to use electronic signatures and understand that documents will be sent via email for signing.
                    </p>
                  </div>
                </label>

                <Button
                  onClick={async () => {
                    if (!signatureData.signer_email || !signatureData.esign_consent) {
                      pushToast({
                        variant: 'error',
                        title: 'Missing Information',
                        message: 'Please provide signer email and consent to e-signature',
                      })
                      return
                    }
                    setSendingEsign(true)
                    try {
                      // API call to send e-signature request
                      const res = await Api.merchantsApi.sendEsignRequest(merchantId!, {
                        signer_name: signatureData.signer_name,
                        signer_email: signatureData.signer_email,
                        signer_title: signatureData.signer_title,
                      })
                      if (res.success) {
                        setSignatureData((f) => ({
                          ...f,
                          esign_sent: true,
                          esign_document_id: res.document_id || '',
                        }))
                        pushToast({
                          variant: 'success',
                          title: 'E-Signature Sent',
                          message: `Signature request sent to ${signatureData.signer_email}`,
                        })
                      }
                    } catch (error: any) {
                      pushToast({
                        variant: 'error',
                        title: 'Send Failed',
                        message: error?.message || 'Failed to send e-signature request',
                      })
                    } finally {
                      setSendingEsign(false)
                    }
                  }}
                  disabled={sendingEsign || !signatureData.esign_consent || !signatureData.signer_email}
                  className="w-full"
                >
                  {sendingEsign ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Icon name="money_transfer" className="w-4 h-4 mr-2" />
                      Send E-Signature Request
                    </>
                  )}
                </Button>
              </div>
            ) : !signatureData.esign_completed ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-[var(--ss-warning)] bg-[var(--ss-warning)]/10 p-4">
                  <div className="flex gap-3">
                    <Icon name="clock" className="w-5 h-5 text-[var(--ss-warning)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[var(--ss-text)]">Awaiting Signature</p>
                      <p className="text-sm text-[var(--ss-text-muted)] mt-1">
                        E-signature request sent to <strong>{signatureData.signer_email}</strong>. Waiting for the merchant to complete signing.
                      </p>
                      {signatureData.esign_document_id && (
                        <p className="text-xs text-[var(--ss-text-muted)] mt-2">
                          Document ID: {signatureData.esign_document_id}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      // Check e-signature status
                      try {
                        const res = await Api.merchantsApi.checkEsignStatus(merchantId!, signatureData.esign_document_id)
                        if (res.completed) {
                          setSignatureData((f) => ({ ...f, esign_completed: true }))
                          pushToast({
                            variant: 'success',
                            title: 'Signature Complete',
                            message: 'E-signature has been completed',
                          })
                        } else {
                          pushToast({
                            variant: 'info',
                            title: 'Still Pending',
                            message: 'E-signature has not been completed yet',
                          })
                        }
                      } catch {
                        pushToast({
                          variant: 'error',
                          title: 'Check Failed',
                          message: 'Could not check signature status',
                        })
                      }
                    }}
                  >
                    <Icon name="refresh" className="w-4 h-4 mr-2" />
                    Check Status
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      // Resend e-signature
                      setSendingEsign(true)
                      try {
                        await Api.merchantsApi.resendEsignRequest(merchantId!, signatureData.esign_document_id)
                        pushToast({
                          variant: 'success',
                          title: 'Resent',
                          message: 'E-signature request resent',
                        })
                      } catch {
                        pushToast({
                          variant: 'error',
                          title: 'Resend Failed',
                          message: 'Could not resend e-signature request',
                        })
                      } finally {
                        setSendingEsign(false)
                      }
                    }}
                    disabled={sendingEsign}
                  >
                    <Icon name="money_transfer" className="w-4 h-4 mr-2" />
                    Resend
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-[var(--ss-success)] bg-[var(--ss-success)]/10 p-4">
                <div className="flex gap-3">
                  <Icon name="check_circle" className="w-5 h-5 text-[var(--ss-success)] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[var(--ss-text)]">E-Signature Completed</p>
                    <p className="text-sm text-[var(--ss-text-muted)] mt-1">
                      The merchant has signed all required documents electronically.
                    </p>
                    <p className="text-xs text-[var(--ss-text-muted)] mt-2">
                      Document ID: {signatureData.esign_document_id}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Summary */}
        <Card className="p-4">
          <h3 className="font-semibold text-[var(--ss-text)] mb-3">Application Summary</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <p className="text-[var(--ss-text-muted)]">Business:</p>
            <p className="text-[var(--ss-text)]">{businessInfo.legal_name || '-'}</p>
            <p className="text-[var(--ss-text-muted)]">Owners:</p>
            <p className="text-[var(--ss-text)]">{owners.length} ({getTotalOwnership()}% ownership)</p>
            <p className="text-[var(--ss-text-muted)]">Bank:</p>
            <p className="text-[var(--ss-text)]">{bankInfo.bank_name || '-'}</p>
            <p className="text-[var(--ss-text-muted)]">Monthly Volume:</p>
            <p className="text-[var(--ss-text)]">${parseFloat(processingInfo.monthly_volume || '0').toLocaleString()}</p>
            <p className="text-[var(--ss-text-muted)]">Terminal:</p>
            <p className="text-[var(--ss-text)]">{TERMINAL_TYPES.find(t => t.value === equipmentConfig.terminal_type)?.label || '-'}</p>
          </div>
        </Card>

        {onboarding?.status === 'draft' && (
          <div className="rounded-lg border border-[var(--ss-warning)] bg-[var(--ss-warning)]/10 p-4">
            <div className="flex gap-3">
              <Icon name="warning" className="w-5 h-5 text-[var(--ss-warning)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[var(--ss-text)]">Ready to Submit</p>
                <p className="text-sm text-[var(--ss-text-muted)] mt-1">
                  Please review all information carefully. Once submitted, the application will be sent to Fiserv for credit underwriting.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--ss-primary)]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/merchants')} className="flex items-center gap-1 text-sm text-[var(--ss-text-muted)] hover:text-[var(--ss-text)] mb-2">
            <Icon name="chevron_right" className="w-4 h-4 rotate-180" />
            Back to Merchants
          </button>
          <h1 className="font-headline text-xl font-semibold text-[var(--ss-text)]">Payment Processing Onboarding</h1>
          <p className="mt-1 text-sm text-[var(--ss-text-muted)]">Complete Fiserv AccessOne merchant application</p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge()}
          {onboarding?.status !== 'draft' && (
            <Button variant="outline" size="sm" onClick={checkStatus} disabled={saving}>Check Status</Button>
          )}
        </div>
      </div>

      {/* Progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--ss-text)]">Step {currentStep} of {STEPS.length}</span>
          <span className="text-sm text-[var(--ss-text-muted)]">{onboarding?.completion_percentage || 0}% Complete</span>
        </div>
        <ProgressBar value={onboarding?.completion_percentage || 0} max={100} />

        <div className="flex justify-between mt-4 overflow-x-auto">
          {STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => onboarding?.status === 'draft' && setCurrentStep(step.id)}
              disabled={onboarding?.status !== 'draft'}
              className={`flex flex-col items-center flex-1 min-w-[80px] ${
                step.id === currentStep ? 'text-[var(--ss-primary)]' : step.id < currentStep ? 'text-[var(--ss-success)]' : 'text-[var(--ss-text-muted)]'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                step.id === currentStep ? 'bg-[var(--ss-primary)] text-white' : step.id < currentStep ? 'bg-[var(--ss-success)] text-white' : 'bg-[var(--ss-surface-alt)]'
              }`}>
                {step.id < currentStep ? <Icon name="check_circle" className="w-4 h-4" /> : step.id}
              </div>
              <span className="text-xs mt-1 font-medium">{step.title}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Reference IDs */}
      {onboarding && (
        <div className="flex gap-4 text-xs text-[var(--ss-text-muted)]">
          <span>Ref: {onboarding.ext_ref_id}</span>
          {onboarding.mpa_id && <span>MPA: {onboarding.mpa_id}</span>}
          {onboarding.north_number && <span>North: {onboarding.north_number}</span>}
        </div>
      )}

      {/* Step Content */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[var(--ss-text)] mb-1">{STEPS[currentStep - 1].title}</h2>
        <p className="text-sm text-[var(--ss-text-muted)] mb-6">{STEPS[currentStep - 1].description}</p>

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
        {currentStep === 6 && renderStep6()}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-4 border-t border-[var(--ss-border)]">
          <Button variant="outline" onClick={() => setCurrentStep((s) => Math.max(1, s - 1))} disabled={currentStep === 1 || saving || onboarding?.status !== 'draft'}>
            Previous
          </Button>

          <div className="flex gap-2">
            {onboarding?.status === 'draft' && currentStep < 6 && (
              <>
                <Button variant="outline" onClick={() => saveStep()} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                <Button onClick={() => saveStep(currentStep + 1)} disabled={saving}>{saving ? 'Saving...' : 'Next'}</Button>
              </>
            )}

            {onboarding?.status === 'draft' && currentStep === 6 && (
              <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Application'}</Button>
            )}

            {onboarding?.status !== 'draft' && (
              <Button variant="outline" onClick={() => navigate('/merchants')}>Back to Merchants</Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

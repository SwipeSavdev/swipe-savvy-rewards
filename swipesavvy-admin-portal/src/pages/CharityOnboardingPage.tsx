import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Icon from '@/components/ui/Icon'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import ProgressBar from '@/components/ui/ProgressBar'
import Select from '@/components/ui/Select'
import Table, { type TableColumn } from '@/components/ui/Table'
import { useToastStore } from '@/store/toastStore'
import { useEffect, useMemo, useState } from 'react'

interface CharityApplication {
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

interface CharityOnboardingStep {
  step: number
  title: string
  description: string
  required: boolean
  documentType: string
}

const ONBOARDING_STEPS: CharityOnboardingStep[] = [
  {
    step: 1,
    title: 'Organization Information',
    description: 'Basic details about the charity organization',
    required: true,
    documentType: 'organization_info',
  },
  {
    step: 2,
    title: 'Legal Documentation',
    description: 'Registration certificate and tax ID documentation',
    required: true,
    documentType: 'legal_docs',
  },
  {
    step: 3,
    title: 'Bank Details',
    description: 'Bank account information for fund transfers',
    required: true,
    documentType: 'bank_details',
  },
  {
    step: 4,
    title: 'Impact Report',
    description: 'Annual impact report and financial statements',
    required: true,
    documentType: 'impact_report',
  },
  {
    step: 5,
    title: 'Beneficiary Information',
    description: 'Details about beneficiary groups served',
    required: false,
    documentType: 'beneficiary_info',
  },
]

const CHARITY_CATEGORIES = [
  'Health & Medical',
  'Education',
  'Poverty & Homelessness',
  'Environment',
  'Disaster Relief',
  'Animal Welfare',
  'Arts & Culture',
  'Community Development',
  'Food & Nutrition',
  'Other',
]

const MOCK_APPLICATIONS: CharityApplication[] = [
  {
    id: 'charity-001',
    name: 'Global Health Foundation',
    email: 'info@globalhealthfoundation.org',
    phone: '+1-555-0101',
    category: 'Health & Medical',
    registrationNumber: 'GHF-2020-1234',
    country: 'United States',
    website: 'globalhealthfoundation.org',
    documentsSubmitted: 4,
    status: 'pending',
    completionPercentage: 80,
    submittedAt: '2025-12-28',
  },
  {
    id: 'charity-002',
    name: 'Education for All Initiative',
    email: 'contact@educationforall.org',
    phone: '+44-20-1234-5678',
    category: 'Education',
    registrationNumber: 'EFA-2019-5678',
    country: 'United Kingdom',
    website: 'educationforall.org',
    documentsSubmitted: 5,
    status: 'approved',
    completionPercentage: 100,
    submittedAt: '2025-11-15',
    approvedAt: '2025-12-01',
  },
  {
    id: 'charity-003',
    name: 'Clean Water Project',
    email: 'support@cleanwater.org',
    phone: '+234-1-234-5678',
    category: 'Community Development',
    registrationNumber: 'CWP-2021-9012',
    country: 'Nigeria',
    documentsSubmitted: 2,
    status: 'incomplete',
    completionPercentage: 40,
    submittedAt: '2025-12-20',
  },
  {
    id: 'charity-004',
    name: 'Wildlife Conservation Society',
    email: 'hello@wildlifeconsv.org',
    phone: '+61-2-9876-5432',
    category: 'Environment',
    registrationNumber: 'WCS-2018-3456',
    country: 'Australia',
    website: 'wildlifeconsv.org',
    documentsSubmitted: 5,
    status: 'approved',
    completionPercentage: 100,
    submittedAt: '2025-10-05',
    approvedAt: '2025-10-20',
  },
  {
    id: 'charity-005',
    name: 'Emergency Relief Fund',
    email: 'admin@emergencyrelief.org',
    phone: '+1-555-0505',
    category: 'Disaster Relief',
    registrationNumber: 'ERF-2022-7890',
    country: 'United States',
    documentsSubmitted: 3,
    status: 'rejected',
    completionPercentage: 60,
    submittedAt: '2025-12-10',
    notes: 'Missing required legal documentation',
  },
]

export default function CharityOnboardingPage() {
  const pushToast = useToastStore((s) => s.push)
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<CharityApplication[]>([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const [showModal, setShowModal] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedApp, setSelectedApp] = useState<CharityApplication | null>(null)
  const [formData, setFormData] = useState<Partial<CharityApplication>>({})
  const [isApproving, setIsApproving] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isCreating, setIsCreating] = useState(false)

  // Load applications
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        let filtered = MOCK_APPLICATIONS

        if (query) {
          const lowerQuery = query.toLowerCase()
          filtered = filtered.filter(
            (a) =>
              a.name.toLowerCase().includes(lowerQuery) ||
              a.email.toLowerCase().includes(lowerQuery) ||
              a.registrationNumber.toLowerCase().includes(lowerQuery)
          )
        }
        if (statusFilter !== 'all') {
          filtered = filtered.filter((a) => a.status === statusFilter)
        }
        if (categoryFilter !== 'all') {
          filtered = filtered.filter((a) => a.category === categoryFilter)
        }

        if (mounted) {
          setApplications(filtered)
        }
      } catch (error) {
        pushToast({
          variant: 'error',
          message: 'Failed to load charity applications',
        })
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [query, statusFilter, categoryFilter, pushToast])

  const handleViewDetails = (app: CharityApplication) => {
    setSelectedApp(app)
    setFormData(app)
    setShowModal(true)
    setCurrentStep(1)
  }

  const handleEditClick = (app: CharityApplication) => {
    setSelectedApp(app)
    setFormData(app)
    setShowCreateForm(true)
    setCurrentStep(1)
  }

  const handleApprove = async () => {
    if (!selectedApp) return

    setIsApproving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setApplications(
        applications.map((a) =>
          a.id === selectedApp.id
            ? {
                ...a,
                status: 'approved' as const,
                approvedAt: new Date().toISOString().split('T')[0],
              }
            : a
        )
      )

      pushToast({
        variant: 'success',
        message: `${selectedApp.name} approved successfully`,
      })
      setShowModal(false)
      setSelectedApp(null)
      setFormData({})
    } catch (error) {
      pushToast({
        variant: 'error',
        message: 'Failed to approve application',
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!selectedApp) return

    setIsApproving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const rejectionNotes = (formData as any).notes || 'Application rejected by admin'

      setApplications(
        applications.map((a) =>
          a.id === selectedApp.id
            ? {
                ...a,
                status: 'rejected' as const,
                notes: rejectionNotes,
              }
            : a
        )
      )

      pushToast({
        variant: 'success',
        message: `${selectedApp.name} rejected`,
      })
      setShowModal(false)
      setSelectedApp(null)
      setFormData({})
    } catch (error) {
      pushToast({
        variant: 'error',
        message: 'Failed to reject application',
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleCreateNew = async () => {
    if (!formData.name || !formData.email || !formData.category) {
      pushToast({
        variant: 'error',
        message: 'Please fill in all required fields',
      })
      return
    }

    setIsCreating(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newCharity: CharityApplication = {
        id: `charity-${Date.now()}`,
        name: formData.name!,
        email: formData.email!,
        phone: formData.phone || '',
        category: formData.category!,
        registrationNumber: formData.registrationNumber || `REG-${Date.now()}`,
        country: formData.country || 'United States',
        website: formData.website,
        documentsSubmitted: 0,
        status: 'incomplete',
        completionPercentage: 0,
        submittedAt: new Date().toISOString().split('T')[0],
      }

      setApplications([...applications, newCharity])
      pushToast({
        variant: 'success',
        message: `${newCharity.name} created successfully`,
      })
      setShowCreateForm(false)
      setFormData({})
      setCurrentStep(1)
      setSelectedApp(null)
    } catch (error) {
      pushToast({
        variant: 'error',
        message: 'Failed to create charity',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedApp) return

    setIsCreating(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setApplications(
        applications.map((a) =>
          a.id === selectedApp.id ? { ...a, ...formData } : a
        )
      )

      pushToast({
        variant: 'success',
        message: `${selectedApp.name} updated successfully`,
      })
      setShowCreateForm(false)
      setFormData({})
      setCurrentStep(1)
      setSelectedApp(null)
    } catch (error) {
      pushToast({
        variant: 'error',
        message: 'Failed to update charity',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this charity application?')) {
      return
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      setApplications(applications.filter((a) => a.id !== id))
      pushToast({
        variant: 'success',
        message: 'Charity application deleted',
      })
    } catch (error) {
      pushToast({
        variant: 'error',
        message: 'Failed to delete application',
      })
    }
  }

  const tableColumns: TableColumn<CharityApplication>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Organization',
        cell: (row) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-[var(--ss-text)]">{row.name}</span>
            <span className="text-xs text-[var(--ss-text-muted)]">{row.registrationNumber}</span>
          </div>
        ),
      },
      {
        key: 'category',
        header: 'Category',
        cell: (row) => <Badge variant="primary">{row.category}</Badge>,
      },
      {
        key: 'completionPercentage',
        header: 'Progress',
        cell: (row) => (
          <div className="flex items-center gap-2">
            <ProgressBar value={row.completionPercentage} max={100} />
            <span className="text-sm font-medium text-[var(--ss-text)] whitespace-nowrap">{row.completionPercentage}%</span>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (row) => {
          const variantMap: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'primary'> = {
            pending: 'warning',
            approved: 'success',
            rejected: 'danger',
            incomplete: 'neutral',
          }
          return <Badge variant={variantMap[row.status] || 'neutral'}>{row.status}</Badge>
        },
      },
      {
        key: 'documentsSubmitted',
        header: 'Docs',
        cell: (row) => <span className="text-sm text-[var(--ss-text)] whitespace-nowrap">{row.documentsSubmitted}</span>,
      },
      {
        key: 'submittedAt',
        header: 'Submitted',
        cell: (row) => <span className="text-sm text-[var(--ss-text-muted)] whitespace-nowrap">{row.submittedAt}</span>,
      },
      {
        key: 'id',
        header: 'Actions',
        cell: (row) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewDetails(row)}
            >
              View
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleEditClick(row)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleDelete(row.id)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  const stats = useMemo(
    () => {
      const all = MOCK_APPLICATIONS
      return {
        total: all.length,
        approved: all.filter((a) => a.status === 'approved').length,
        pending: all.filter((a) => a.status === 'pending').length,
        incomplete: all.filter((a) => a.status === 'incomplete').length,
        rejected: all.filter((a) => a.status === 'rejected').length,
      }
    },
    []
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-[var(--ss-text)]">Charity Onboarding</h1>
          <p className="text-sm text-[var(--ss-text-muted)]">Manage charity registrations and donations</p>
        </div>
        <Button className="flex items-center gap-2 whitespace-nowrap" onClick={() => {
          setSelectedApp(null)
          setFormData({})
          setCurrentStep(1)
          setShowCreateForm(true)
        }}>
          <Icon name="plus" className="h-5 w-5" />
          Add Charity
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="flex flex-col gap-3 items-start">
          <span className="text-xs font-medium text-[var(--ss-text-muted)] uppercase tracking-wide">Total</span>
          <span className="text-3xl font-bold text-[var(--ss-text)]">{stats.total}</span>
        </Card>
        <Card className="flex flex-col gap-3 items-start">
          <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Approved</span>
          <span className="text-3xl font-bold text-green-600">{stats.approved}</span>
        </Card>
        <Card className="flex flex-col gap-3 items-start">
          <span className="text-xs font-medium text-yellow-600 uppercase tracking-wide">Pending</span>
          <span className="text-3xl font-bold text-yellow-600">{stats.pending}</span>
        </Card>
        <Card className="flex flex-col gap-3 items-start">
          <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Incomplete</span>
          <span className="text-3xl font-bold text-blue-600">{stats.incomplete}</span>
        </Card>
        <Card className="flex flex-col gap-3 items-start">
          <span className="text-xs font-medium text-red-600 uppercase tracking-wide">Rejected</span>
          <span className="text-3xl font-bold text-red-600">{stats.rejected}</span>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-[var(--ss-text)] uppercase tracking-wide">Filter Applications</h3>
          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="Search by name, email, or registration number..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'incomplete', label: 'Incomplete' },
                { value: 'rejected', label: 'Rejected' },
              ]}
            />
            <Select
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Categories' },
                ...CHARITY_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Applications Table */}
      <Card>
        <Table
          columns={tableColumns}
          data={applications}
          loading={loading}
          pageSize={10}
        />
      </Card>

      {/* View Details Modal */}
      {selectedApp && showModal && (
        <Modal open={showModal} onClose={() => {
          setShowModal(false)
          setSelectedApp(null)
          setFormData({})
        }}>
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-2 border-b border-[var(--ss-border)] pb-4">
              <h2 className="text-2xl font-bold text-[var(--ss-text)]">{selectedApp.name}</h2>
              <p className="text-sm text-[var(--ss-text-muted)]">{selectedApp.registrationNumber}</p>
            </div>

            {/* Organization Details */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-[var(--ss-text)] uppercase">Organization Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-[var(--ss-text-muted)] uppercase">Email</label>
                  <p className="text-sm text-[var(--ss-text)]">{selectedApp.email}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-[var(--ss-text-muted)] uppercase">Phone</label>
                  <p className="text-sm text-[var(--ss-text)]">{selectedApp.phone}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-[var(--ss-text-muted)] uppercase">Category</label>
                  <p className="text-sm text-[var(--ss-text)]">{selectedApp.category}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-[var(--ss-text-muted)] uppercase">Country</label>
                  <p className="text-sm text-[var(--ss-text)]">{selectedApp.country}</p>
                </div>
              </div>
            </div>

            {/* Onboarding Progress */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-[var(--ss-text)] uppercase">Onboarding Progress</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--ss-text)]">Overall Completion</span>
                  <span className="text-sm font-bold text-[var(--ss-text)]">{selectedApp.completionPercentage}%</span>
                </div>
                <ProgressBar value={selectedApp.completionPercentage} max={100} />
              </div>
              <div className="flex flex-col gap-3 mt-4">
                {ONBOARDING_STEPS.map((step) => (
                  <div key={step.step} className="flex items-start gap-3 p-3 bg-[var(--ss-surface-alt)] rounded-md">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm flex-shrink-0 ${
                      step.step <= Math.ceil(selectedApp.completionPercentage / 20)
                        ? 'bg-green-500 text-white'
                        : 'bg-[var(--ss-border)] text-[var(--ss-text-muted)]'
                    }`}>
                      {step.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--ss-text)]">{step.title}</p>
                      <p className="text-xs text-[var(--ss-text-muted)]">{step.description}</p>
                    </div>
                    <span className="text-xs font-medium text-[var(--ss-text-muted)] whitespace-nowrap">
                      {step.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--ss-border)]">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[var(--ss-text-muted)] uppercase">Submitted</label>
                <p className="text-sm text-[var(--ss-text)]">{selectedApp.submittedAt}</p>
              </div>
              {selectedApp.approvedAt && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-[var(--ss-text-muted)] uppercase">Approved</label>
                  <p className="text-sm text-[var(--ss-text)]">{selectedApp.approvedAt}</p>
                </div>
              )}
            </div>

            {/* Notes */}
            {selectedApp.notes && (
              <div className="flex flex-col gap-2 p-3 bg-red-50 rounded-md border border-red-200">
                <label className="text-xs font-medium text-red-700 uppercase">Notes</label>
                <p className="text-sm text-red-900">{selectedApp.notes}</p>
              </div>
            )}

            {/* Actions */}
            {selectedApp.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t border-[var(--ss-border)]">
                <Button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="flex-1"
                >
                  {isApproving ? 'Approving...' : 'Approve Application'}
                </Button>
                <Button
                  variant="danger"
                  onClick={handleReject}
                  disabled={isApproving}
                  className="flex-1"
                >
                  {isApproving ? 'Rejecting...' : 'Reject Application'}
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <Modal open={showCreateForm} onClose={() => {
          setShowCreateForm(false)
          setSelectedApp(null)
          setFormData({})
          setCurrentStep(1)
        }}>
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-2 border-b border-[var(--ss-border)] pb-4">
              <h2 className="text-2xl font-bold text-[var(--ss-text)]">
                {selectedApp ? 'Edit Charity' : 'Add New Charity'}
              </h2>
              <p className="text-sm text-[var(--ss-text-muted)]">
                Step {currentStep} of {ONBOARDING_STEPS.length}
              </p>
            </div>

            {/* Progress */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--ss-text-muted)] uppercase">Form Progress</span>
                <span className="text-xs font-bold text-[var(--ss-text)]">{Math.round((currentStep / ONBOARDING_STEPS.length) * 100)}%</span>
              </div>
              <ProgressBar value={(currentStep / ONBOARDING_STEPS.length) * 100} max={100} />
            </div>

            {/* Step Content */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-[var(--ss-text)]">Organization Information</h3>
                <Input
                  label="Organization Name"
                  placeholder="e.g., Global Health Foundation"
                  value={(formData as any).name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="contact@charity.org"
                  value={(formData as any).email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Phone Number"
                  placeholder="+1-555-0000"
                  value={(formData as any).phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-[var(--ss-text)]">Legal Documentation</h3>
                <Select
                  label="Category"
                  value={(formData as any).category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  options={CHARITY_CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
                />
                <Input
                  label="Registration Number"
                  placeholder="e.g., GHF-2020-1234"
                  value={(formData as any).registrationNumber || ''}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-[var(--ss-text)]">Bank Details</h3>
                <Input
                  label="Country"
                  placeholder="United States"
                  value={(formData as any).country || ''}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
                <Input
                  label="Website (Optional)"
                  placeholder="https://charity.org"
                  value={(formData as any).website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            )}

            {currentStep === 4 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-[var(--ss-text)]">Impact Report</h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-900">
                    This step requires uploading annual impact reports and financial statements. Document upload functionality coming soon.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-[var(--ss-text)]">Beneficiary Information</h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-900">
                    Provide details about the beneficiary groups served by this charity (optional).
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4 border-t border-[var(--ss-border)]">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="flex-1"
              >
                Previous
              </Button>
              {currentStep < ONBOARDING_STEPS.length ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="flex-1"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={selectedApp ? handleUpdate : handleCreateNew}
                  disabled={isCreating}
                  className="flex-1"
                >
                  {isCreating ? 'Saving...' : selectedApp ? 'Update Charity' : 'Create Charity'}
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

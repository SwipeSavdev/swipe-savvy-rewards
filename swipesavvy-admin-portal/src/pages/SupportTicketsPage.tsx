import { BrandingKitIcon } from '@/components/ui/BrandingKitIcon'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import { Api } from '@/services/api'
import { useToastStore } from '@/store/toastStore'
import { useEventSubscription } from '@/store/eventBusStore'
import { AlertCircle, Bot, Bug, Calendar, ChevronDown, CreditCard, DollarSign, Eye, FileText, Filter, Key, Loader2, Plus, Rocket, Search, Smartphone, Sparkles, Tag, Ticket, Trash2, User, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

// Severity levels for triage system
type Severity = 'critical' | 'high' | 'medium' | 'low'
type Status = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed'
type TicketType = 'mobile_wallet' | 'bug_report' | 'application_issue' | 'account_access' | 'payment_issue' | 'feature_request' | 'refund_request' | 'software_rollout' | 'other'

interface SupportTicket {
  id: string
  subject: string
  description: string
  customer: {
    name: string
    email: string
    phone?: string
  }
  severity: Severity
  status: Status
  type: TicketType
  assignedTo?: string
  createdAt: string
  updatedAt: string
  responseTime?: string
  resolutionTime?: string
  notes?: string[]
}

// Icon component mapping for ticket types
const TICKET_TYPE_ICONS: Record<TicketType, React.ReactNode> = {
  mobile_wallet: <Smartphone className="w-4 h-4" />,
  bug_report: <Bug className="w-4 h-4" />,
  application_issue: <Smartphone className="w-4 h-4" />,
  account_access: <Key className="w-4 h-4" />,
  payment_issue: <CreditCard className="w-4 h-4" />,
  feature_request: <Sparkles className="w-4 h-4" />,
  refund_request: <DollarSign className="w-4 h-4" />,
  software_rollout: <Rocket className="w-4 h-4" />,
  other: <FileText className="w-4 h-4" />,
}

// Ticket type definitions with sample types
const TICKET_TYPES: { value: TicketType; label: string; description: string }[] = [
  { value: 'mobile_wallet', label: 'Mobile Wallet', description: 'Issues with mobile wallet functionality' },
  { value: 'bug_report', label: 'Bug Report', description: 'Software bugs and errors' },
  { value: 'application_issue', label: 'Application Issue', description: 'App crashes, freezes, or performance issues' },
  { value: 'account_access', label: 'Account Access', description: 'Login, password, and account recovery' },
  { value: 'payment_issue', label: 'Payment Issue', description: 'Transaction failures and payment problems' },
  { value: 'feature_request', label: 'Feature Request', description: 'New feature suggestions' },
  { value: 'refund_request', label: 'Refund Request', description: 'Refund and chargeback requests' },
  { value: 'software_rollout', label: 'Software Rollout', description: 'Issues related to new software releases' },
  { value: 'other', label: 'Other', description: 'General inquiries and other issues' },
]

// Severity definitions with SLA requirements
const SEVERITY_CONFIG: { value: Severity; label: string; description: string; responseTime: string; resolutionTime: string; color: string; bgColor: string }[] = [
  { value: 'critical', label: 'Critical', description: 'System down, data loss, security breach', responseTime: '15 min', resolutionTime: '4 hours', color: 'text-[var(--color-status-danger-text)]', bgColor: 'bg-[var(--color-status-danger-bg)]' },
  { value: 'high', label: 'High', description: 'Major feature broken, significant impact', responseTime: '1 hour', resolutionTime: '8 hours', color: 'text-[var(--color-status-warning-text)]', bgColor: 'bg-[var(--color-status-warning-bg)]' },
  { value: 'medium', label: 'Medium', description: 'Feature impaired, workaround available', responseTime: '4 hours', resolutionTime: '24 hours', color: 'text-[var(--color-status-info-text)]', bgColor: 'bg-[var(--color-status-info-bg)]' },
  { value: 'low', label: 'Low', description: 'Minor issue, cosmetic, questions', responseTime: '24 hours', resolutionTime: '72 hours', color: 'text-[var(--color-status-success-text)]', bgColor: 'bg-[var(--color-status-success-bg)]' },
]

const STATUS_CONFIG: { value: Status; label: string; color: string; bgColor: string }[] = [
  { value: 'open', label: 'Open', color: 'text-[var(--color-status-warning-text)]', bgColor: 'bg-[var(--color-status-warning-bg)]' },
  { value: 'in_progress', label: 'In Progress', color: 'text-[var(--color-status-info-text)]', bgColor: 'bg-[var(--color-status-info-bg)]' },
  { value: 'pending', label: 'Pending', color: 'text-[var(--color-status-warning-text)]', bgColor: 'bg-[var(--color-status-warning-bg)]' },
  { value: 'resolved', label: 'Resolved', color: 'text-[var(--color-status-success-text)]', bgColor: 'bg-[var(--color-status-success-bg)]' },
  { value: 'closed', label: 'Closed', color: 'text-[var(--color-text-secondary)]', bgColor: 'bg-[var(--color-bg-secondary)]' },
]

const MOCK_AGENTS = ['Sarah Johnson', 'Michael Chen', 'Emma Rodriguez', 'David Lee', 'Unassigned']

const MOCK_TICKETS: SupportTicket[] = [
  {
    id: 'TKT-001',
    subject: 'Cannot access mobile wallet after update',
    description: 'After the latest app update, I cannot access my mobile wallet. The app crashes every time I try to open it.',
    customer: { name: 'John Smith', email: 'john.smith@email.com', phone: '+1 555-0123' },
    severity: 'critical',
    status: 'in_progress',
    type: 'mobile_wallet',
    assignedTo: 'Sarah Johnson',
    createdAt: '2025-01-07T08:30:00Z',
    updatedAt: '2025-01-07T09:15:00Z',
    responseTime: '12 min',
  },
  {
    id: 'TKT-002',
    subject: 'App crashes during payment',
    description: 'The application crashes whenever I try to complete a payment. This has been happening for 2 days.',
    customer: { name: 'Jane Doe', email: 'jane.doe@email.com' },
    severity: 'high',
    status: 'open',
    type: 'application_issue',
    createdAt: '2025-01-07T10:00:00Z',
    updatedAt: '2025-01-07T10:00:00Z',
  },
  {
    id: 'TKT-003',
    subject: 'Transaction not showing in history',
    description: 'I made a transaction 3 hours ago but it is not appearing in my transaction history.',
    customer: { name: 'Bob Wilson', email: 'bob.wilson@email.com' },
    severity: 'medium',
    status: 'pending',
    type: 'payment_issue',
    assignedTo: 'Michael Chen',
    createdAt: '2025-01-07T07:00:00Z',
    updatedAt: '2025-01-07T11:30:00Z',
    responseTime: '45 min',
  },
  {
    id: 'TKT-004',
    subject: 'Cannot reset password',
    description: 'Password reset email is not being received. Checked spam folder.',
    customer: { name: 'Alice Brown', email: 'alice.brown@email.com' },
    severity: 'medium',
    status: 'resolved',
    type: 'account_access',
    assignedTo: 'Emma Rodriguez',
    createdAt: '2025-01-06T14:00:00Z',
    updatedAt: '2025-01-07T09:00:00Z',
    responseTime: '2 hours',
    resolutionTime: '19 hours',
  },
  {
    id: 'TKT-005',
    subject: 'Missing reward points after purchase',
    description: 'I made a purchase of $150 but did not receive any reward points.',
    customer: { name: 'Charlie Davis', email: 'charlie.davis@email.com' },
    severity: 'low',
    status: 'in_progress',
    type: 'other',
    assignedTo: 'David Lee',
    createdAt: '2025-01-06T16:30:00Z',
    updatedAt: '2025-01-07T08:00:00Z',
    responseTime: '3 hours',
  },
  {
    id: 'TKT-006',
    subject: 'Request for refund on failed transaction',
    description: 'Transaction failed but amount was deducted from my account. Please process refund.',
    customer: { name: 'Eva Martinez', email: 'eva.martinez@email.com', phone: '+1 555-0456' },
    severity: 'high',
    status: 'open',
    type: 'refund_request',
    createdAt: '2025-01-07T11:00:00Z',
    updatedAt: '2025-01-07T11:00:00Z',
  },
  {
    id: 'TKT-007',
    subject: 'Bug: Incorrect balance displayed',
    description: 'My account balance shows $0 even though I have funds. This started after the software rollout.',
    customer: { name: 'Frank Green', email: 'frank.green@email.com' },
    severity: 'critical',
    status: 'in_progress',
    type: 'bug_report',
    assignedTo: 'Sarah Johnson',
    createdAt: '2025-01-07T09:45:00Z',
    updatedAt: '2025-01-07T10:00:00Z',
    responseTime: '8 min',
  },
  {
    id: 'TKT-008',
    subject: 'Feature request: Dark mode',
    description: 'Would love to have a dark mode option in the app for better visibility at night.',
    customer: { name: 'Grace Lee', email: 'grace.lee@email.com' },
    severity: 'low',
    status: 'closed',
    type: 'feature_request',
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-06T14:00:00Z',
    responseTime: '6 hours',
    resolutionTime: '28 hours',
  },
]

const getSeverityConfig = (severity: Severity) =>
  SEVERITY_CONFIG.find((s) => s.value === severity) || SEVERITY_CONFIG.find((s) => s.value === 'medium')!
const getStatusConfig = (status: Status) =>
  STATUS_CONFIG.find((s) => s.value === status) || STATUS_CONFIG.find((s) => s.value === 'open')!
const getTicketType = (type: TicketType) =>
  TICKET_TYPES.find((t) => t.value === type) || TICKET_TYPES.find((t) => t.value === 'other')!

export default function SupportTicketsPage() {
  const pushToast = useToastStore((s) => s.push)
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all')
  const [filterType, setFilterType] = useState<TicketType | 'all'>('all')
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // AI Analysis state
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<{ sentiment?: string; priority_suggestion?: string; category_suggestion?: string } | null>(null)

  useEffect(() => {
    fetchTickets()
  }, [filterStatus, filterSeverity, filterType])

  // Subscribe to ticket events for auto-refresh
  useEventSubscription(
    ['ticket:created', 'ticket:updated', 'ticket:status_changed', 'ticket:resolved', 'ticket:closed'],
    () => {
      fetchTickets()
    }
  )

  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await Api.supportTicketsApi.listTickets(
        1,
        100,
        filterStatus !== 'all' ? filterStatus : undefined,
        undefined
      )

      // Transform API response to match frontend interface
      const transformTicket = (t: any): SupportTicket => ({
        id: t.id || t.ticket_id || '',
        subject: t.subject || '',
        description: t.description || '',
        customer: {
          name: t.customerName || t.customer_name || '',
          email: t.customerEmail || t.customer_email || '',
          phone: t.customerPhone || t.customer_phone || undefined,
        },
        severity: (t.priority || t.severity || 'medium') as Severity,
        status: (t.status || 'open') as Status,
        type: (t.category || t.type || 'other') as TicketType,
        assignedTo: t.assignedTo || t.assigned_to || undefined,
        createdAt: t.createdAt || t.created_at || new Date().toISOString(),
        updatedAt: t.updatedAt || t.updated_at || new Date().toISOString(),
        responseTime: t.responseTime || t.response_time || undefined,
        resolutionTime: t.resolutionTime || t.resolution_time || undefined,
        notes: t.notes || undefined,
      })

      if (response && Array.isArray(response.tickets)) {
        setTickets(response.tickets.map(transformTicket))
      } else if (Array.isArray(response)) {
        setTickets(response.map(transformTicket))
      } else {
        console.warn('API returned unexpected format, using mock data:', response)
        setTickets(MOCK_TICKETS)
      }
    } catch (err: any) {
      console.error('Failed to fetch support tickets:', err)
      setError(err.message)
      setTickets(MOCK_TICKETS)
    } finally {
      setLoading(false)
    }
  }

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    severity: 'medium' as Severity,
    type: 'other' as TicketType,
    assignedTo: '',
  })

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = filterSeverity === 'all' || ticket.severity === filterSeverity
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus
    const matchesType = filterType === 'all' || ticket.type === filterType
    return matchesSearch && matchesSeverity && matchesStatus && matchesType
  })

  // Sort by severity (critical first) then by date
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity]
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const handleCreateTicket = async () => {
    try {
      // Call API to create ticket in database
      const response = await Api.supportTicketsApi.createTicket({
        subject: newTicket.subject,
        description: newTicket.description,
        customer_name: newTicket.customerName,
        customer_email: newTicket.customerEmail,
        priority: newTicket.severity,
        category: newTicket.type,
        status: 'open',
      })

      // Create local ticket object for UI
      const ticket: SupportTicket = {
        id: response?.ticket?.id || response?.id || `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
        subject: newTicket.subject,
        description: newTicket.description,
        customer: {
          name: newTicket.customerName,
          email: newTicket.customerEmail,
          phone: newTicket.customerPhone || undefined,
        },
        severity: newTicket.severity,
        status: 'open',
        type: newTicket.type,
        assignedTo: newTicket.assignedTo || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setTickets([ticket, ...tickets])
      setShowCreateModal(false)
      setNewTicket({
        subject: '',
        description: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        severity: 'medium',
        type: 'other',
        assignedTo: '',
      })

      pushToast({ variant: 'success', title: 'Ticket Created', message: `Ticket ${ticket.id} has been created` })
      // Refresh tickets from server to get accurate data
      fetchTickets()
    } catch (err: any) {
      console.error('Failed to create ticket:', err)
      setError(`Failed to create ticket: ${err?.message || 'Unknown error'}`)
    }
  }

  // AI-powered ticket analysis
  const handleAnalyzeTicket = async (ticketId: string) => {
    setAiAnalyzing(true)
    setAiSuggestions([])
    setAiAnalysis(null)
    try {
      const [analysisRes, suggestionsRes] = await Promise.all([
        Api.aiConciergeApi.analyzeTicket(ticketId),
        Api.aiConciergeApi.getSuggestedResponses(ticketId),
      ])

      if (analysisRes) {
        setAiAnalysis(analysisRes)
      }
      if (suggestionsRes?.suggestions) {
        setAiSuggestions(suggestionsRes.suggestions)
      }
      pushToast({ variant: 'success', title: 'AI Analysis Complete', message: 'Suggestions are ready' })
    } catch (err: any) {
      console.error('Failed to analyze ticket:', err)
      pushToast({ variant: 'error', title: 'Analysis Failed', message: 'Could not analyze ticket' })
    } finally {
      setAiAnalyzing(false)
    }
  }

  const handleUpdateStatus = async (ticketId: string, newStatus: Status) => {
    try {
      await Api.supportTicketsApi.updateTicketStatus(ticketId, newStatus)
      setTickets(tickets.map((t) => (t.id === ticketId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t)))
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus, updatedAt: new Date().toISOString() })
      }
      pushToast({ variant: 'success', title: 'Status Updated', message: `Ticket status changed to ${newStatus}` })
    } catch (err) {
      console.error('Failed to update status:', err)
      // Still update locally for UX
      setTickets(tickets.map((t) => (t.id === ticketId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t)))
    }
  }

  const handleUpdateSeverity = (ticketId: string, newSeverity: Severity) => {
    setTickets(tickets.map((t) => (t.id === ticketId ? { ...t, severity: newSeverity, updatedAt: new Date().toISOString() } : t)))
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, severity: newSeverity, updatedAt: new Date().toISOString() })
    }
  }

  const handleAssign = (ticketId: string, agent: string) => {
    const assignedTo = agent === 'Unassigned' ? undefined : agent
    setTickets(tickets.map((t) => (t.id === ticketId ? { ...t, assignedTo, updatedAt: new Date().toISOString() } : t)))
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, assignedTo, updatedAt: new Date().toISOString() })
    }
  }

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      await Api.supportTicketsApi.deleteTicket(ticketId)
      setTickets(tickets.filter((t) => t.id !== ticketId))
      setSelectedTicket(null)
      pushToast({ variant: 'success', title: 'Ticket Deleted', message: 'Ticket has been removed' })
    } catch (err) {
      console.error('Failed to delete ticket:', err)
      // Still delete locally
      setTickets(tickets.filter((t) => t.id !== ticketId))
      setSelectedTicket(null)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  // Count by severity for quick stats
  const severityCounts = {
    critical: tickets.filter((t) => t.severity === 'critical' && t.status !== 'closed' && t.status !== 'resolved').length,
    high: tickets.filter((t) => t.severity === 'high' && t.status !== 'closed' && t.status !== 'resolved').length,
    medium: tickets.filter((t) => t.severity === 'medium' && t.status !== 'closed' && t.status !== 'resolved').length,
    low: tickets.filter((t) => t.severity === 'low' && t.status !== 'closed' && t.status !== 'resolved').length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Error UI */}
      {error && (
        <Card className="bg-red-50 border border-red-200">
          <div className="p-4 flex items-center gap-3">
            <div className="text-red-600">
              <BrandingKitIcon name="alert_circle" size="md" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600"><XCircle className="w-4 h-4" /></button>
          </div>
        </Card>
      )}

      {/* Loading UI */}
      {loading && (
        <Card className="bg-blue-50 border border-blue-200">
          <div className="p-4 flex items-center gap-3">
            <div className="animate-spin">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
            <p className="text-sm text-blue-800">Loading support tickets...</p>
          </div>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
            <p className="text-gray-600 mt-1">Triage and manage customer support requests</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-action-primary-bg)] text-white rounded-lg hover:opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      {/* Severity Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        {SEVERITY_CONFIG.map((severity) => (
          <button
            key={severity.value}
            onClick={() => setFilterSeverity(filterSeverity === severity.value ? 'all' : severity.value)}
            className={`bg-white rounded-lg border shadow-sm p-4 hover:shadow-md transition-all ${
              filterSeverity === severity.value ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{severity.label}</p>
                <p className={`text-3xl font-bold mt-1 ${severity.color}`}>
                  {severityCounts[severity.value]}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${severity.bgColor}`}>
                <AlertCircle className={`w-5 h-5 ${severity.color}`} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">SLA: {severity.responseTime} response</p>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ticket ID, subject, customer name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-[var(--color-status-info-bg)] border-[var(--color-status-info-border)] text-[var(--color-status-info-text)]' : 'border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as Status | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                {STATUS_CONFIG.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value as Severity | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Severities</option>
                {SEVERITY_CONFIG.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as TicketType | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {TICKET_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-subtle)]">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Ticket</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Customer</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Type</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Severity</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Assigned</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Created</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedTickets.map((ticket) => {
              const severityConfig = getSeverityConfig(ticket.severity)
              const statusConfig = getStatusConfig(ticket.status)
              const ticketType = getTicketType(ticket.type)
              return (
                <tr key={ticket.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-xs font-mono text-gray-500">{ticket.id}</span>
                      <p className="font-medium text-gray-900 mt-0.5">{ticket.subject}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{ticket.customer?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{ticket.customer?.email || ''}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">{TICKET_TYPE_ICONS[ticket.type]}</span>
                      <span className="text-gray-600">{ticketType.label}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityConfig.bgColor} ${severityConfig.color}`}>
                      {severityConfig.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{ticket.assignedTo || 'Unassigned'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{getTimeAgo(ticket.createdAt)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-status-info-text)] hover:bg-[var(--color-status-info-bg)] rounded transition-colors"
                        title="View ticket"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete ticket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {sortedTickets.length === 0 && (
          <div className="p-8 text-center">
            <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-sm font-mono text-gray-500">{selectedTicket.id}</span>
                  <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedTicket.subject}</h2>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Triage Controls */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={selectedTicket.severity}
                    onChange={(e) => handleUpdateSeverity(selectedTicket.id, e.target.value as Severity)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SEVERITY_CONFIG.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value as Status)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUS_CONFIG.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                  <select
                    value={selectedTicket.assignedTo || 'Unassigned'}
                    onChange={(e) => handleAssign(selectedTicket.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {MOCK_AGENTS.map((agent) => (
                      <option key={agent} value={agent}>{agent}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SLA Info */}
              <div className={`p-4 rounded-lg ${getSeverityConfig(selectedTicket.severity).bgColor}`}>
                <h4 className={`font-medium ${getSeverityConfig(selectedTicket.severity).color}`}>
                  {getSeverityConfig(selectedTicket.severity).label} Severity SLA
                </h4>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-gray-600">Response Time: </span>
                    <span className="font-medium">{getSeverityConfig(selectedTicket.severity).responseTime}</span>
                    {selectedTicket.responseTime && (
                      <span className="ml-2 text-green-600">(Responded in {selectedTicket.responseTime})</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-600">Resolution Time: </span>
                    <span className="font-medium">{getSeverityConfig(selectedTicket.severity).resolutionTime}</span>
                    {selectedTicket.resolutionTime && (
                      <span className="ml-2 text-green-600">(Resolved in {selectedTicket.resolutionTime})</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name: </span>
                    <span className="font-medium text-gray-900">{selectedTicket.customer?.name || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email: </span>
                    <span className="font-medium text-gray-900">{selectedTicket.customer?.email || ''}</span>
                  </div>
                  {selectedTicket.customer?.phone && (
                    <div>
                      <span className="text-gray-500">Phone: </span>
                      <span className="font-medium text-gray-900">{selectedTicket.customer.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ticket Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Type: <span className="inline-flex items-center gap-1">{TICKET_TYPE_ICONS[selectedTicket.type]} {getTicketType(selectedTicket.type).label}</span>
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Timeline
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Created: {formatDate(selectedTicket.createdAt)}</p>
                  <p>Last Updated: {formatDate(selectedTicket.updatedAt)}</p>
                </div>
              </div>

              {/* AI Analysis Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-600" />
                    AI Concierge Analysis
                  </h4>
                  <button
                    onClick={() => handleAnalyzeTicket(selectedTicket.id)}
                    disabled={aiAnalyzing}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {aiAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Analyze Ticket
                      </>
                    )}
                  </button>
                </div>

                {/* AI Analysis Results */}
                {aiAnalysis && (
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 mb-4">
                    <h5 className="text-sm font-medium text-purple-800 mb-3">Analysis Results</h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {aiAnalysis.sentiment && (
                        <div className="bg-white/80 rounded-lg p-3">
                          <span className="text-gray-500 block text-xs mb-1">Sentiment</span>
                          <span className={`font-medium capitalize ${
                            aiAnalysis.sentiment === 'positive' ? 'text-green-600' :
                            aiAnalysis.sentiment === 'negative' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            {aiAnalysis.sentiment}
                          </span>
                        </div>
                      )}
                      {aiAnalysis.priority_suggestion && (
                        <div className="bg-white/80 rounded-lg p-3">
                          <span className="text-gray-500 block text-xs mb-1">Suggested Priority</span>
                          <span className="font-medium text-purple-700 capitalize">
                            {aiAnalysis.priority_suggestion}
                          </span>
                        </div>
                      )}
                      {aiAnalysis.category_suggestion && (
                        <div className="bg-white/80 rounded-lg p-3">
                          <span className="text-gray-500 block text-xs mb-1">Suggested Category</span>
                          <span className="font-medium text-indigo-700 capitalize">
                            {aiAnalysis.category_suggestion}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Suggested Responses */}
                {aiSuggestions.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Suggested Responses
                    </h5>
                    <div className="space-y-2">
                      {aiSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="bg-white/80 rounded-lg p-3 text-sm text-gray-700 border border-blue-100 hover:border-blue-300 cursor-pointer transition-colors"
                          onClick={() => {
                            navigator.clipboard.writeText(suggestion)
                            pushToast({ variant: 'success', title: 'Copied!', message: 'Response copied to clipboard' })
                          }}
                          title="Click to copy"
                        >
                          <p>{suggestion}</p>
                          <p className="text-xs text-blue-500 mt-1">Click to copy</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!aiAnalysis && aiSuggestions.length === 0 && !aiAnalyzing && (
                  <p className="text-sm text-gray-500 italic">
                    Click "Analyze Ticket" to get AI-powered insights and suggested responses.
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => handleDeleteTicket(selectedTicket.id)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Delete Ticket
              </button>
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Ticket"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateTicket}
              disabled={!newTicket.subject || !newTicket.description || !newTicket.customerName || !newTicket.customerEmail}
            >
              Create Ticket
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          {/* Customer Name & Email - two columns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Customer Name *</label>
              <input
                type="text"
                value={newTicket.customerName}
                onChange={(e) => setNewTicket({ ...newTicket, customerName: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-[var(--color-border-primary)] rounded-md bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Customer Email *</label>
              <input
                type="email"
                value={newTicket.customerEmail}
                onChange={(e) => setNewTicket({ ...newTicket, customerEmail: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-[var(--color-border-primary)] rounded-md bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
                placeholder="john@email.com"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Phone (Optional)</label>
            <input
              type="tel"
              value={newTicket.customerPhone}
              onChange={(e) => setNewTicket({ ...newTicket, customerPhone: e.target.value })}
              className="w-full px-2.5 py-1.5 text-sm border border-[var(--color-border-primary)] rounded-md bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
              placeholder="+1 555-0123"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Subject *</label>
            <input
              type="text"
              value={newTicket.subject}
              onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
              className="w-full px-2.5 py-1.5 text-sm border border-[var(--color-border-primary)] rounded-md bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
              placeholder="Brief description of the issue"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Description *</label>
            <textarea
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
              className="w-full px-2.5 py-1.5 text-sm border border-[var(--color-border-primary)] rounded-md bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] h-20 resize-none"
              placeholder="Detailed description of the issue..."
            />
          </div>

          {/* Type, Severity, Assign - three columns */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Ticket Type</label>
              <select
                value={newTicket.type}
                onChange={(e) => setNewTicket({ ...newTicket, type: e.target.value as TicketType })}
                className="w-full px-2.5 py-1.5 text-sm border border-[var(--color-border-primary)] rounded-md bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
              >
                {TICKET_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Severity</label>
              <select
                value={newTicket.severity}
                onChange={(e) => setNewTicket({ ...newTicket, severity: e.target.value as Severity })}
                className="w-full px-2.5 py-1.5 text-sm border border-[var(--color-border-primary)] rounded-md bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
              >
                {SEVERITY_CONFIG.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Assign To</label>
              <select
                value={newTicket.assignedTo}
                onChange={(e) => setNewTicket({ ...newTicket, assignedTo: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-[var(--color-border-primary)] rounded-md bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
              >
                <option value="">Unassigned</option>
                {MOCK_AGENTS.filter((a) => a !== 'Unassigned').map((agent) => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>
            </div>
          </div>

          {/* SLA Preview - compact */}
          <div className={`p-3 rounded-md ${getSeverityConfig(newTicket.severity).bgColor}`}>
            <h4 className={`text-xs font-medium ${getSeverityConfig(newTicket.severity).color}`}>
              {getSeverityConfig(newTicket.severity).label} SLA
            </h4>
            <div className="flex gap-4 mt-1 text-xs text-[var(--color-text-secondary)]">
              <span>Response: {getSeverityConfig(newTicket.severity).responseTime}</span>
              <span>Resolution: {getSeverityConfig(newTicket.severity).resolutionTime}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

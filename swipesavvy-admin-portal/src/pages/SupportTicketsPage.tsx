import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Table, { type TableColumn } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Form from '@/components/ui/Form'
import TextArea from '@/components/ui/TextArea'
import { Api } from '@/services/api'
import type { SupportTicket } from '@/types/support'
import { formatDateTime } from '@/utils/dates'
import { useToastStore } from '@/store/toastStore'

const priorityVariant = (p: SupportTicket['priority']) => (p === 'urgent' || p === 'high' ? 'danger' : p === 'medium' ? 'warning' : 'neutral')
const statusVariant = (s: SupportTicket['status']) => (s === 'resolved' || s === 'closed' ? 'success' : s === 'in_progress' ? 'warning' : 'neutral')

type ModalMode = 'view' | 'edit' | 'create'

export default function SupportTicketsPage() {
  const pushToast = useToastStore((s) => s.push)

  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('view')
  const [selected, setSelected] = useState<SupportTicket | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Form states for editing/creating
  const [formData, setFormData] = useState<{
    subject: string
    description: string
    priority: SupportTicket['priority']
    status: SupportTicket['status']
    customerName: string
    customerEmail: string
  }>({
    subject: '',
    description: '',
    priority: 'medium',
    status: 'open',
    customerName: '',
    customerEmail: '',
  })
  const [note, setNote] = useState('')

  // Fetch tickets
  const fetchTickets = async () => {
    let mounted = true
    setLoading(true)
    try {
      const res = await Api.supportTicketsApi.listTickets(
        1,
        100,
        status === 'all' ? undefined : status,
        undefined
      )
      if (mounted) setTickets((res.tickets || []).map((t: any) => ({
        id: t.id,
        subject: t.title,
        description: t.description,
        customerName: t.customerName,
        customerEmail: t.customerEmail,
        status: t.status,
        priority: t.priority,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })))
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
      pushToast({ variant: 'error', title: 'Error', message: 'Failed to load tickets' })
    } finally {
      if (mounted) setLoading(false)
    }
    return () => { mounted = false }
  }

  useEffect(() => {
    fetchTickets()
  }, [status])

  // CREATE: Open create modal
  const openCreateModal = () => {
    setModalMode('create')
    setFormData({
      subject: '',
      description: '',
      priority: 'medium',
      status: 'open',
      customerName: '',
      customerEmail: '',
    })
    setNote('')
    setModalOpen(true)
  }

  // READ: Open view/edit modal
  const openViewModal = (ticket: SupportTicket) => {
    setModalMode('view')
    setSelected(ticket)
    setFormData({
      subject: ticket.subject,
      description: ticket.description || '',
      priority: ticket.priority,
      status: ticket.status,
      customerName: ticket.customerName,
      customerEmail: ticket.customerEmail,
    })
    setNote('')
    setModalOpen(true)
  }

  // Enter edit mode from view
  const enterEditMode = () => {
    setModalMode('edit')
  }

  // CREATE: Submit new ticket
  const createTicket = async () => {
    if (!formData.subject || !formData.description || !formData.customerEmail) {
      pushToast({ variant: 'warning', title: 'Required fields', message: 'Please fill in all required fields' })
      return
    }

    setIsSaving(true)
    try {
      await Api.supportTicketsApi.createTicket({
        customer_id: crypto.randomUUID(),
        category: 'other',
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority,
      })

      pushToast({ variant: 'success', title: 'Created', message: 'Ticket created successfully' })
      setModalOpen(false)
      await fetchTickets()
    } catch (error) {
      console.error('Failed to create ticket:', error)
      pushToast({ variant: 'error', title: 'Error', message: 'Failed to create ticket' })
    } finally {
      setIsSaving(false)
    }
  }

  // UPDATE: Save ticket changes
  const updateTicket = async () => {
    if (!selected) return

    setIsSaving(true)
    try {
      await Api.supportTicketsApi.updateTicket(selected.id, {
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
      })

      pushToast({ variant: 'success', title: 'Updated', message: 'Ticket updated successfully' })
      setModalOpen(false)
      await fetchTickets()
    } catch (error) {
      console.error('Failed to update ticket:', error)
      pushToast({ variant: 'error', title: 'Error', message: 'Failed to update ticket' })
    } finally {
      setIsSaving(false)
    }
  }

  // UPDATE: Change status
  const updateStatus = async (newStatus: string) => {
    if (!selected) return

    setIsSaving(true)
    try {
      await Api.supportTicketsApi.updateTicketStatus(selected.id, newStatus)
      setFormData({ ...formData, status: newStatus as any })
      pushToast({ variant: 'success', title: 'Updated', message: `Status changed to ${newStatus}` })
      await fetchTickets()
    } catch (error) {
      console.error('Failed to update status:', error)
      pushToast({ variant: 'error', title: 'Error', message: 'Failed to update status' })
    } finally {
      setIsSaving(false)
    }
  }

  // DELETE: Confirm deletion
  const confirmDelete = () => {
    setShowDeleteConfirm(true)
  }

  // DELETE: Execute deletion
  const deleteTicket = async () => {
    if (!selected) return

    setIsDeleting(true)
    try {
      await Api.supportTicketsApi.deleteTicket(selected.id)
      pushToast({ variant: 'success', title: 'Deleted', message: 'Ticket deleted successfully' })
      setModalOpen(false)
      setShowDeleteConfirm(false)
      await fetchTickets()
    } catch (error) {
      console.error('Failed to delete ticket:', error)
      pushToast({ variant: 'error', title: 'Error', message: 'Failed to delete ticket' })
    } finally {
      setIsDeleting(false)
    }
  }

  // Close modal
  const closeModal = () => {
    setModalOpen(false)
    setShowDeleteConfirm(false)
    setSelected(null)
    setNote('')
  }

  const columns: TableColumn<SupportTicket>[] = useMemo(
    () => [
      {
        key: 'subject',
        header: 'Ticket',
        sortable: true,
        accessor: (t) => t.subject,
        cell: (t) => (
          <div className="min-w-0">
            <p className="truncate font-semibold">{t.subject}</p>
            <p className="truncate text-xs text-[var(--ss-text-muted)]">
              {t.customerName} · {t.customerEmail}
            </p>
          </div>
        ),
      },
      {
        key: 'priority',
        header: 'Priority',
        sortable: true,
        accessor: (t) => t.priority,
        cell: (t) => <Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge>,
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        accessor: (t) => t.status,
        cell: (t) => <Badge variant={statusVariant(t.status)}>{t.status}</Badge>,
      },
      {
        key: 'updatedAt',
        header: 'Updated',
        sortable: true,
        accessor: (t) => t.updatedAt,
        cell: (t) => <span className="text-[var(--ss-text-muted)]">{formatDateTime(t.updatedAt)}</span>,
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        cell: (t) => (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => openViewModal(t)}>
              View
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              setSelected(t)
              setShowDeleteConfirm(true)
            }}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-40 -mx-6 -mt-6 bg-[var(--ss-bg)] px-6 py-4 mb-6 border-b border-[var(--ss-border)] flex items-center justify-between">
        <div>
          <h1 className="font-headline text-xl font-semibold text-[var(--ss-text)]">Support Tickets</h1>
          <p className="mt-1 text-sm text-[var(--ss-text-muted)]">Triaging and resolving customer issues.</p>
        </div>
        <Button onClick={openCreateModal}>+ New Ticket</Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:w-[420px]">
            <Input placeholder="Search tickets..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="w-full md:w-[220px]">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All statuses' },
                { value: 'open', label: 'Open' },
                { value: 'in_progress', label: 'In progress' },
                { value: 'resolved', label: 'Resolved' },
                { value: 'closed', label: 'Closed' },
              ]}
            />
          </div>
        </div>

        <div className="mt-4">
          <Table data={tickets} columns={columns} loading={loading} pageSize={10} emptyMessage="No tickets found." />
        </div>
      </Card>

      {/* MAIN MODAL: View/Edit/Create */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={
          modalMode === 'create'
            ? 'Create Support Ticket'
            : modalMode === 'edit'
              ? `Edit Ticket #${selected?.id}`
              : `Ticket #${selected?.id}`
        }
        footer={
          <div className="flex items-center justify-between gap-3">
            {/* Left: Delete button (only in view mode) */}
            {modalMode === 'view' && selected && (
              <Button variant="danger" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            )}
            {modalMode !== 'view' && modalMode !== 'create' && <div />}
            
            {/* Right: Action buttons */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={closeModal}>
                {modalMode === 'edit' ? 'Cancel' : 'Close'}
              </Button>
              {modalMode === 'view' && (
                <Button onClick={enterEditMode}>Edit</Button>
              )}
              {modalMode === 'edit' && (
                <Button onClick={updateTicket} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
              {modalMode === 'create' && (
                <Button onClick={createTicket} disabled={isSaving}>
                  {isSaving ? 'Creating...' : 'Create Ticket'}
                </Button>
              )}
            </div>
          </div>
        }
      >
        <Form spacing="md" onSubmit={(e) => e.preventDefault()} className="max-h-[60vh] overflow-y-auto">
          {/* Customer Info - Display when not creating */}
          {modalMode !== 'create' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-alt)] p-4 text-sm">
                <p className="text-xs text-[var(--ss-text-muted)]">Customer</p>
                <p className="mt-1 font-semibold text-[var(--ss-text)]">{formData.customerName}</p>
                <p className="text-xs text-[var(--ss-text-muted)]">{formData.customerEmail}</p>
              </div>
              <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-alt)] p-4 text-sm">
                <p className="text-xs text-[var(--ss-text-muted)]">Created</p>
                <p className="mt-1 font-semibold text-[var(--ss-text)]">{selected && formatDateTime(selected.createdAt)}</p>
                <p className="text-xs text-[var(--ss-text-muted)]">Updated {selected && formatDateTime(selected.updatedAt)}</p>
              </div>
            </div>
          )}

          {/* Customer Info - Edit/Create mode */}
          {modalMode !== 'view' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[var(--ss-text)]">Customer Name *</label>
                <Input
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Customer name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ss-text)]">Customer Email *</label>
                <Input
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  placeholder="customer@example.com"
                  type="email"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-[var(--ss-text)]">Subject *</label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Issue subject"
              disabled={modalMode === 'view'}
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--ss-text)]">Description *</label>
            <TextArea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Issue details"
              disabled={modalMode === 'view'}
              className="mt-1"
            />
          </div>

          {/* Priority & Status */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--ss-text)]">Priority</label>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' },
                ]}
                disabled={modalMode === 'view'}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ss-text)]">Status</label>
              <Select
                value={formData.status}
                onChange={(e) => {
                  setFormData({ ...formData, status: e.target.value as any })
                  if (modalMode === 'view') updateStatus(e.target.value)
                }}
                options={[
                  { value: 'open', label: 'Open' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'resolved', label: 'Resolved' },
                  { value: 'closed', label: 'Closed' },
                ]}
                disabled={modalMode === 'create'}
                className="mt-1"
              />
            </div>
          </div>

          {/* Internal Notes */}
          {modalMode !== 'create' && (
            <TextArea
              label="Internal note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add an internal note for this ticket..."
              showCount
              maxCount={400}
              disabled={modalMode === 'view'}
            />
          )}

          {/* Timeline placeholder */}
          {modalMode === 'view' && (
            <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-alt)] p-4 text-sm text-[var(--ss-text-muted)]">
              <p className="font-semibold text-[var(--ss-text)] mb-2">Ticket History</p>
              <p>• Created {selected && formatDateTime(selected.createdAt)}</p>
              <p>• Last updated {selected && formatDateTime(selected.updatedAt)}</p>
            </div>
          )}
        </Form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Ticket?"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={deleteTicket} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        }
      >
        <p className="text-[var(--ss-text-muted)]">
          {selected ? `Are you sure you want to delete ticket #${selected.id}? This action cannot be undone.` : 'Loading...'}
        </p>
      </Modal>
    </div>
  )
}

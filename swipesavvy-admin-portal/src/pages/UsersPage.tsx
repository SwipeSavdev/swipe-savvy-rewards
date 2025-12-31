import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Table, { type TableColumn } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Form from '@/components/ui/Form'
import { Api } from '@/services/api'
import type { CustomerUser } from '@/types/users'
import { formatDate } from '@/utils/dates'
import { useToastStore } from '@/store/toastStore'
import { isEmail } from '@/utils/validate'

export default function UsersPage() {
  const pushToast = useToastStore((s) => s.push)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<CustomerUser[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<string>('all')

  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteError, setInviteError] = useState<string | null>(null)

  const fetchUsers = async (shouldShowLoading = true) => {
    if (shouldShowLoading) setLoading(true)
    try {
      const res = await Api.usersApi.listUsers(
        1,
        100,
        status === 'all' ? undefined : status,
        query || undefined
      )
      // Map API response to component format
      const mappedUsers = (res.users || []).map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        status: u.status === 'active' ? 'active' : u.status === 'suspended' ? 'suspended' : 'invited',
        createdAt: u.created_at,
      }))
      setUsers(mappedUsers)
    } catch (error) {
      console.error('Failed to load users:', error)
      pushToast({ variant: 'error', title: 'Load failed', message: 'Failed to load users. Please try again.' })
    } finally {
      if (shouldShowLoading) setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (mounted) await fetchUsers(true)
    })()

    return () => {
      mounted = false
    }
  }, [query, status, pushToast])

  const columns: TableColumn<CustomerUser>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Name',
        sortable: true,
        accessor: (u) => u.name,
        cell: (u) => (
          <div className="min-w-0">
            <p className="truncate font-semibold">{u.name}</p>
            <p className="truncate text-xs text-[var(--ss-text-muted)]">{u.email}</p>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        accessor: (u) => u.status,
        cell: (u) => {
          const variant = u.status === 'active' ? 'success' : u.status === 'invited' ? 'warning' : 'danger'
          return <Badge variant={variant}>{u.status}</Badge>
        },
      },
      {
        key: 'createdAt',
        header: 'Created',
        sortable: true,
        accessor: (u) => u.createdAt,
        cell: (u) => <span className="text-[var(--ss-text-muted)]">{formatDate(u.createdAt)}</span>,
      },
    ],
    [],
  )

  const onInvite = async () => {
    setInviteError(null)
    if (!inviteName.trim()) return setInviteError('Name is required.')
    if (!isEmail(inviteEmail)) return setInviteError('Enter a valid email address.')

    try {
      // Call API to create user and send invitation
      await Api.usersApi.createUser({
        email: inviteEmail,
        name: inviteName,
        invite: true,
      })

      pushToast({ variant: 'success', title: 'Invite sent', message: `Invitation sent to ${inviteEmail}.` })
      setInviteOpen(false)
      setInviteEmail('')
      setInviteName('')
      
      // Refresh the users list from the server
      await fetchUsers(false)
    } catch (error) {
      console.error('Failed to send invitation:', error)
      pushToast({ variant: 'error', title: 'Invite failed', message: 'Failed to send invitation. Please try again.' })
      setInviteError('Failed to send invitation. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-xl font-semibold text-[var(--ss-text)]">Users</h1>
          <p className="mt-1 text-sm text-[var(--ss-text-muted)]">Manage customer accounts and lifecycle status.</p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>Invite user</Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:w-[420px]">
            <Input
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-[220px]">
            <Select
              label=""
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All statuses' },
                { value: 'active', label: 'Active' },
                { value: 'invited', label: 'Invited' },
                { value: 'suspended', label: 'Suspended' },
              ]}
            />
          </div>
        </div>

        <div className="mt-4">
          <Table data={users} columns={columns} loading={loading} pageSize={10} emptyMessage="No users match your filters." />
        </div>
      </Card>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite user"
        description="Send an invitation email with a secure sign-up link."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onInvite}>Send invite</Button>
          </div>
        }
      >
        <Form spacing="md" onSubmit={(e) => e.preventDefault()}>
          <Input label="Full name" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
          <Input label="Email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} error={inviteError ?? undefined} />
        </Form>
      </Modal>
    </div>
  )
}

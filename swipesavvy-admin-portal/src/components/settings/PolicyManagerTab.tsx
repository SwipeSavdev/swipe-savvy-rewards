import { useState } from 'react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import { useToastStore } from '@/store/toastStore'

interface Policy {
  id: string
  name: string
  description: string
  enabled: boolean
  category: string
  created_at: string
}

export default function PolicyManagerTab() {
  const pushToast = useToastStore((s) => s.push)
  const [policies, setPolicies] = useState<Policy[]>([
    {
      id: '1',
      name: 'Password Complexity',
      description: 'Enforce strong password requirements (min 12 chars, special chars, etc.)',
      enabled: true,
      category: 'Security',
      created_at: '2025-01-01',
    },
    {
      id: '2',
      name: 'Two-Factor Authentication',
      description: 'Require 2FA for all admin accounts',
      enabled: true,
      category: 'Security',
      created_at: '2025-01-05',
    },
    {
      id: '3',
      name: 'Session Timeout',
      description: 'Automatically log out inactive sessions after 30 minutes',
      enabled: true,
      category: 'Security',
      created_at: '2025-01-10',
    },
    {
      id: '4',
      name: 'IP Whitelisting',
      description: 'Restrict admin portal access to whitelisted IP addresses',
      enabled: false,
      category: 'Access Control',
      created_at: '2025-01-15',
    },
    {
      id: '5',
      name: 'Audit Logging',
      description: 'Log all administrative actions for compliance',
      enabled: true,
      category: 'Compliance',
      created_at: '2025-01-20',
    },
  ])
  const [newPolicy, setNewPolicy] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const addPolicy = () => {
    if (!newPolicy || !newDesc) {
      pushToast({
        variant: 'error',
        title: 'Validation Error',
        message: 'Please fill in all fields.',
      })
      return
    }

    const policy: Policy = {
      id: String(policies.length + 1),
      name: newPolicy,
      description: newDesc,
      enabled: true,
      category: 'Custom',
      created_at: new Date().toISOString().split('T')[0],
    }

    setPolicies([...policies, policy])
    setNewPolicy('')
    setNewDesc('')
    pushToast({
      variant: 'success',
      title: 'Policy Created',
      message: `${newPolicy} policy has been created successfully.`,
    })
  }

  const togglePolicy = (id: string) => {
    setPolicies(
      policies.map((p) =>
        p.id === id ? { ...p, enabled: !p.enabled } : p
      )
    )
  }

  const deletePolicy = (id: string) => {
    setPolicies(policies.filter((p) => p.id !== id))
    pushToast({
      variant: 'success',
      title: 'Policy Deleted',
      message: 'Policy has been removed from the system.',
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--ss-text)]">Create New Policy</h2>
          <p className="mt-1 text-sm text-[var(--ss-text-muted)]">Define organizational policies and compliance rules.</p>
        </div>

        <div className="space-y-4">
          <Input
            label="Policy Name"
            placeholder="e.g., Data Retention Policy"
            value={newPolicy}
            onChange={(e) => setNewPolicy(e.target.value)}
          />
          <Input
            label="Description"
            placeholder="Describe the policy details and requirements..."
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
          <div className="flex justify-end pt-2">
            <Button onClick={addPolicy}>Create Policy</Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--ss-text)]">Active Policies</h2>
          <p className="mt-1 text-sm text-[var(--ss-text-muted)]">Enable, disable, or manage organization policies.</p>
        </div>

        <div className="space-y-3">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="flex items-start justify-between rounded-lg border border-[var(--ss-border)] p-4 hover:bg-[var(--ss-surface-alt)]"
            >
              <div className="flex flex-1 items-start gap-4">
                <Checkbox
                  checked={policy.enabled}
                  onChange={() => togglePolicy(policy.id)}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--ss-text)]">{policy.name}</h3>
                  <p className="mt-1 text-sm text-[var(--ss-text-muted)]">{policy.description}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="inline-block rounded-full bg-[var(--ss-primary-soft)] px-2 py-1 text-xs text-[var(--ss-primary)]">
                      {policy.category}
                    </span>
                    <span className="text-xs text-[var(--ss-text-muted)]">Created: {policy.created_at}</span>
                  </div>
                </div>
              </div>
              <div className="ml-4 flex gap-2">
                <button
                  onClick={() => deletePolicy(policy.id)}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[var(--ss-text)]">Policy Summary</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-[var(--ss-surface-alt)] p-4">
            <p className="text-sm text-[var(--ss-text-muted)]">Total Policies</p>
            <p className="mt-1 text-2xl font-bold text-[var(--ss-text)]">{policies.length}</p>
          </div>
          <div className="rounded-lg bg-[var(--ss-surface-alt)] p-4">
            <p className="text-sm text-[var(--ss-text-muted)]">Enabled</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {policies.filter((p) => p.enabled).length}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

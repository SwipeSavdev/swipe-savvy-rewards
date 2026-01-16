import { useEffect, useState } from 'react'
import { Plus, Building2, RefreshCw, Trash2 } from 'lucide-react'
import { banksApi } from '../services/api'
import { Card, Button, Modal, Input, Badge, Skeleton } from '../components/ui'
import { cn } from '../utils/cn'
import type { LinkedBank } from '../types/api'

export function LinkedBanksPage() {
  const [banks, setBanks] = useState<LinkedBank[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [selectedBank, setSelectedBank] = useState<LinkedBank | null>(null)

  useEffect(() => {
    loadBanks()
  }, [])

  const loadBanks = async () => {
    setIsLoading(true)
    try {
      const data = await banksApi.getLinkedBanks()
      setBanks(data)
    } catch (err) {
      console.error('Failed to load banks:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async (bankId: string) => {
    try {
      const updated = await banksApi.refreshBank(bankId)
      setBanks(banks.map((b) => (b.id === bankId ? updated : b)))
    } catch (err) {
      console.error('Failed to refresh:', err)
    }
  }

  const handleRemove = async (bankId: string) => {
    if (!confirm('Are you sure you want to remove this bank account?')) return

    try {
      await banksApi.removeBank(bankId)
      setBanks(banks.filter((b) => b.id !== bankId))
    } catch (err) {
      console.error('Failed to remove:', err)
    }
  }

  const handleConnectBank = async () => {
    try {
      const { linkToken } = await banksApi.getPlaidLinkToken()
      // In production, this would open Plaid Link
      console.log('Plaid Link Token:', linkToken)
      alert('Plaid Link integration would open here. For demo, add a bank manually.')
      setShowAddModal(true)
    } catch (err) {
      console.error('Failed to get link token:', err)
      setShowAddModal(true)
    }
  }

  const getStatusBadge = (status: LinkedBank['status']) => {
    switch (status) {
      case 'connected':
        return <Badge variant="success">Connected</Badge>
      case 'needs_relink':
        return <Badge variant="warning">Needs Relink</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Linked Banks</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            Manage your connected bank accounts
          </p>
        </div>
        <Button onClick={handleConnectBank}>
          <Plus className="w-4 h-4 mr-2" />
          Link Bank Account
        </Button>
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-info-50 dark:bg-info-900/20 border-info-200 dark:border-info-800">
        <div className="flex gap-3">
          <Building2 className="w-5 h-5 text-info-600 dark:text-info-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-info-800 dark:text-info-200">Bank-Level Security</h3>
            <p className="text-sm text-info-700 dark:text-info-300 mt-1">
              We use Plaid to securely connect your bank accounts. Your credentials are never stored on our servers.
            </p>
          </div>
        </div>
      </Card>

      {/* Banks List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="p-5">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            </Card>
          ))}
        </div>
      ) : banks.length === 0 ? (
        <Card className="p-8 text-center">
          <Building2 className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-2">
            No bank accounts linked
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-4 max-w-sm mx-auto">
            Link your bank account to add money, withdraw funds, and make transfers.
          </p>
          <Button onClick={handleConnectBank}>
            <Plus className="w-4 h-4 mr-2" />
            Link Your First Bank
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {banks.map((bank) => (
            <Card key={bank.id} className="p-5 group">
              <div className="flex items-start gap-4">
                {/* Bank Icon */}
                <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-neutral-500" />
                </div>

                {/* Bank Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">
                      {bank.bankName}
                    </h3>
                  </div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    •••• {bank.accountNumber}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(bank.status)}
                    {bank.lastVerified && (
                      <span className="text-xs text-neutral-400">
                        Last verified: {new Date(bank.lastVerified).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {bank.status === 'needs_relink' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRefresh(bank.id)}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Reconnect
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRefresh(bank.id)}
                    title="Refresh"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(bank.id)}
                    className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Bank Modal (Manual) */}
      <AddBankModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={async (data) => {
          const newBank = await banksApi.addBankManually(data)
          setBanks([...banks, newBank])
          setShowAddModal(false)
        }}
      />

      {/* Verify Modal */}
      <VerifyBankModal
        isOpen={showVerifyModal}
        onClose={() => {
          setShowVerifyModal(false)
          setSelectedBank(null)
        }}
        bank={selectedBank}
        onVerify={async (amounts) => {
          if (!selectedBank) return
          const updated = await banksApi.verifyMicroDeposits(selectedBank.id, amounts)
          setBanks(banks.map((b) => (b.id === selectedBank.id ? updated : b)))
          setShowVerifyModal(false)
          setSelectedBank(null)
        }}
      />
    </div>
  )
}

interface AddBankModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    routingNumber: string
    accountNumber: string
    accountType: 'checking' | 'savings'
    accountHolderName: string
  }) => Promise<void>
}

function AddBankModal({ isOpen, onClose, onSubmit }: AddBankModalProps) {
  const [routingNumber, setRoutingNumber] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountType, setAccountType] = useState<'checking' | 'savings'>('checking')
  const [accountHolderName, setAccountHolderName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!routingNumber || !accountNumber || !accountHolderName) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        routingNumber,
        accountNumber,
        accountType,
        accountHolderName,
      })
      setRoutingNumber('')
      setAccountNumber('')
      setAccountHolderName('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose} title="Add Bank Account Manually">
      <div className="space-y-4">
        <div className="p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg text-sm text-warning-700 dark:text-warning-300">
          Manual bank linking requires micro-deposit verification, which takes 1-3 business days.
        </div>

        <Input
          label="Account Holder Name"
          value={accountHolderName}
          onChange={(e) => setAccountHolderName(e.target.value)}
          placeholder="John Doe"
        />

        <Input
          label="Routing Number"
          value={routingNumber}
          onChange={(e) => setRoutingNumber(e.target.value)}
          placeholder="123456789"
          maxLength={9}
        />

        <Input
          label="Account Number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="••••••••1234"
        />

        <div>
          <span className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Account Type
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAccountType('checking')}
              className={cn(
                'flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors',
                accountType === 'checking'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
              )}
            >
              Checking
            </button>
            <button
              type="button"
              onClick={() => setAccountType('savings')}
              className={cn(
                'flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors',
                accountType === 'savings'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
              )}
            >
              Savings
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={isSubmitting || !routingNumber || !accountNumber || !accountHolderName}
          >
            Add Bank
          </Button>
        </div>
      </div>
    </Modal>
  )
}

interface VerifyBankModalProps {
  isOpen: boolean
  onClose: () => void
  bank: LinkedBank | null
  onVerify: (amounts: [number, number]) => Promise<void>
}

function VerifyBankModal({ isOpen, onClose, bank, onVerify }: VerifyBankModalProps) {
  const [amount1, setAmount1] = useState('')
  const [amount2, setAmount2] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    const a1 = Number.parseFloat(amount1)
    const a2 = Number.parseFloat(amount2)
    if (Number.isNaN(a1) || Number.isNaN(a2)) return

    setIsSubmitting(true)
    try {
      await onVerify([a1, a2])
      setAmount1('')
      setAmount2('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose} title="Verify Bank Account">
      <div className="space-y-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          We sent two small deposits to your {bank?.bankName} account ending in {bank?.accountNumber}.
          Enter the amounts below to verify your account.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Deposit"
            type="number"
            value={amount1}
            onChange={(e) => setAmount1(e.target.value)}
            prefix="$"
            placeholder="0.00"
            step="0.01"
          />
          <Input
            label="Second Deposit"
            type="number"
            value={amount2}
            onChange={(e) => setAmount2(e.target.value)}
            prefix="$"
            placeholder="0.00"
            step="0.01"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={isSubmitting || !amount1 || !amount2}
          >
            Verify
          </Button>
        </div>
      </div>
    </Modal>
  )
}

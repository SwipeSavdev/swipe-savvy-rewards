import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Check, User, Building2, Plus } from 'lucide-react'
import { useWalletStore } from '../store'
import { transfersApi } from '../services/api'
import { Card, Button, Input } from '../components/ui'
import { formatCurrency } from '../utils/format'
import { cn } from '../utils/cn'
import type { Recipient } from '../types/api'

type TransferStep = 'type' | 'recipient' | 'amount' | 'confirm' | 'success'
type TransferType = 'add' | 'withdraw' | 'transfer'

export function TransferPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { balance, fetchAccounts, fetchBalance, fetchPaymentMethods } = useWalletStore()

  const [step, setStep] = useState<TransferStep>('type')
  const [transferType, setTransferType] = useState<TransferType>(
    (searchParams.get('action') as TransferType) || 'transfer'
  )
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAccounts()
    fetchBalance()
    fetchPaymentMethods()
    loadRecipients()
  }, [fetchAccounts, fetchBalance, fetchPaymentMethods])

  const loadRecipients = async () => {
    try {
      const data = await transfersApi.getRecipients()
      setRecipients(data)
    } catch (err) {
      console.error('Failed to load recipients:', err)
    }
  }

  const handleNext = () => {
    setError('')
    if (step === 'type') {
      if (transferType === 'transfer') {
        setStep('recipient')
      } else {
        setStep('amount')
      }
    } else if (step === 'recipient') {
      setStep('amount')
    } else if (step === 'amount') {
      if (!amount || parseFloat(amount) <= 0) {
        setError('Please enter a valid amount')
        return
      }
      setStep('confirm')
    }
  }

  const handleBack = () => {
    setError('')
    if (step === 'amount') {
      if (transferType === 'transfer') {
        setStep('recipient')
      } else {
        setStep('type')
      }
    } else if (step === 'recipient') {
      setStep('type')
    } else if (step === 'confirm') {
      setStep('amount')
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      await transfersApi.createTransfer({
        type: transferType === 'transfer' ? 'p2p' : 'external',
        amount: parseFloat(amount),
        fromAccountId: 'default', // Use default wallet account
        recipientId: selectedRecipient?.id,
        memo: memo || undefined,
      })
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 'type':
        return 'What would you like to do?'
      case 'recipient':
        return 'Who are you sending to?'
      case 'amount':
        return 'How much?'
      case 'confirm':
        return 'Confirm Transfer'
      case 'success':
        return 'Transfer Complete!'
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      {step !== 'success' && (
        <div className="flex items-center gap-2 mb-8">
          {['type', 'recipient', 'amount', 'confirm'].map((s, i) => {
            const stepIndex = ['type', 'recipient', 'amount', 'confirm'].indexOf(step)
            const isActive = i <= stepIndex
            const isTransferType = transferType === 'transfer'
            const showStep = s !== 'recipient' || isTransferType

            if (!showStep) return null

            return (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
                  )}
                >
                  {i + 1}
                </div>
                {i < 3 && showStep && (
                  <div
                    className={cn(
                      'w-12 h-0.5 mx-1',
                      isActive ? 'bg-primary-600' : 'bg-neutral-200 dark:bg-neutral-700'
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      <Card className="p-6">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-6">
          {getStepTitle()}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Step: Type */}
        {step === 'type' && (
          <div className="space-y-3">
            <TransferTypeButton
              icon={<Plus className="w-5 h-5" />}
              title="Add Money"
              description="Add funds from your bank or card"
              isSelected={transferType === 'add'}
              onClick={() => setTransferType('add')}
            />
            <TransferTypeButton
              icon={<ArrowRight className="w-5 h-5" />}
              title="Send Money"
              description="Transfer to another person"
              isSelected={transferType === 'transfer'}
              onClick={() => setTransferType('transfer')}
            />
            <TransferTypeButton
              icon={<Building2 className="w-5 h-5" />}
              title="Withdraw"
              description="Transfer to your bank account"
              isSelected={transferType === 'withdraw'}
              onClick={() => setTransferType('withdraw')}
            />
          </div>
        )}

        {/* Step: Recipient */}
        {step === 'recipient' && (
          <div className="space-y-4">
            {recipients.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500 mb-4">No saved recipients</p>
                <Button variant="secondary" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Recipient
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recipients.map((recipient) => (
                  <button
                    key={recipient.id}
                    onClick={() => setSelectedRecipient(recipient)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left',
                      selectedRecipient?.id === recipient.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                      <User className="w-5 h-5 text-neutral-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 dark:text-neutral-50">
                        {recipient.name}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {recipient.email || recipient.phone}
                      </p>
                    </div>
                    {selectedRecipient?.id === recipient.id && (
                      <Check className="w-5 h-5 text-primary-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step: Amount */}
        {step === 'amount' && (
          <div className="space-y-4">
            {balance && (
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-center">
                <p className="text-xs text-neutral-500 mb-1">Available Balance</p>
                <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                  {formatCurrency(balance.available)}
                </p>
              </div>
            )}

            <div className="text-center py-4">
              <div className="inline-flex items-baseline">
                <span className="text-2xl text-neutral-400 mr-1">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-5xl font-bold text-neutral-900 dark:text-neutral-50 bg-transparent text-center w-48 outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex justify-center gap-2">
              {[25, 50, 100, 250].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset.toString())}
                  className="px-4 py-2 text-sm font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                >
                  ${preset}
                </button>
              ))}
            </div>

            <Input
              label="Note (optional)"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="What's this for?"
            />
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-sm text-neutral-500 mb-1">Amount</p>
              <p className="text-4xl font-bold text-neutral-900 dark:text-neutral-50">
                {formatCurrency(parseFloat(amount))}
              </p>
            </div>

            <div className="space-y-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Type</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-50 capitalize">
                  {transferType === 'add' ? 'Add Money' : transferType === 'withdraw' ? 'Withdraw' : 'Transfer'}
                </span>
              </div>
              {selectedRecipient && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">To</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-50">
                    {selectedRecipient.name}
                  </span>
                </div>
              )}
              {memo && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Note</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-50">{memo}</span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 border-t border-neutral-200 dark:border-neutral-700">
                <span className="text-neutral-500">Fee</span>
                <span className="font-medium text-success-600">Free</span>
              </div>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-success-600" />
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
              {formatCurrency(parseFloat(amount))}
            </p>
            <p className="text-neutral-500">
              {transferType === 'add'
                ? 'Added to your account'
                : transferType === 'withdraw'
                ? 'Withdrawn to your bank'
                : `Sent to ${selectedRecipient?.name}`}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {step !== 'type' && step !== 'success' && (
            <Button variant="secondary" className="flex-1" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          {step === 'success' ? (
            <Button className="flex-1" onClick={() => navigate('/dashboard')}>
              Done
            </Button>
          ) : step === 'confirm' ? (
            <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Confirm Transfer'}
            </Button>
          ) : (
            <Button
              className="flex-1"
              onClick={handleNext}
              disabled={step === 'recipient' && !selectedRecipient}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

interface TransferTypeButtonProps {
  icon: React.ReactNode
  title: string
  description: string
  isSelected: boolean
  onClick: () => void
}

function TransferTypeButton({ icon, title, description, isSelected, onClick }: TransferTypeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-lg border transition-colors text-left',
        isSelected
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
      )}
    >
      <div
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center',
          isSelected
            ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600'
            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-500'
        )}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-neutral-900 dark:text-neutral-50">{title}</p>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
      {isSelected && <Check className="w-5 h-5 text-primary-600" />}
    </button>
  )
}

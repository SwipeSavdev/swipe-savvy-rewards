import { useEffect, useState, useCallback, type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  id: string
  title?: string
  message: string
  variant?: ToastVariant
  duration?: number
  onClose: (id: string) => void
}

const icons: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-success-500" />,
  error: <AlertCircle className="w-5 h-5 text-danger-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning-500" />,
  info: <Info className="w-5 h-5 text-primary-500" />,
}

const variants: Record<ToastVariant, string> = {
  success: 'border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-900/30',
  error: 'border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-900/30',
  warning: 'border-warning-200 dark:border-warning-800 bg-warning-50 dark:bg-warning-900/30',
  info: 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/30',
}

export function Toast({
  id,
  title,
  message,
  variant = 'info',
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const handleClose = useCallback(() => {
    setIsLeaving(true)
    setTimeout(() => onClose(id), 200)
  }, [id, onClose])

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true))

    // Auto dismiss
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, handleClose])

  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm rounded-lg border shadow-lg p-4',
        'transform transition-all duration-200 ease-out',
        variants[variant],
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0">{icons[variant]}</div>
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {title}
            </p>
          )}
          <p className="text-sm text-neutral-600 dark:text-neutral-300">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="shrink-0 p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Toast Container
export interface ToastContainerProps {
  children: ReactNode
}

export function ToastContainer({ children }: ToastContainerProps) {
  return (
    <div
      className="fixed bottom-4 right-4 z-toast flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {children}
    </div>
  )
}

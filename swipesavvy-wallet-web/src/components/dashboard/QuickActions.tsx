import { Plus, Send, ArrowDownToLine, QrCode } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

interface QuickAction {
  label: string
  icon: React.ReactNode
  href: string
  color: 'primary' | 'success' | 'warning' | 'info'
}

const actions: QuickAction[] = [
  {
    label: 'Add Money',
    icon: <Plus className="w-5 h-5" />,
    href: '/transfer?action=add',
    color: 'success',
  },
  {
    label: 'Transfer',
    icon: <Send className="w-5 h-5" />,
    href: '/transfer',
    color: 'primary',
  },
  {
    label: 'Withdraw',
    icon: <ArrowDownToLine className="w-5 h-5" />,
    href: '/transfer?action=withdraw',
    color: 'warning',
  },
  {
    label: 'Scan & Pay',
    icon: <QrCode className="w-5 h-5" />,
    href: '/pay',
    color: 'info',
  },
]

const colorClasses = {
  primary: {
    bg: 'bg-primary-50 dark:bg-primary-900/30',
    icon: 'text-primary-600 dark:text-primary-400',
    hover: 'hover:bg-primary-100 dark:hover:bg-primary-900/50',
  },
  success: {
    bg: 'bg-success-50 dark:bg-success-900/30',
    icon: 'text-success-600 dark:text-success-400',
    hover: 'hover:bg-success-100 dark:hover:bg-success-900/50',
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-900/30',
    icon: 'text-warning-600 dark:text-warning-400',
    hover: 'hover:bg-warning-100 dark:hover:bg-warning-900/50',
  },
  info: {
    bg: 'bg-info-50 dark:bg-info-900/30',
    icon: 'text-info-600 dark:text-info-400',
    hover: 'hover:bg-info-100 dark:hover:bg-info-900/50',
  },
}

interface QuickActionsProps {
  className?: string
}

export function QuickActions({ className }: QuickActionsProps) {
  return (
    <div className={cn('grid grid-cols-4 gap-3', className)}>
      {actions.map((action) => {
        const colors = colorClasses[action.color]
        return (
          <Link
            key={action.label}
            to={action.href}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200',
              colors.bg,
              colors.hover,
              'group'
            )}
          >
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center',
              'bg-white dark:bg-neutral-800 shadow-sm',
              'group-hover:scale-105 transition-transform'
            )}>
              <span className={colors.icon}>{action.icon}</span>
            </div>
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 text-center">
              {action.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

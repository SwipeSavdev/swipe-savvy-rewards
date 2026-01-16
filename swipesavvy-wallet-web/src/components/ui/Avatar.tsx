import { cn } from '../../utils/cn'
import { User } from 'lucide-react'

export interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  }

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  }

  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  // Generate consistent background color from name
  const getColorFromName = (name: string) => {
    const colors = [
      'bg-primary-500',
      'bg-success-500',
      'bg-warning-500',
      'bg-danger-500',
      'bg-violet-500',
      'bg-pink-500',
      'bg-cyan-500',
      'bg-amber-500',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={cn(
          'rounded-full object-cover',
          sizes[size],
          className
        )}
      />
    )
  }

  if (name) {
    return (
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-medium text-white',
          sizes[size],
          getColorFromName(name),
          className
        )}
        aria-label={name}
      >
        {getInitials(name)}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center bg-neutral-200 dark:bg-neutral-700',
        sizes[size],
        className
      )}
      aria-label="User"
    >
      <User className={cn('text-neutral-500 dark:text-neutral-400', iconSizes[size])} />
    </div>
  )
}

// Avatar Group
export interface AvatarGroupProps {
  avatars: { src?: string; name?: string }[]
  max?: number
  size?: 'xs' | 'sm' | 'md'
}

export function AvatarGroup({ avatars, max = 4, size = 'sm' }: AvatarGroupProps) {
  const visible = avatars.slice(0, max)
  const remaining = avatars.length - max

  const overlapSizes = {
    xs: '-ml-1.5',
    sm: '-ml-2',
    md: '-ml-2.5',
  }

  return (
    <div className="flex items-center">
      {visible.map((avatar, index) => (
        <div
          key={index}
          className={cn(
            'ring-2 ring-white dark:ring-neutral-800 rounded-full',
            index > 0 && overlapSizes[size]
          )}
        >
          <Avatar src={avatar.src} name={avatar.name} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-300 ring-2 ring-white dark:ring-neutral-800',
            overlapSizes[size],
            size === 'xs' && 'w-6 h-6',
            size === 'sm' && 'w-8 h-8',
            size === 'md' && 'w-10 h-10'
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}

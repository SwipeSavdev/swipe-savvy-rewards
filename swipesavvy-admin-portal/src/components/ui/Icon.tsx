import { cn } from '@/utils/cn'
import { ICONS, type IconName } from './icons'

export interface IconProps {
  name: IconName
  className?: string
  title?: string
}

export default function Icon({ name, className, title }: IconProps) {
  const svg = ICONS[name]
  if (!svg) return null

  return (
    <span
      className={cn('ss-icon inline-flex items-center justify-center', className)}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      // We control the SVGs and they are local assets.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

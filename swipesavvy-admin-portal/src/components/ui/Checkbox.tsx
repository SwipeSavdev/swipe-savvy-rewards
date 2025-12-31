import type { InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export default function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  const checkboxId = id ?? props.name
  return (
    <label className={cn('inline-flex items-center gap-2 text-sm text-[var(--ss-text)]', className)} htmlFor={checkboxId}>
      <input
        id={checkboxId}
        type="checkbox"
        className="h-4 w-4 rounded border-[var(--ss-border)] text-[var(--ss-primary)] focus:ring-0 focus:shadow-md"
        {...props}
      />
      {label ? <span>{label}</span> : null}
    </label>
  )
}

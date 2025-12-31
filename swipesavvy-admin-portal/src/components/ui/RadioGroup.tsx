import { cn } from '@/utils/cn'

export interface RadioOption {
  value: string
  label: string
  description?: string
}

export interface RadioGroupProps {
  name: string
  value: string
  onChange: (value: string) => void
  options: RadioOption[]
  className?: string
}

export default function RadioGroup({ name, value, onChange, options, className }: RadioGroupProps) {
  return (
    <div className={cn('space-y-2', className)} role="radiogroup" aria-label={name}>
      {options.map((opt) => {
        const optId = `${name}_${opt.value}`
        const checked = value === opt.value
        return (
          <label
            key={opt.value}
            htmlFor={optId}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-md border bg-[var(--ss-surface)] p-3 text-sm shadow-sm transition-colors',
              checked ? 'border-[rgba(35,83,147,0.35)]' : 'border-[var(--ss-border)]',
              'hover:bg-[var(--ss-surface-alt)]',
            )}
          >
            <input
              id={optId}
              type="radio"
              name={name}
              checked={checked}
              onChange={() => onChange(opt.value)}
              className="mt-0.5 h-4 w-4 text-[var(--ss-primary)]"
            />
            <div>
              <p className="font-medium text-[var(--ss-text)]">{opt.label}</p>
              {opt.description ? <p className="mt-0.5 text-xs text-[var(--ss-text-muted)]">{opt.description}</p> : null}
            </div>
          </label>
        )
      })}
    </div>
  )
}

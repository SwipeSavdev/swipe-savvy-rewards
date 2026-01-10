
interface SliderProps {
  min?: number
  max?: number
  step?: number
  value: number
  onChange: (_value: number) => void
  disabled?: boolean
  className?: string
}

export default function Slider({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  disabled = false,
  className = '',
}: SliderProps) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
      className={`w-full h-2 bg-[var(--color-border-primary)] rounded-lg appearance-none cursor-pointer accent-[var(--color-action-primary-bg)] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        background: `linear-gradient(to right, var(--color-action-primary-bg) 0%, var(--color-action-primary-bg) ${((value - min) / (max - min)) * 100}%, var(--color-border-primary) ${((value - min) / (max - min)) * 100}%, var(--color-border-primary) 100%)`,
      }}
    />
  )
}

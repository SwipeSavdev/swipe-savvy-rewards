import React from 'react'

interface SliderProps {
  min?: number
  max?: number
  step?: number
  value: number
  onChange: (value: number) => void
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
      className={`w-full h-2 bg-[var(--ss-border)] rounded-lg appearance-none cursor-pointer accent-[var(--ss-primary)] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        background: `linear-gradient(to right, var(--ss-primary) 0%, var(--ss-primary) ${((value - min) / (max - min)) * 100}%, var(--ss-border) ${((value - min) / (max - min)) * 100}%, var(--ss-border) 100%)`,
      }}
    />
  )
}

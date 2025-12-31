interface BarChartProps {
  data: Array<{
    label: string
    value: number
  }>
  height?: number
  color?: string
}

export default function BarChart({ data, height = 250, color = '#10b981' }: BarChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
  }

  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" height={height} className="w-full">
        {/* Grid lines */}
        <line x1="0" y1="25" x2="100" y2="25" stroke="#e5e7eb" strokeWidth="0.5" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.5" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#e5e7eb" strokeWidth="0.5" />

        {/* Bars */}
        {data.map((d, i) => {
          const barWidth = 100 / (data.length * 1.2)
          const spacing = (100 / data.length) * 0.1
          const x = (100 / data.length) * i + spacing
          const height = (d.value / maxValue) * 100
          const y = 100 - height

          return (
            <g key={i}>
              <rect x={x} y={y} width={barWidth} height={height} fill={color} opacity="0.8" rx="1" />
              <rect x={x} y={y} width={barWidth} height={height} fill="none" stroke={color} strokeWidth="0.5" rx="1" />
            </g>
          )
        })}
      </svg>

      {/* Labels */}
      <div className="mt-4 flex justify-between text-xs text-gray-600 flex-wrap gap-1">
        {data.map((d, i) => (
          <span key={i} className="text-center flex-1 truncate">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

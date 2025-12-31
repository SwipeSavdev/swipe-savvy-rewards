interface LineChartProps {
  data: Array<{
    label: string
    value: number
  }>
  height?: number
  color?: string
}

export default function LineChart({ data, height = 250, color = '#3b82f6' }: LineChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
  }

  const maxValue = Math.max(...data.map((d) => d.value))
  const minValue = Math.min(...data.map((d) => d.value))
  const range = maxValue - minValue || 1

  // Calculate points for SVG path
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * 100
    const y = 100 - ((d.value - minValue) / range) * 100
    return `${x},${y}`
  })

  const pathData = `M ${points.join(' L ')}`

  return (
    <div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" height={height} className="w-full">
        {/* Grid lines */}
        <line x1="0" y1="25" x2="100" y2="25" stroke="#e5e7eb" strokeWidth="0.5" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.5" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#e5e7eb" strokeWidth="0.5" />

        {/* Path */}
        <path d={pathData} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />

        {/* Fill area */}
        <path d={`${pathData} L 100,100 L 0,100 Z`} fill={color} opacity="0.1" />

        {/* Points */}
        {points.map((point, i) => (
          <circle key={i} cx={point.split(',')[0]} cy={point.split(',')[1]} r="1.5" fill={color} />
        ))}
      </svg>

      {/* Labels */}
      <div className="mt-4 flex justify-between text-xs text-gray-600">
        {data.length > 3 && (
          <>
            <span>{data[0].label}</span>
            <span>{data[Math.floor(data.length / 2)].label}</span>
            <span>{data[data.length - 1].label}</span>
          </>
        )}
      </div>
    </div>
  )
}

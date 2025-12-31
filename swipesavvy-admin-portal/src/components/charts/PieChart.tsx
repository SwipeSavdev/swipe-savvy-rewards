interface PieChartProps {
  data: Array<{
    label: string
    value: number
    color?: string
  }>
  height?: number
}

const defaultColors = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function PieChart({ data, height = 250 }: PieChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
  }

  const total = data.reduce((sum, d) => sum + d.value, 0)
  const centerX = 50
  const centerY = 50
  const radius = 40

  let currentAngle = -90

  const slices = data.map((d, i) => {
    const sliceAngle = (d.value / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + sliceAngle
    const color = d.color || defaultColors[i % defaultColors.length]

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = centerX + radius * Math.cos(startRad)
    const y1 = centerY + radius * Math.sin(startRad)
    const x2 = centerX + radius * Math.cos(endRad)
    const y2 = centerY + radius * Math.sin(endRad)

    const largeArc = sliceAngle > 180 ? 1 : 0

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ')

    currentAngle = endAngle

    return { pathData, color, label: d.label, value: d.value, percentage: ((d.value / total) * 100).toFixed(1) }
  })

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <svg viewBox="0 0 100 100" height={height} className="w-full">
          {slices.map((slice, i) => (
            <path key={i} d={slice.pathData} fill={slice.color} stroke="white" strokeWidth="1" opacity="0.85" />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-col justify-center gap-2 text-xs">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }}></div>
            <span className="text-gray-700">
              {slice.label}: {slice.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

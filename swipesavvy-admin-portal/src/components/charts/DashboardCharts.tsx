import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import Card from '@/components/ui/Card'

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

interface ChartProps {
  data: any[]
  title: string
  dataKey?: string
}

export function LineChartWidget({ data, title, dataKey = 'value' }: ChartProps) {
  return (
    <Card className="p-4">
      <h3 className="mb-4 font-headline text-sm font-semibold text-[var(--ss-text)]">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--ss-border)" />
          <XAxis stroke="var(--ss-text-muted)" />
          <YAxis stroke="var(--ss-text-muted)" />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'var(--ss-surface)',
              border: '1px solid var(--ss-border)',
              borderRadius: '8px'
            }}
            labelStyle={{ color: 'var(--ss-text)' }}
          />
          <Legend />
          <Line type="monotone" dataKey={dataKey} stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}

export function BarChartWidget({ data, title, dataKey = 'value' }: ChartProps) {
  return (
    <Card className="p-4">
      <h3 className="mb-4 font-headline text-sm font-semibold text-[var(--ss-text)]">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--ss-border)" />
          <XAxis stroke="var(--ss-text-muted)" />
          <YAxis stroke="var(--ss-text-muted)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--ss-surface)',
              border: '1px solid var(--ss-border)',
              borderRadius: '8px'
            }}
            labelStyle={{ color: 'var(--ss-text)' }}
          />
          <Legend />
          <Bar dataKey={dataKey} fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

export function PieChartWidget({ data, title, dataKey = 'value' }: ChartProps) {
  return (
    <Card className="p-4">
      <h3 className="mb-4 font-headline text-sm font-semibold text-[var(--ss-text)]">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--ss-surface)',
              border: '1px solid var(--ss-border)',
              borderRadius: '8px'
            }}
            labelStyle={{ color: 'var(--ss-text)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}

export function AreaChartWidget({ data, title, dataKey = 'value' }: ChartProps) {
  return (
    <Card className="p-4">
      <h3 className="mb-4 font-headline text-sm font-semibold text-[var(--ss-text)]">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--ss-border)" />
          <XAxis stroke="var(--ss-text-muted)" />
          <YAxis stroke="var(--ss-text-muted)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--ss-surface)',
              border: '1px solid var(--ss-border)',
              borderRadius: '8px'
            }}
            labelStyle={{ color: 'var(--ss-text)' }}
          />
          <Legend />
          <Area type="monotone" dataKey={dataKey} stroke="#3b82f6" fill="url(#colorValue)" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}

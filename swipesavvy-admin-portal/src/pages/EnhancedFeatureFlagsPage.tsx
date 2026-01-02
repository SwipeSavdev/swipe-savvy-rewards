import Badge from '@/components/ui/Badge'
import { BrandingKitIcon } from '@/components/ui/BrandingKitIcon'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useState } from 'react'

interface FeatureFlag {
  id: string
  name: string
  description: string
  category: string
  enabled: boolean
  rolloutPercentage: number
  affectedUsers: number
  createdAt: string
  lastModified: string
}

const CATEGORIES = ['Mobile App', 'Wallet', 'Rewards', 'Analytics', 'Payments', 'Social', 'Notifications', 'Security']

const MOCK_FLAGS: FeatureFlag[] = [
  { id: '1', name: 'Biometric Login', description: 'Enable fingerprint and face ID login for mobile apps', category: 'Security', enabled: true, rolloutPercentage: 100, affectedUsers: 45230, createdAt: '2025-01-10', lastModified: '2025-12-20' },
  { id: '2', name: 'Digital Wallet v2', description: 'New wallet interface with improved UX', category: 'Wallet', enabled: true, rolloutPercentage: 75, affectedUsers: 33856, createdAt: '2025-02-15', lastModified: '2025-12-18' },
  { id: '3', name: 'Rewards Multiplier', description: 'Double rewards for selected transactions', category: 'Rewards', enabled: false, rolloutPercentage: 0, affectedUsers: 0, createdAt: '2025-03-01', lastModified: '2025-12-10' },
  { id: '4', name: 'Push Notifications', description: 'Real-time transaction notifications', category: 'Notifications', enabled: true, rolloutPercentage: 100, affectedUsers: 52100, createdAt: '2025-01-05', lastModified: '2025-12-21' },
]

export default function EnhancedFeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(MOCK_FLAGS)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredFlags = selectedCategory ? flags.filter((f) => f.category === selectedCategory) : flags

  const toggleFlag = (id: string) => {
    setFlags(flags.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)))
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="bg-gradient-to-r from-[#235393] to-[#1A3F7A] rounded-lg p-8 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#FAB915]/20 rounded-lg">
            <BrandingKitIcon name="filter" size="lg" className="text-[#FAB915]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Feature Flags</h1>
            <p className="text-white/70 mt-1">Manage feature flags and rollouts for mobile app and web platforms</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-blue-900/20 border-l-4 border-[#235393]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#235393] dark:text-[#7ACD56] uppercase">Total Flags</span>
              <BrandingKitIcon name="filter" size="md" className="text-[#235393]" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#235393] to-[#1A3F7A] bg-clip-text">{flags.length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-white to-green-50/30 dark:from-slate-900 dark:to-green-900/20 border-l-4 border-[#60BA46]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#60BA46] dark:text-[#7ACD56] uppercase">Enabled</span>
              <BrandingKitIcon name="check" size="md" className="text-[#60BA46]" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#60BA46] to-[#4A9A35] bg-clip-text">{flags.filter(f => f.enabled).length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-white to-yellow-50/30 dark:from-slate-900 dark:to-yellow-900/20 border-l-4 border-[#FAB915]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#FAB915] dark:text-[#FAB915] uppercase">Affected Users</span>
              <BrandingKitIcon name="users" size="md" className="text-[#FAB915]" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#FAB915] to-[#FF8C00] bg-clip-text">{flags.reduce((sum, f) => sum + f.affectedUsers, 0).toLocaleString()}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-900 dark:to-purple-900/20 border-l-4 border-purple-500">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase">Categories</span>
              <BrandingKitIcon name="menu" size="md" className="text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text">{CATEGORIES.length}</p>
          </div>
        </Card>
      </div>

      <Button className="gap-2">
        <BrandingKitIcon name="plus" size="sm" />
        Create Feature Flag
      </Button>

      <Card className="p-6 border-l-4 border-[#60BA46]">
        <h3 className="text-lg font-bold text-[#235393] dark:text-white mb-4">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant={selectedCategory === null ? 'primary' : 'outline'} onClick={() => setSelectedCategory(null)} className="text-sm">
            All ({flags.length})
          </Button>
          {CATEGORIES.map((cat) => {
            const count = flags.filter((f) => f.category === cat).length
            return count > 0 ? (
              <Button key={cat} variant={selectedCategory === cat ? 'primary' : 'outline'} onClick={() => setSelectedCategory(cat)} className="text-sm">
                {cat} ({count})
              </Button>
            ) : null
          })}
        </div>
      </Card>

      <div className="grid gap-4">
        {filteredFlags.map((flag) => (
          <Card key={flag.id} className="p-6 hover:shadow-lg hover:border-[#235393]/25 transition-all border-l-4 border-[#60BA46]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-[#235393] dark:text-white">{flag.name}</h3>
                  <Badge variant={flag.enabled ? 'success' : 'neutral'}>{flag.enabled ? 'Enabled' : 'Disabled'}</Badge>
                </div>
                <p className="text-[#4B4D4D] dark:text-[#A0A0A0] mb-4">{flag.description}</p>
                <div className="flex flex-wrap gap-6">
                  <div className="bg-gradient-to-r from-[#235393]/5 to-[#60BA46]/5 dark:from-slate-800 dark:to-slate-700 px-4 py-2 rounded">
                    <p className="text-[#4B4D4D] dark:text-[#A0A0A0] text-xs uppercase font-semibold">Category</p>
                    <p className="font-bold text-[#235393] dark:text-[#7ACD56]">{flag.category}</p>
                  </div>
                  <div className="bg-gradient-to-r from-[#235393]/5 to-[#60BA46]/5 dark:from-slate-800 dark:to-slate-700 px-4 py-2 rounded">
                    <p className="text-[#4B4D4D] dark:text-[#A0A0A0] text-xs uppercase font-semibold">Rollout</p>
                    <p className="font-bold text-[#235393] dark:text-[#7ACD56]">{flag.rolloutPercentage}%</p>
                  </div>
                  <div className="bg-gradient-to-r from-[#235393]/5 to-[#60BA46]/5 dark:from-slate-800 dark:to-slate-700 px-4 py-2 rounded">
                    <p className="text-[#4B4D4D] dark:text-[#A0A0A0] text-xs uppercase font-semibold">Affected Users</p>
                    <p className="font-bold text-[#235393] dark:text-[#7ACD56]">{flag.affectedUsers.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={flag.enabled} onChange={() => toggleFlag(flag.id)} className="w-5 h-5" />
                  <span className="text-sm font-semibold text-[#235393] dark:text-[#7ACD56]">{flag.enabled ? 'On' : 'Off'}</span>
                </label>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

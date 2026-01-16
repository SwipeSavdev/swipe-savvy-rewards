import { useEffect, useState } from 'react'
import { Star, Zap, Trophy, Heart, Clock, ChevronRight, Gift, Fuel, Coffee, ShoppingCart, ShoppingBag, Plane, Utensils, Car, Percent } from 'lucide-react'
import { useRewardsStore } from '../store'
import { Card, Button, Modal, Input, ProgressBar, Skeleton, Badge } from '../components/ui'
import { formatNumber, formatRelativeDate } from '../utils/format'
import { cn } from '../utils/cn'
import type { Boost, LeaderboardEntry, RewardTier } from '../types/api'

const tierColors: Record<RewardTier, { bg: string; text: string; badge: string }> = {
  bronze: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-500',
  },
  silver: {
    bg: 'bg-neutral-200 dark:bg-neutral-700',
    text: 'text-neutral-700 dark:text-neutral-300',
    badge: 'bg-neutral-400',
  },
  gold: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    badge: 'bg-yellow-500',
  },
}

const tierNames: Record<RewardTier, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
}

// Map icon names from backend to Lucide icons
const boostIconMap: Record<string, React.ReactNode> = {
  'gas-cylinder': <Fuel className="w-6 h-6" />,
  'fuel': <Fuel className="w-6 h-6" />,
  'coffee': <Coffee className="w-6 h-6" />,
  'shopping-cart': <ShoppingCart className="w-6 h-6" />,
  'shopping-bag': <ShoppingBag className="w-6 h-6" />,
  'plane': <Plane className="w-6 h-6" />,
  'utensils': <Utensils className="w-6 h-6" />,
  'car': <Car className="w-6 h-6" />,
  'percent': <Percent className="w-6 h-6" />,
  'gift': <Gift className="w-6 h-6" />,
  'star': <Star className="w-6 h-6" />,
  'zap': <Zap className="w-6 h-6" />,
}

function getBoostIcon(icon: string): React.ReactNode {
  // If it's already an emoji, return as-is
  if (/\p{Emoji}/u.test(icon) && icon.length <= 2) {
    return <span className="text-2xl">{icon}</span>
  }
  // Look up in icon map
  const iconKey = icon.toLowerCase().replace(/_/g, '-')
  return boostIconMap[iconKey] || <Zap className="w-6 h-6" />
}

export function RewardsPage() {
  const {
    points,
    boosts,
    leaderboard,
    history,
    charities,
    isLoading,
    fetchPoints,
    fetchBoosts,
    fetchLeaderboard,
    fetchHistory,
    fetchCharities,
    activateBoost,
    donatePoints,
  } = useRewardsStore()

  const [showDonateModal, setShowDonateModal] = useState(false)
  const [donateAmount, setDonateAmount] = useState('')
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null)
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'weekly' | 'monthly' | 'all_time'>('weekly')

  useEffect(() => {
    fetchPoints()
    fetchBoosts()
    fetchLeaderboard({ period: leaderboardPeriod, limit: 10 })
    fetchHistory({ limit: 5 })
    fetchCharities()
  }, [fetchPoints, fetchBoosts, fetchLeaderboard, fetchHistory, fetchCharities, leaderboardPeriod])

  const handleDonate = async () => {
    if (!donateAmount) return
    const amount = Number.parseInt(donateAmount, 10)
    if (Number.isNaN(amount) || amount <= 0) return

    try {
      await donatePoints(amount, selectedCharityId || undefined)
      setShowDonateModal(false)
      setDonateAmount('')
      setSelectedCharityId(null)
    } catch (error) {
      console.error('Failed to donate:', error)
    }
  }

  const handleActivateBoost = async (boostId: string) => {
    try {
      await activateBoost(boostId)
    } catch (error) {
      console.error('Failed to activate boost:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Rewards</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            Earn points, unlock boosts, and climb the leaderboard
          </p>
        </div>
        <Button onClick={() => setShowDonateModal(true)} variant="secondary">
          <Heart className="w-4 h-4 mr-2" />
          Donate Points
        </Button>
      </div>

      {/* Points & Tier Section */}
      {isLoading && !points ? (
        <Card className="p-6">
          <div className="flex items-center gap-6">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-4" />
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
        </Card>
      ) : points ? (
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Tier Badge */}
            <div className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center shrink-0',
              tierColors[points.tier].bg
            )}>
              <Star className={cn('w-10 h-10', tierColors[points.tier].text)} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                  {formatNumber(points.available)}
                </span>
                <Badge variant="default" className={tierColors[points.tier].badge}>
                  {tierNames[points.tier]}
                </Badge>
              </div>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4">
                Available points ({formatNumber(points.donated)} donated)
              </p>

              {/* Tier Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Progress to {points.tier === 'gold' ? 'max tier' : points.tier === 'silver' ? 'Gold' : 'Silver'}
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-50">
                    {points.tier === 'gold' ? 'Max' : `${points.tierProgress}%`}
                  </span>
                </div>
                <ProgressBar
                  value={points.tier === 'gold' ? 100 : points.tierProgress}
                  max={100}
                  color={points.tier === 'gold' ? 'success' : 'primary'}
                />
                {points.tier !== 'gold' && (
                  <p className="text-xs text-neutral-400">
                    {formatNumber(points.nextTierAt - points.available)} points until next tier
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Boosts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            Available Boosts
          </h2>
          <span className="text-sm text-neutral-500">
            {boosts.filter(b => b.active).length} active
          </span>
        </div>

        {isLoading && boosts.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="w-12 h-12 rounded-full mb-3" />
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-32 mb-3" />
                <Skeleton className="h-9 w-full" />
              </Card>
            ))}
          </div>
        ) : boosts.length === 0 ? (
          <Card className="p-8 text-center">
            <Zap className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-500">No boosts available right now</p>
            <p className="text-sm text-neutral-400 mt-1">Check back later for new offers</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boosts.map((boost) => (
              <BoostCard
                key={boost.id}
                boost={boost}
                onActivate={() => handleActivateBoost(boost.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Two Column Layout: Leaderboard & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
                Leaderboard
              </h2>
            </div>
            <select
              value={leaderboardPeriod}
              onChange={(e) => setLeaderboardPeriod(e.target.value as typeof leaderboardPeriod)}
              className="text-sm bg-transparent border-none text-primary-600 dark:text-primary-400 font-medium focus:outline-none cursor-pointer"
            >
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="all_time">All Time</option>
            </select>
          </div>

          {isLoading && leaderboard.length === 0 ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-8 text-center">
              <Trophy className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-500">No rankings yet</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
              {leaderboard.map((entry) => (
                <LeaderboardRow key={entry.userId} entry={entry} />
              ))}
            </div>
          )}
        </Card>

        {/* Recent History */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-neutral-400" />
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
                Recent Activity
              </h2>
            </div>
            <button className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1">
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {isLoading && history.length === 0 ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center">
              <Gift className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-500">No recent activity</p>
              <p className="text-sm text-neutral-400 mt-1">Start earning rewards!</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
              {history.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-3 p-4"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    transaction.amount > 0
                      ? 'bg-success-50 dark:bg-success-900/30'
                      : 'bg-neutral-100 dark:bg-neutral-700'
                  )}>
                    <Star className={cn(
                      'w-5 h-5',
                      transaction.amount > 0
                        ? 'text-success-600'
                        : 'text-neutral-500'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 dark:text-neutral-50 text-sm truncate">
                      {transaction.title}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {formatRelativeDate(transaction.timestamp)}
                    </p>
                  </div>
                  <span className={cn(
                    'font-semibold text-sm',
                    transaction.amount > 0
                      ? 'text-success-600 dark:text-success-400'
                      : 'text-neutral-600 dark:text-neutral-400'
                  )}>
                    {transaction.amount > 0 ? '+' : ''}{formatNumber(transaction.amount)} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Donate Modal */}
      <Modal
        open={showDonateModal}
        onClose={() => {
          setShowDonateModal(false)
          setDonateAmount('')
          setSelectedCharityId(null)
        }}
        title="Donate Points"
      >
        <div className="space-y-4">
          {points && (
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-center">
              <p className="text-xs text-neutral-500 mb-1">Available Points</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {formatNumber(points.available)}
              </p>
            </div>
          )}

          <Input
            label="Points to Donate"
            type="number"
            value={donateAmount}
            onChange={(e) => setDonateAmount(e.target.value)}
            placeholder="Enter amount"
          />

          {charities.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Select Charity (Optional)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {charities.map((charity) => (
                  <button
                    key={charity.id}
                    onClick={() => setSelectedCharityId(
                      selectedCharityId === charity.id ? null : charity.id
                    )}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left',
                      selectedCharityId === charity.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-danger-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 dark:text-neutral-50 text-sm">
                        {charity.name}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {charity.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowDonateModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleDonate}
              disabled={!donateAmount || Number.parseInt(donateAmount, 10) <= 0}
            >
              <Heart className="w-4 h-4 mr-2" />
              Donate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// Boost Card Component
interface BoostCardProps {
  boost: Boost
  onActivate: () => void
}

function BoostCard({ boost, onActivate }: BoostCardProps) {
  const isExpiringSoon = boost.expiresAt && new Date(boost.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000

  return (
    <Card className={cn(
      'p-4 transition-all',
      boost.active && 'ring-2 ring-primary-500 bg-primary-50/50 dark:bg-primary-900/10'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
          {getBoostIcon(boost.icon)}
        </div>
        {boost.active && (
          <Badge variant="success" size="sm">Active</Badge>
        )}
      </div>

      <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
        {boost.title}
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
        {boost.subtitle}
      </p>
      <p className="text-lg font-bold text-primary-600 dark:text-primary-400 mb-3">
        {boost.percent}
      </p>

      {boost.expiresAt && (
        <p className={cn(
          'text-xs mb-3',
          isExpiringSoon ? 'text-warning-600' : 'text-neutral-400'
        )}>
          {isExpiringSoon ? 'Expires soon!' : `Expires ${formatRelativeDate(boost.expiresAt)}`}
        </p>
      )}

      <Button
        variant={boost.active ? 'secondary' : 'primary'}
        size="sm"
        className="w-full"
        onClick={onActivate}
        disabled={boost.active}
      >
        {boost.active ? (
          <>
            <Zap className="w-4 h-4 mr-2" />
            Activated
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 mr-2" />
            Activate Boost
          </>
        )}
      </Button>
    </Card>
  )
}

// Leaderboard Row Component
interface LeaderboardRowProps {
  entry: LeaderboardEntry
}

function LeaderboardRow({ entry }: LeaderboardRowProps) {
  const rankColors: Record<number, string> = {
    1: 'text-yellow-500',
    2: 'text-neutral-400',
    3: 'text-amber-600',
  }

  return (
    <div className={cn(
      'flex items-center gap-3 p-4',
      entry.isCurrentUser && 'bg-primary-50 dark:bg-primary-900/10'
    )}>
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
        entry.rank <= 3
          ? cn('bg-neutral-100 dark:bg-neutral-700', rankColors[entry.rank])
          : 'text-neutral-500'
      )}>
        {entry.rank <= 3 ? (
          <Trophy className="w-4 h-4" />
        ) : (
          entry.rank
        )}
      </div>

      <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center overflow-hidden">
        {entry.avatar ? (
          <img src={entry.avatar} alt={entry.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
            {entry.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium text-sm truncate',
          entry.isCurrentUser
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-neutral-900 dark:text-neutral-50'
        )}>
          {entry.name} {entry.isCurrentUser && '(You)'}
        </p>
        <p className="text-xs text-neutral-400 capitalize">{entry.tier}</p>
      </div>

      <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-50">
        {formatNumber(entry.points)}
      </span>
    </div>
  )
}

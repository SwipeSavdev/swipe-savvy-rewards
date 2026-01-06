import { useState, useEffect } from 'react'
import { 
  Sparkles, Plus, Edit2, Trash2, Send, BarChart3, Settings,
  MapPin, Bell, Target, Zap, TrendingUp, Users, Store, Gift
} from 'lucide-react'

export function AIMarketingPage() {
  // Campaign States
  const [campaigns, setCampaigns] = useState([
    {
      id: '1',
      name: 'Holiday Challenge Campaign',
      type: 'challenge',
      status: 'active',
      createdDate: '2025-12-20',
      sentCount: 5542,
      viewCount: 3200,
      conversionRate: 28.5,
      channels: ['push', 'email', 'in_app'],
      targetPattern: 'frequent_shopper',
      notificationStatus: { sent: 5542, delivered: 5420, failed: 122 },
      gamificationEnabled: true,
      merchantNetwork: 'preferred',
      proximityRadius: 5,
      performance: { trend: 'up', changePercent: 12.5 }
    },
    {
      id: '2',
      name: 'Investment Feature Launch',
      type: 'email',
      status: 'completed',
      createdDate: '2025-12-15',
      sentCount: 2145,
      viewCount: 1200,
      conversionRate: 15.8,
      channels: ['email', 'in_app'],
      targetPattern: 'high_spender',
      notificationStatus: { sent: 2145, delivered: 2089, failed: 56 },
      gamificationEnabled: false,
      merchantNetwork: 'all',
      proximityRadius: 0,
      performance: { trend: 'down', changePercent: -2.3 }
    }
  ])

  const [showForm, setShowForm] = useState(false)
  const [selectedTab, setSelectedTab] = useState('campaigns') // campaigns, segments, analytics, merchants
  const [formData, setFormData] = useState({
    name: '',
    type: 'email',
    targetAudience: 'All Users',
    targetPattern: 'frequent_shopper',
    content: '',
    channels: ['email'],
    merchantNetwork: 'preferred',
    proximityRadius: 0,
    gamificationEnabled: false,
    enableGeofencing: false,
    learningEnabled: true,
    duration_days: 30
  })

  const [aiSuggestions, setAiSuggestions] = useState({
    showSuggestions: false,
    loading: false,
  })

  const [merchantNetwork, setMerchantNetwork] = useState({
    preferred: ['Starbucks', 'Target', 'Best Buy', 'Whole Foods'],
    categories: ['Retail', 'Dining', 'Entertainment', 'Health & Wellness'],
    radius: 5 // miles
  })

  const [segments, setSegments] = useState([
    { pattern: 'high_spender', size: 1250, avgSpend: 8500, transactions: 34, percentage: 22 },
    { pattern: 'frequent_shopper', size: 3420, avgSpend: 2100, transactions: 48, percentage: 61 },
    { pattern: 'location_clustered', size: 890, avgSpend: 3200, transactions: 28, percentage: 16 },
    { pattern: 'inactive', size: 450, avgSpend: 1800, transactions: 8, percentage: 8 },
    { pattern: 'new_shopper', size: 320, avgSpend: 450, transactions: 3, percentage: 6 },
    { pattern: 'seasonal_spender', size: 680, avgSpend: 5600, transactions: 18, percentage: 12 }
  ])

  // Campaign Types Definition
  const CAMPAIGN_TYPES = {
    vip: { label: 'VIP/Cashback', icon: '👑', description: '5% cashback for high spenders' },
    loyalty: { label: 'Loyalty Rewards', icon: '⭐', description: 'Bonus points for frequent shoppers' },
    location: { label: 'Location-Based', icon: '📍', description: 'Discounts for location-clustered users' },
    reengagement: { label: 'Re-Engagement', icon: '🔄', description: '20% discount for inactive users' },
    welcome: { label: 'Welcome Bonus', icon: '🎁', description: '25% discount for new customers' },
    milestone: { label: 'Spending Milestone', icon: '🎯', description: 'Bonus at spending thresholds' },
    challenge: { label: 'Challenges', icon: '🎲', description: 'Earn rewards by completing tasks' }
  }

  // Notification Channels
  const NOTIFICATION_CHANNELS = [
    { id: 'email', label: 'Email', icon: '📧', status: 'configured' },
    { id: 'sms', label: 'SMS', icon: '💬', status: 'configured' },
    { id: 'push', label: 'Push', icon: '🔔', status: 'configured' },
    { id: 'in_app', label: 'In-App', icon: '📱', status: 'active' }
  ]

  const handleCreateCampaign = () => {
    if (!formData.name || !formData.content) {
      alert('Name and content are required')
      return
    }

    const newCampaign = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      targetAudience: formData.targetAudience,
      targetPattern: formData.targetPattern,
      content: formData.content,
      channels: formData.channels,
      merchantNetwork: formData.merchantNetwork,
      proximityRadius: formData.proximityRadius,
      gamificationEnabled: formData.gamificationEnabled,
      status: 'draft',
      createdDate: new Date().toISOString().split('T')[0],
      sentCount: 0,
      viewCount: 0,
      conversionRate: 0,
      notificationStatus: { sent: 0, delivered: 0, failed: 0 },
      performance: { trend: 'neutral', changePercent: 0 }
    }

    setCampaigns([newCampaign, ...campaigns])
    setFormData({ 
      name: '', type: 'email', targetAudience: 'All Users',
      targetPattern: 'frequent_shopper', content: '', channels: ['email'],
      merchantNetwork: 'preferred', proximityRadius: 0, gamificationEnabled: false,
      enableGeofencing: false, learningEnabled: true, duration_days: 30
    })
    setShowForm(false)
    alert('Campaign created successfully!')
  }

  const handleGenerateAISuggestion = async () => {
    setAiSuggestions({ ...aiSuggestions, loading: true })
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const suggestions = [
      '🎯 Target High Spenders with VIP benefits: Exclusive 5% cashback on purchases over $100. Limited time offer through December 31st.',
      '⭐ Loyalty Drive: Earn 2x points on all purchases this week! Double rewards for Frequent Shoppers in Retail & Dining categories.',
      '📍 Local Promotions: Users within 5 miles of partnered merchants get 15% off. Personalized by shopping location patterns.',
      '🔄 Re-engagement Campaign: We miss you! Come back for 20% off your next purchase. Valid for users inactive 30+ days.',
      '🎁 Welcome New Users: First-time customers get 25% off their initial purchase. Build loyalty with new shoppers.',
      '🎲 Interactive Challenges: Complete daily challenges to earn bonus points and unlock exclusive rewards. Gamification increases engagement by 45%.'
    ]

    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)]
    setFormData({ ...formData, content: randomSuggestion })
    setAiSuggestions({ showSuggestions: true, loading: false })
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      paused: 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
  }

  // Metrics
  const metrics = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((c) => c.status === 'active').length,
    totalSent: campaigns.reduce((sum, c) => sum + c.sentCount, 0),
    avgConversion: (campaigns.reduce((sum, c) => sum + c.conversionRate, 0) / campaigns.length).toFixed(1),
    totalSegments: segments.length,
    totalUsers: segments.reduce((sum, s) => sum + s.size, 0),
    activeChannels: NOTIFICATION_CHANNELS.filter(c => c.status === 'configured' || c.status === 'active').length,
    merchantCount: merchantNetwork.preferred.length
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Sparkles className="w-10 h-10 text-purple-600" />
              AI Marketing Engine
            </h1>
            <p className="text-gray-600 mt-2">Automated behavioral targeting with multi-channel notifications, merchant network integration, and gamification</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Campaign
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {['campaigns', 'segments', 'analytics', 'merchants'].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                selectedTab === tab
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Campaigns</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.activeCampaigns}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Sent</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalSent.toLocaleString()}</p>
              </div>
              <Send className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Conversion</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{metrics.avgConversion}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Notification Channels</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.activeChannels}/4</p>
              </div>
              <Bell className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Campaigns Tab */}
        {selectedTab === 'campaigns' && (
          <>
            {/* Create Campaign Form */}
            {showForm && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Create Marketing Campaign
                </h2>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Campaign Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Black Friday Flash Sale"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Campaign Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {Object.entries(CAMPAIGN_TYPES).map(([key, value]) => (
                          <option key={key} value={key}>{value.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Targeting */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Target Pattern</label>
                      <select
                        value={formData.targetPattern}
                        onChange={(e) => setFormData({ ...formData, targetPattern: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="high_spender">High Spenders (&gt;$5,000)</option>
                        <option value="frequent_shopper">Frequent Shoppers (&gt;20 transactions)</option>
                        <option value="location_clustered">Location-Clustered</option>
                        <option value="inactive">Inactive (30+ days)</option>
                        <option value="new_shopper">New Shoppers (&lt;5 transactions)</option>
                        <option value="seasonal_spender">Seasonal Spenders</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Merchant Network</label>
                      <select
                        value={formData.merchantNetwork}
                        onChange={(e) => setFormData({ ...formData, merchantNetwork: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="all">All Merchants</option>
                        <option value="preferred">Preferred Network Only</option>
                        <option value="category">By Category</option>
                      </select>
                    </div>
                  </div>

                  {/* Notification Channels */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">Notification Channels</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {NOTIFICATION_CHANNELS.map(channel => (
                        <label key={channel.id} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-purple-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.channels.includes(channel.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, channels: [...formData.channels, channel.id] })
                              } else {
                                setFormData({ ...formData, channels: formData.channels.filter(c => c !== channel.id) })
                              }
                            }}
                            className="w-4 h-4 text-purple-600"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">{channel.icon} {channel.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.gamificationEnabled}
                        onChange={(e) => setFormData({ ...formData, gamificationEnabled: e.target.checked })}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Enable Gamification</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.enableGeofencing}
                        onChange={(e) => setFormData({ ...formData, enableGeofencing: e.target.checked })}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Proximity Targeting</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.learningEnabled}
                        onChange={(e) => setFormData({ ...formData, learningEnabled: e.target.checked })}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Behavioral Learning</span>
                    </label>
                  </div>

                  {/* Content */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-900">Campaign Content</label>
                      <button
                        onClick={handleGenerateAISuggestion}
                        disabled={aiSuggestions.loading}
                        className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 font-medium"
                      >
                        <Sparkles className="w-4 h-4" />
                        {aiSuggestions.loading ? 'Generating...' : 'AI Suggest'}
                      </button>
                    </div>
                    <textarea
                      placeholder="Craft your campaign message, special offer, or promotional text..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={5}
                    />
                    {aiSuggestions.showSuggestions && (
                      <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI-Generated suggestion applied
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleCreateCampaign}
                      className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Create Campaign
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Campaigns List */}
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{CAMPAIGN_TYPES[campaign.type]?.icon || '📢'}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                          <p className="text-sm text-gray-600">
                            {CAMPAIGN_TYPES[campaign.type]?.label} • {campaign.targetPattern.replace('_', ' ').toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>

                  {/* Notification Channels */}
                  <div className="mb-4 flex gap-2">
                    {campaign.channels.map(ch => {
                      const channel = NOTIFICATION_CHANNELS.find(c => c.id === ch)
                      return (
                        <span key={ch} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                          {channel?.icon} {channel?.label}
                        </span>
                      )
                    })}
                  </div>

                  {/* Notification Status */}
                  {campaign.notificationStatus.sent > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Sent</p>
                        <p className="text-sm font-semibold text-blue-900">{campaign.notificationStatus.sent}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Delivered</p>
                        <p className="text-sm font-semibold text-green-900">{campaign.notificationStatus.delivered}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Failed</p>
                        <p className="text-sm font-semibold text-red-900">{campaign.notificationStatus.failed}</p>
                      </div>
                    </div>
                  )}

                  {/* Campaign Details */}
                  <p className="text-gray-700 mb-4 text-sm line-clamp-2">{campaign.content}</p>

                  {/* Metrics */}
                  <div className="grid grid-cols-4 gap-4 mb-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600">Views</p>
                      <p className="text-lg font-semibold text-gray-900">{campaign.viewCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Conversion</p>
                      <p className={`text-lg font-semibold ${getTrendColor(campaign.performance.trend)}`}>
                        {campaign.conversionRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Merchant Network</p>
                      <p className="text-lg font-semibold text-gray-900">{campaign.merchantNetwork === 'preferred' ? '🎯 Preferred' : '🌍 All'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Created</p>
                      <p className="text-sm text-gray-900">{campaign.createdDate}</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2 mb-4">
                    {campaign.gamificationEnabled && <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">🎲 Gamified</span>}
                    {campaign.proximityRadius > 0 && <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">📍 Proximity {campaign.proximityRadius}mi</span>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </button>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Segments Tab */}
        {selectedTab === 'segments' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-gray-600 text-sm">Total Users Segmented</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalUsers.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-gray-600 text-sm">Active Segments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalSegments}</p>
              </div>
            </div>

            {segments.map((segment) => (
              <div key={segment.pattern} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{segment.pattern.replace(/_/g, ' ').toUpperCase()}</h3>
                    <p className="text-sm text-gray-600 mt-1">{segment.percentage}% of user base</p>
                  </div>
                  <Users className="w-6 h-6 text-purple-600" />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600">Segment Size</p>
                    <p className="text-xl font-bold text-gray-900 mt-2">{segment.size.toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600">Avg Spend</p>
                    <p className="text-xl font-bold text-gray-900 mt-2">${segment.avgSpend}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600">Avg Transactions</p>
                    <p className="text-xl font-bold text-gray-900 mt-2">{segment.transactions}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600">Growth Potential</p>
                    <p className="text-xl font-bold text-gray-900 mt-2">High</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analytics Tab */}
        {selectedTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Campaign Performance
              </h3>
              <div className="space-y-4">
                {campaigns.slice(0, 3).map(c => (
                  <div key={c.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-sm text-gray-600">Conversion Rate: {c.conversionRate}%</p>
                    </div>
                    <div className={`text-2xl font-bold ${getTrendColor(c.performance.trend)}`}>
                      {c.performance.changePercent > 0 ? '↑' : '↓'} {Math.abs(c.performance.changePercent)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Notification Delivery Status
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {NOTIFICATION_CHANNELS.map(ch => (
                  <div key={ch.id} className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-2xl mb-2">{ch.icon}</p>
                    <p className="font-medium text-gray-900">{ch.label}</p>
                    <p className="text-xs text-gray-600 mt-2 bg-green-100 text-green-800 px-2 py-1 rounded mt-3">
                      {ch.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Merchants Tab */}
        {selectedTab === 'merchants' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Store className="w-5 h-5 text-purple-600" />
                Preferred Merchant Network
              </h3>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Active Merchants: {merchantNetwork.preferred.length}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {merchantNetwork.preferred.map((merchant, idx) => (
                    <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <Store className="w-5 h-5 text-purple-600 mb-2" />
                      <p className="font-medium text-gray-900 text-sm">{merchant}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 mb-3">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {merchantNetwork.categories.map((cat, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                Proximity Targeting Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Search Radius</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      defaultValue={merchantNetwork.radius}
                      className="flex-1"
                    />
                    <span className="text-lg font-semibold text-gray-900 w-16">{merchantNetwork.radius} miles</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Notify users when they're within this distance of preferred merchants</p>
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Real-time Location Required:</strong> Geofencing features require user location permission and are not yet fully integrated.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {selectedTab === 'campaigns' && campaigns.length === 0 && !showForm && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No campaigns yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Campaign
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
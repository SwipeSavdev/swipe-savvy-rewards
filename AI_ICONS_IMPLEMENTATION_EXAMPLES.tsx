// AI Icons - Implementation Examples
// Copy and adapt these examples for your components

import { Icon } from '@/components/ui/Icon'

// ============================================================================
// EXAMPLE 1: AI Support Concierge Header
// ============================================================================

export function AISupportConciergeBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-lg backdrop-blur">
            <Icon name="chatbot" className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Support Concierge</h1>
            <p className="text-white/80 text-sm">24/7 Intelligent Customer Support</p>
          </div>
        </div>
        <Icon name="smart_assistant" className="w-12 h-12 text-white/40" />
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 2: AI Feature Cards Grid
// ============================================================================

export function AIFeaturesGrid() {
  const features = [
    {
      icon: 'ai_brain',
      title: 'Intelligent Insights',
      description: 'AI-powered analytics and recommendations',
      color: 'text-blue-500'
    },
    {
      icon: 'neural_network',
      title: 'Deep Learning',
      description: 'Advanced machine learning models',
      color: 'text-purple-500'
    },
    {
      icon: 'predictive_analytics',
      title: 'Predictive Forecasting',
      description: 'Accurate future trend predictions',
      color: 'text-amber-500'
    },
    {
      icon: 'automated_workflow',
      title: 'Smart Automation',
      description: 'Intelligent process automation',
      color: 'text-green-500'
    },
    {
      icon: 'data_science_chart',
      title: 'Data Visualization',
      description: 'Beautiful analytics dashboards',
      color: 'text-cyan-500'
    },
    {
      icon: 'cloud_computing',
      title: 'Cloud Infrastructure',
      description: 'Scalable cloud-based solutions',
      color: 'text-sky-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {features.map((feature) => (
        <div
          key={feature.icon}
          className="p-6 border border-slate-200 rounded-lg hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer"
        >
          <Icon
            name={feature.icon as any}
            className={`w-10 h-10 mb-3 ${feature.color}`}
          />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            {feature.title}
          </h3>
          <p className="text-sm text-slate-600">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// EXAMPLE 3: ML Model Configuration Panel
// ============================================================================

export function MLModelConfig() {
  const models = [
    { icon: 'neural_network', name: 'Neural Network', status: 'active' },
    { icon: 'algorithm_diagram', name: 'Algorithm Suite', status: 'active' },
    { icon: 'machine_learning_gear', name: 'Model Tuning', status: 'idle' },
    { icon: 'robotics_automation', name: 'Process Automation', status: 'active' }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <Icon name="machine_learning_gear" className="w-6 h-6 text-slate-700" />
        <h2 className="text-xl font-bold text-slate-900">Model Configuration</h2>
      </div>

      <div className="space-y-2">
        {models.map((model) => (
          <div
            key={model.name}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Icon
                name={model.icon as any}
                className="w-5 h-5 text-slate-600"
              />
              <span className="font-medium text-slate-900">{model.name}</span>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded ${
                model.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {model.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 4: Analytics Dashboard Stats
// ============================================================================

export function AnalyticsDashboard() {
  const stats = [
    {
      icon: 'data_science_chart',
      label: 'Data Processing',
      value: '98.5%',
      subtext: 'Efficiency Rate',
      color: 'bg-blue-500'
    },
    {
      icon: 'predictive_analytics',
      label: 'Predictions',
      value: '2.4K',
      subtext: 'This Month',
      color: 'bg-amber-500'
    },
    {
      icon: 'ai_brain',
      label: 'Model Accuracy',
      value: '96.3%',
      subtext: 'Latest Training',
      color: 'bg-purple-500'
    },
    {
      icon: 'cloud_computing',
      label: 'Cloud Usage',
      value: '47GB',
      subtext: 'Monthly Quota',
      color: 'bg-cyan-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600">{stat.label}</h3>
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <Icon
                name={stat.icon as any}
                className="w-5 h-5 text-white"
              />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
          <p className="text-xs text-slate-500">{stat.subtext}</p>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// EXAMPLE 5: Settings Panel with AI Icons
// ============================================================================

export function AISettingsPanel() {
  return (
    <div className="space-y-6">
      {/* AI Features Section */}
      <div className="border border-slate-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="ai_chip" className="w-6 h-6 text-slate-700" />
          <h3 className="text-lg font-semibold text-slate-900">
            AI Features
          </h3>
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="rounded" defaultChecked />
            <div className="flex items-center gap-2">
              <Icon name="chatbot" className="w-5 h-5 text-slate-600" />
              <span className="text-slate-700">Enable AI Chatbot</span>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="rounded" defaultChecked />
            <div className="flex items-center gap-2">
              <Icon name="predictive_analytics" className="w-5 h-5 text-slate-600" />
              <span className="text-slate-700">Enable Predictive Analytics</span>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="rounded" />
            <div className="flex items-center gap-2">
              <Icon name="quantum_computing" className="w-5 h-5 text-slate-600" />
              <span className="text-slate-700">Enable Quantum Computing</span>
            </div>
          </label>
        </div>
      </div>

      {/* Advanced Options Section */}
      <div className="border border-slate-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="machine_learning_gear" className="w-6 h-6 text-slate-700" />
          <h3 className="text-lg font-semibold text-slate-900">
            Advanced Configuration
          </h3>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Optimize your AI model performance with these advanced settings.
        </p>
        <button className="px-4 py-2 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition-colors font-medium">
          Open Configuration
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 6: AI Service Status Monitor
// ============================================================================

export function AIServiceStatus() {
  const services = [
    {
      icon: 'chatbot',
      name: 'AI Support Concierge',
      status: 'operational',
      uptime: '99.98%'
    },
    {
      icon: 'data_network',
      name: 'Data Processing Network',
      status: 'operational',
      uptime: '99.95%'
    },
    {
      icon: 'neural_network',
      name: 'Neural Network Engine',
      status: 'operational',
      uptime: '99.99%'
    },
    {
      icon: 'cloud_computing',
      name: 'Cloud Services',
      status: 'operational',
      uptime: '99.97%'
    }
  ]

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <Icon name="smart_assistant" className="w-6 h-6 text-slate-700" />
        AI Services Status
      </h2>
      <div className="space-y-2">
        {services.map((service) => (
          <div
            key={service.name}
            className="flex items-center justify-between p-4 bg-white border border-green-200 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Icon
                  name={service.icon as any}
                  className="w-5 h-5 text-slate-600"
                />
                <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-slate-900">{service.name}</p>
                <p className="text-xs text-slate-500">Uptime: {service.uptime}</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded">
              {service.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 7: Icon Size Reference
// ============================================================================

export function IconSizeReference() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Small (w-4 h-4)</h3>
        <div className="flex gap-4">
          <Icon name="ai_brain" className="w-4 h-4 text-slate-700" />
          <Icon name="chatbot" className="w-4 h-4 text-blue-500" />
          <Icon name="neural_network" className="w-4 h-4 text-purple-500" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Medium (w-6 h-6) - Default</h3>
        <div className="flex gap-4">
          <Icon name="ai_brain" className="w-6 h-6 text-slate-700" />
          <Icon name="chatbot" className="w-6 h-6 text-blue-500" />
          <Icon name="neural_network" className="w-6 h-6 text-purple-500" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Large (w-8 h-8)</h3>
        <div className="flex gap-4">
          <Icon name="ai_brain" className="w-8 h-8 text-slate-700" />
          <Icon name="chatbot" className="w-8 h-8 text-blue-500" />
          <Icon name="neural_network" className="w-8 h-8 text-purple-500" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Extra Large (w-12 h-12)</h3>
        <div className="flex gap-4">
          <Icon name="ai_brain" className="w-12 h-12 text-slate-700" />
          <Icon name="chatbot" className="w-12 h-12 text-blue-500" />
          <Icon name="neural_network" className="w-12 h-12 text-purple-500" />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 8: Type-Safe Icon Selector Hook
// ============================================================================

import { useMemo } from 'react'
import { IconName } from '@/components/ui/icons'

export function useAIIcons() {
  return useMemo(() => ({
    support: 'chatbot' as IconName,
    intelligence: 'ai_brain' as IconName,
    learning: 'neural_network' as IconName,
    analytics: 'predictive_analytics' as IconName,
    data: 'data_science_chart' as IconName,
    automation: 'automated_workflow' as IconName,
    cloud: 'cloud_computing' as IconName,
    settings: 'machine_learning_gear' as IconName,
    assistant: 'smart_assistant' as IconName,
  }), [])
}

// Usage:
export function AIFeatureIcon({ feature }: { feature: keyof ReturnType<typeof useAIIcons> }) {
  const icons = useAIIcons()
  return <Icon name={icons[feature]} className="w-6 h-6" />
}

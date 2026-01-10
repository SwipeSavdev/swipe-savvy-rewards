import { aiConciergeApi, type AIConciergeEvent } from '@/services/apiClient'
import { useAuthStore } from '@/store/authStore'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Bot, Send, Sparkles, MessageCircle, Clock, ThumbsUp, TrendingUp,
  User, Zap, Ticket, Brain, AlertCircle, CheckCircle, Loader2,
  Search, FileText, RefreshCcw, Shield
} from 'lucide-react'

interface ToolExecution {
  id: string
  tool: string
  args: string | Record<string, unknown>
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'approval_required'
  result?: Record<string, unknown>
  approvalKey?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  suggestedActions?: string[]
  toolExecutions?: ToolExecution[]
}

const defaultStats = {
  totalConversations: 0,
  avgResponseTime: 0,
  satisfactionRate: 0,
  resolutionRate: 0,
}

const suggestedPrompts = [
  'Look up the customer john@example.com',
  'Create a support ticket for a billing issue',
  'Process a $50 refund for transaction TXN-12345',
  'Show me analytics for the last 7 days',
  'Check the status of merchant ABC Corp',
]

const recentTickets = [
  { id: 'TKT-001', subject: 'Payment not processed', priority: 'high', status: 'open' },
  { id: 'TKT-002', subject: 'App crash on login', priority: 'urgent', status: 'in_progress' },
  { id: 'TKT-003', subject: 'Refund request', priority: 'medium', status: 'open' },
]

// Map tool names to display info
const toolDisplayInfo: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  lookup_user: { label: 'Looking Up User', icon: <Search className="w-3 h-3" />, color: 'blue' },
  lookup_transaction: { label: 'Looking Up Transaction', icon: <Search className="w-3 h-3" />, color: 'blue' },
  lookup_merchant: { label: 'Looking Up Merchant', icon: <Search className="w-3 h-3" />, color: 'blue' },
  create_support_ticket: { label: 'Creating Ticket', icon: <Ticket className="w-3 h-3" />, color: 'purple' },
  update_support_ticket: { label: 'Updating Ticket', icon: <FileText className="w-3 h-3" />, color: 'purple' },
  add_ticket_note: { label: 'Adding Note', icon: <FileText className="w-3 h-3" />, color: 'purple' },
  process_refund: { label: 'Processing Refund', icon: <RefreshCcw className="w-3 h-3" />, color: 'amber' },
  get_analytics: { label: 'Fetching Analytics', icon: <TrendingUp className="w-3 h-3" />, color: 'green' },
  get_merchant_analytics: { label: 'Merchant Analytics', icon: <TrendingUp className="w-3 h-3" />, color: 'green' },
  toggle_feature_flag: { label: 'Toggling Feature', icon: <Shield className="w-3 h-3" />, color: 'red' },
}

function ToolExecutionCard({ execution }: { execution: ToolExecution }) {
  const info = toolDisplayInfo[execution.tool] || {
    label: execution.tool,
    icon: <Zap className="w-3 h-3" />,
    color: 'gray'
  }

  const statusColors = {
    pending: 'bg-gray-100 border-gray-300',
    executing: 'bg-blue-50 border-blue-300',
    completed: 'bg-green-50 border-green-300',
    failed: 'bg-red-50 border-red-300',
    approval_required: 'bg-amber-50 border-amber-300',
  }

  return (
    <div className={`rounded-lg border p-2 text-xs ${statusColors[execution.status]}`}>
      <div className="flex items-center gap-2">
        <span className={`p-1 rounded bg-${info.color}-100 text-${info.color}-600`}>
          {info.icon}
        </span>
        <span className="font-medium">{info.label}</span>
        {execution.status === 'executing' && (
          <Loader2 className="w-3 h-3 animate-spin text-blue-600 ml-auto" />
        )}
        {execution.status === 'completed' && (
          <CheckCircle className="w-3 h-3 text-green-600 ml-auto" />
        )}
        {execution.status === 'failed' && (
          <AlertCircle className="w-3 h-3 text-red-600 ml-auto" />
        )}
        {execution.status === 'approval_required' && (
          <Shield className="w-3 h-3 text-amber-600 ml-auto" />
        )}
      </div>
      {execution.result && (
        <div className="mt-1.5 text-gray-600">
          {execution.result.success ? (
            <span className="text-green-700">{String(execution.result.message || 'Success')}</span>
          ) : (
            <span className="text-red-700">{String(execution.result.error || 'Failed')}</span>
          )}
        </div>
      )}
    </div>
  )
}

// Get permissions for a role (simplified - in production use RBAC API)
function getRolePermissions(role: string): string[] {
  const rolePermissions: Record<string, string[]> = {
    super_admin: ['*'],
    admin: ['users:read', 'users:write', 'merchants:read', 'merchants:write', 'transactions:read', 'transactions:refund', 'support:read', 'support:write', 'analytics:read', 'feature_flags:write'],
    support: ['users:read', 'transactions:read', 'transactions:refund', 'support:read', 'support:write'],
    analyst: ['analytics:read', 'transactions:read', 'merchants:read'],
  }
  return rolePermissions[role] || rolePermissions.analyst
}

export default function AISupportConciergePage() {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello${user?.name ? `, ${user.name}` : ''}! I'm Savvy AI, your intelligent support assistant. I can help you look up customers, create tickets, process refunds, and more - all based on your ${user?.role || 'role'} permissions. How can I assist you today?`,
      timestamp: new Date().toISOString(),
      suggestedActions: ['Look up a customer', 'Create ticket', 'View analytics'],
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [stats, setStats] = useState(defaultStats)
  const [useAgenticMode, setUseAgenticMode] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)

  // Load stats on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await aiConciergeApi.getStats()
        if (response) {
          setStats({
            totalConversations: response.total_conversations || 0,
            avgResponseTime: parseFloat(response.avg_response_time) || 0,
            satisfactionRate: response.satisfaction_rate || 0,
            resolutionRate: 87.3,
          })
        }
      } catch (err) {
        console.error('Failed to load AI concierge stats:', err)
      }
    }
    loadStats()
  }, [])

  // Only auto-scroll chat after user sends a message
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Handle agentic streaming message
  const handleAgenticMessage = useCallback(async (messageToSend: string) => {
    if (!user) return

    // Generate session ID if not exists
    const currentSessionId = sessionId || `session_${user.id}_${Date.now()}`
    if (!sessionId) {
      setSessionId(currentSessionId)
    }

    // Create assistant message placeholder
    const assistantMsgId = `msg-${Date.now() + 1}`
    setMessages(prev => [...prev, {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      toolExecutions: [],
    }])

    try {
      // Get user permissions
      const permissions = getRolePermissions(user.role)

      // Stream agentic response
      const stream = aiConciergeApi.sendAgenticMessage(messageToSend, {
        userId: user.id,
        role: user.role,
        permissions,
        employeeName: user.name,
        sessionId: currentSessionId,
        context: { current_page: 'ai-concierge' },
      })

      let fullContent = ''
      const toolExecutions: ToolExecution[] = []

      for await (const event of stream) {
        handleStreamEvent(event, assistantMsgId, fullContent, toolExecutions, (content) => { fullContent = content })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setMessages(prev => prev.map(m =>
        m.id === assistantMsgId
          ? { ...m, content: `I apologize, but I encountered an issue: ${errorMessage}. Please try again.` }
          : m
      ))
    }
  }, [user, sessionId])

  // Handle individual stream events
  const handleStreamEvent = (
    event: AIConciergeEvent,
    assistantMsgId: string,
    fullContent: string,
    toolExecutions: ToolExecution[],
    setFullContent: (c: string) => void
  ) => {
    switch (event.type) {
      case 'message':
        if (event.delta) {
          const newContent = fullContent + event.delta
          setFullContent(newContent)
          setMessages(prev => prev.map(m =>
            m.id === assistantMsgId ? { ...m, content: newContent } : m
          ))
        }
        break

      case 'tool_call':
        const newExecution: ToolExecution = {
          id: `tool-${Date.now()}`,
          tool: event.tool || '',
          args: event.args || {},
          status: 'executing',
        }
        toolExecutions.push(newExecution)
        setMessages(prev => prev.map(m =>
          m.id === assistantMsgId ? { ...m, toolExecutions: [...toolExecutions] } : m
        ))
        break

      case 'tool_result':
        const lastExecution = toolExecutions.find(t => t.tool === event.tool && t.status === 'executing')
        if (lastExecution) {
          lastExecution.status = event.success ? 'completed' : 'failed'
          lastExecution.result = event.result
          setMessages(prev => prev.map(m =>
            m.id === assistantMsgId ? { ...m, toolExecutions: [...toolExecutions] } : m
          ))
        }
        break

      case 'approval_required':
        const approvalExecution = toolExecutions.find(t => t.tool === event.tool && t.status === 'executing')
        if (approvalExecution) {
          approvalExecution.status = 'approval_required'
          approvalExecution.approvalKey = event.approval_key
          setMessages(prev => prev.map(m =>
            m.id === assistantMsgId ? { ...m, toolExecutions: [...toolExecutions] } : m
          ))
        }
        break

      case 'done':
        setMessages(prev => prev.map(m =>
          m.id === assistantMsgId
            ? { ...m, content: event.content || fullContent, suggestedActions: ['Create ticket', 'Look up another', 'Generate report'] }
            : m
        ))
        break

      case 'error':
        setMessages(prev => prev.map(m =>
          m.id === assistantMsgId ? { ...m, content: `I encountered an error: ${event.error || event.message}` } : m
        ))
        break
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    try {
      setError(null)
      setLoading(true)

      const userMsg: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: inputMessage,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, userMsg])
      const messageToSend = inputMessage
      setInputMessage('')

      if (useAgenticMode) {
        await handleAgenticMessage(messageToSend)
      } else {
        // Fallback to non-agentic mode
        const response = await aiConciergeApi.sendMessage(messageToSend, sessionId || undefined)

        if (response.conversation_id && !sessionId) {
          setSessionId(response.conversation_id)
        }

        if (response.response) {
          setMessages(prev => [...prev, {
            id: `msg-${Date.now() + 1}`,
            role: 'assistant',
            content: response.response,
            timestamp: new Date().toISOString(),
            suggestedActions: ['Create ticket', 'Escalate issue', 'Close conversation'],
          }])
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message'
      setError(message)
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `I apologize, but I encountered an issue: ${message}. Please try again.`,
        timestamp: new Date().toISOString(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Savvy AI Concierge</h1>
            <p className="text-gray-600 mt-1">Intelligent support assistant for {user?.role || 'employees'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={useAgenticMode}
              onChange={(e) => setUseAgenticMode(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Zap className="w-4 h-4 text-amber-500" />
            Agentic Mode
          </label>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            AI Online
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Conversations</span>
            <MessageCircle className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalConversations.toLocaleString()}</p>
          <span className="text-xs text-green-600">+12.4% vs last week</span>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg Response Time</span>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}s</p>
          <span className="text-xs text-green-600">15.2% faster</span>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Satisfaction Rate</span>
            <ThumbsUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.satisfactionRate}%</p>
          <span className="text-xs text-green-600">+2.1% vs last month</span>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Your Role</span>
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 capitalize">{user?.role?.replace('_', ' ') || 'N/A'}</p>
          <span className="text-xs text-gray-500">Tool access varies by role</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-3">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-[420px]">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <Bot className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Savvy AI</h3>
                  <p className="text-xs text-gray-500">Role-aware assistant{useAgenticMode ? ' with tool execution' : ''}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                <Brain className="w-3 h-3" />
                {useAgenticMode ? 'Agentic Mode' : 'Chat Mode'}
              </span>
            </div>

            {/* Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-500 to-purple-700'
                  }`}>
                    {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-white" /> : <Sparkles className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="flex-1 max-w-[85%]">
                    <div className={`px-3 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-tl-none shadow-sm'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {/* Tool Executions */}
                    {msg.toolExecutions && msg.toolExecutions.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {msg.toolExecutions.map((exec) => (
                          <ToolExecutionCard key={exec.id} execution={exec} />
                        ))}
                      </div>
                    )}
                    {msg.suggestedActions && msg.role === 'assistant' && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {msg.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => setInputMessage(action)}
                            className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className={`text-xs mt-1 text-gray-400 ${msg.role === 'user' ? 'text-right' : ''}`}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="px-3 py-2 rounded-lg rounded-tl-none bg-white border border-gray-200 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={useAgenticMode ? "Ask me to look up, create, or process something..." : "Describe the issue or ask a question..."}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  disabled={loading}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !inputMessage.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Press Enter to send. {useAgenticMode && 'AI can execute actions based on your role.'}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Prompts */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-yellow-500" />
              <h3 className="font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="space-y-2">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputMessage(prompt)}
                  className="w-full text-left text-sm px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Tickets */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Ticket className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Recent Tickets</h3>
            </div>
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setInputMessage(`Look up ticket ${ticket.id}`)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-gray-500">{ticket.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{ticket.subject}</p>
                </button>
              ))}
            </div>
          </div>

          {/* AI Capabilities */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-4 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4" />
              <h3 className="font-semibold">Your AI Capabilities</h3>
            </div>
            <ul className="space-y-2 text-sm text-white/80">
              {user?.role === 'super_admin' && (
                <>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Full system access</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Unlimited refunds</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Feature flag control</li>
                </>
              )}
              {user?.role === 'admin' && (
                <>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />User/Merchant management</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Refunds up to $10,000</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Analytics access</li>
                </>
              )}
              {user?.role === 'support' && (
                <>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Customer lookups</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Ticket management</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Refunds up to $100</li>
                </>
              )}
              {user?.role === 'analyst' && (
                <>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Analytics & reports</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Transaction data</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />Read-only access</li>
                </>
              )}
              {!user?.role && (
                <>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-400" />Login to see capabilities</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

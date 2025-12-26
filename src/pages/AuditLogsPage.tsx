import React, { useState, useEffect } from 'react'
import { LogOut, User, Clock, Filter, Download } from 'lucide-react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterUser, setFilterUser] = useState<string>('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  useEffect(() => {
    fetchLogs()
  }, [filterAction, filterUser])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      // Mock data for demo - in production, this would call the API
      const mockLogs = [
        {
          log_id: '1',
          admin_user_id: 'user1',
          admin_email: 'john@swipesavvy.com',
          action_type: 'ticket_updated',
          resource_type: 'support_ticket',
          resource_id: 'TICKET-001',
          changes: { status: 'open -> in_progress' },
          timestamp: new Date(Date.now() - 300000).toISOString(),
          ip_address: '192.168.1.1'
        },
        {
          log_id: '2',
          admin_user_id: 'user2',
          admin_email: 'sarah@swipesavvy.com',
          action_type: 'ticket_escalated',
          resource_type: 'support_ticket',
          resource_id: 'TICKET-002',
          changes: { escalation_level: 'level_2' },
          timestamp: new Date(Date.now() - 600000).toISOString(),
          ip_address: '192.168.1.2'
        },
        {
          log_id: '3',
          admin_user_id: 'user1',
          admin_email: 'john@swipesavvy.com',
          action_type: 'user_created',
          resource_type: 'admin_user',
          resource_id: 'user3',
          changes: { email: 'mike@swipesavvy.com' },
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          ip_address: '192.168.1.1'
        },
        {
          log_id: '4',
          admin_user_id: 'user2',
          admin_email: 'sarah@swipesavvy.com',
          action_type: 'settings_updated',
          resource_type: 'system_setting',
          resource_id: 'max_response_time',
          changes: { value: '24 -> 12' },
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          ip_address: '192.168.1.2'
        },
        {
          log_id: '5',
          admin_user_id: 'user1',
          admin_email: 'john@swipesavvy.com',
          action_type: 'login',
          resource_type: 'admin_user',
          resource_id: 'user1',
          changes: {},
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          ip_address: '192.168.1.1'
        }
      ]
      setLogs(mockLogs)
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'ticket_updated': return 'bg-blue-100 text-blue-800'
      case 'ticket_escalated': return 'bg-red-100 text-red-800'
      case 'user_created': return 'bg-green-100 text-green-800'
      case 'user_deleted': return 'bg-red-100 text-red-800'
      case 'settings_updated': return 'bg-purple-100 text-purple-800'
      case 'login': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login': return <LogOut className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Resource', 'IP Address'],
      ...logs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.admin_email,
        log.action_type,
        `${log.resource_type}/${log.resource_id}`,
        log.ip_address
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">Track all system actions and changes</p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Filter className="w-4 h-4 inline mr-2" />
            Action Type
          </label>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Actions</option>
            <option value="ticket_updated">Ticket Updated</option>
            <option value="ticket_escalated">Ticket Escalated</option>
            <option value="user_created">User Created</option>
            <option value="login">Login</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User
          </label>
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Users</option>
            <option value="john@swipesavvy.com">John Smith</option>
            <option value="sarah@swipesavvy.com">Sarah Johnson</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No audit logs found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Timestamp</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Resource</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">IP Address</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Changes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {log.admin_email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(log.action_type)}`}>
                        {getActionIcon(log.action_type)}
                        {log.action_type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {log.resource_type}/{log.resource_id}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {log.ip_address}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="text-xs">{Object.entries(log.changes).map(([k, v]) => `${k}: ${v}`).join(', ') || '-'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { Ticket, ChevronRight, AlertCircle, Clock, User, MessageSquare } from 'lucide-react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const SupportTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all')
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [ticketDetail, setTicketDetail] = useState<any>(null)

  useEffect(() => {
    fetchTickets()
  }, [filter])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const status = filter === 'all' ? undefined : filter
      const response = await axios.get(`${API_BASE_URL}/api/support/tickets`, {
        params: { status, limit: 50 }
      })
      setTickets(response.data.tickets)
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTicketDetail = async (ticketId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/support/tickets/${ticketId}`)
      setTicketDetail(response.data)
      setSelectedTicket(ticketId)
    } catch (error) {
      console.error('Failed to fetch ticket details:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-purple-100 text-purple-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'escalated': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600 mt-1">Manage and respond to customer support requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        {(['all', 'open', 'in_progress', 'resolved'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No tickets found</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.ticket_id}
                    onClick={() => fetchTicketDetail(ticket.ticket_id)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition ${
                      selectedTicket === ticket.ticket_id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <Ticket className="w-5 h-5 text-gray-400" />
                          <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                        </div>
                        <p className="text-sm text-gray-600 ml-8">ID: {ticket.ticket_id}</p>
                        <p className="text-sm text-gray-500 ml-8 mt-1">{ticket.description.substring(0, 100)}...</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ticket Details Panel */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 h-fit">
          {selectedTicket && ticketDetail ? (
            <div className="space-y-4">
              <h2 className="font-bold text-lg text-gray-900">Ticket Details</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Ticket ID</p>
                  <p className="text-sm text-gray-900 font-mono">{ticketDetail.ticket.ticket_id}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Customer</p>
                  <p className="text-sm text-gray-900">{ticketDetail.ticket.customer_id}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Category</p>
                  <p className="text-sm text-gray-900 capitalize">{ticketDetail.ticket.category}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Priority</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticketDetail.ticket.priority)}`}>
                    {ticketDetail.ticket.priority}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Status</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticketDetail.ticket.status)}`}>
                    {ticketDetail.ticket.status}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Created</p>
                  <p className="text-sm text-gray-900">
                    {new Date(ticketDetail.ticket.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Messages</p>
                  <p className="text-sm text-gray-900">{ticketDetail.messages.length} messages</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                  Reply to Ticket
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>Select a ticket to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

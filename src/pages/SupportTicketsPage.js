import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Ticket, ChevronRight, MessageSquare } from 'lucide-react';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const SupportTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketDetail, setTicketDetail] = useState(null);
    useEffect(() => {
        fetchTickets();
    }, [filter]);
    const fetchTickets = async () => {
        try {
            setLoading(true);
            const status = filter === 'all' ? undefined : filter;
            const response = await axios.get(`${API_BASE_URL}/api/support/tickets`, {
                params: { status, limit: 50 }
            });
            setTickets(response.data.tickets);
        }
        catch (error) {
            console.error('Failed to fetch tickets:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchTicketDetail = async (ticketId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/support/tickets/${ticketId}`);
            setTicketDetail(response.data);
            setSelectedTicket(ticketId);
        }
        catch (error) {
            console.error('Failed to fetch ticket details:', error);
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-purple-100 text-purple-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'escalated': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Support Tickets" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage and respond to customer support requests" })] }) }), _jsx("div", { className: "flex gap-3", children: ['all', 'open', 'in_progress', 'resolved'].map((status) => (_jsx("button", { onClick: () => setFilter(status), className: `px-4 py-2 rounded-lg font-medium transition ${filter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`, children: status.replace('_', ' ').toUpperCase() }, status))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx("div", { className: "lg:col-span-2", children: _jsx("div", { className: "bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden", children: loading ? (_jsx("div", { className: "p-8 text-center text-gray-500", children: "Loading tickets..." })) : tickets.length === 0 ? (_jsx("div", { className: "p-8 text-center text-gray-500", children: "No tickets found" })) : (_jsx("div", { className: "divide-y divide-gray-200", children: tickets.map((ticket) => (_jsx("button", { onClick: () => fetchTicketDetail(ticket.ticket_id), className: `w-full p-4 text-left hover:bg-gray-50 transition ${selectedTicket === ticket.ticket_id ? 'bg-blue-50' : ''}`, children: _jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-1", children: [_jsx(Ticket, { className: "w-5 h-5 text-gray-400" }), _jsx("h3", { className: "font-semibold text-gray-900", children: ticket.subject })] }), _jsxs("p", { className: "text-sm text-gray-600 ml-8", children: ["ID: ", ticket.ticket_id] }), _jsxs("p", { className: "text-sm text-gray-500 ml-8 mt-1", children: [ticket.description.substring(0, 100), "..."] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`, children: ticket.priority }), _jsx("span", { className: `px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`, children: ticket.status }), _jsx(ChevronRight, { className: "w-5 h-5 text-gray-400" })] })] }) }, ticket.ticket_id))) })) }) }), _jsx("div", { className: "bg-white rounded-lg border border-gray-200 shadow-sm p-6 h-fit", children: selectedTicket && ticketDetail ? (_jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "font-bold text-lg text-gray-900", children: "Ticket Details" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase", children: "Ticket ID" }), _jsx("p", { className: "text-sm text-gray-900 font-mono", children: ticketDetail.ticket.ticket_id })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase", children: "Customer" }), _jsx("p", { className: "text-sm text-gray-900", children: ticketDetail.ticket.customer_id })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase", children: "Category" }), _jsx("p", { className: "text-sm text-gray-900 capitalize", children: ticketDetail.ticket.category })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase", children: "Priority" }), _jsx("span", { className: `inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticketDetail.ticket.priority)}`, children: ticketDetail.ticket.priority })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase", children: "Status" }), _jsx("span", { className: `inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticketDetail.ticket.status)}`, children: ticketDetail.ticket.status })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase", children: "Created" }), _jsx("p", { className: "text-sm text-gray-900", children: new Date(ticketDetail.ticket.created_at).toLocaleDateString() })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase", children: "Messages" }), _jsxs("p", { className: "text-sm text-gray-900", children: [ticketDetail.messages.length, " messages"] })] })] }), _jsx("div", { className: "pt-4 border-t border-gray-200", children: _jsx("button", { className: "w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition", children: "Reply to Ticket" }) })] })) : (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(MessageSquare, { className: "w-12 h-12 mx-auto text-gray-300 mb-3" }), _jsx("p", { children: "Select a ticket to view details" })] })) })] })] }));
};

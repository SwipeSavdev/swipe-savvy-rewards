import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Plus, Search, Star } from 'lucide-react';
export function MerchantsPage() {
    const [merchants, setMerchants] = useState([
        {
            id: '1',
            name: 'Tech Store Pro',
            email: 'contact@techstore.com',
            category: 'Electronics',
            status: 'active',
            rating: 4.8,
            revenue: 45000,
            transactions: 521,
            joined_date: '2025-01-20',
        },
        {
            id: '2',
            name: 'Fashion Hub',
            email: 'hello@fashionhub.com',
            category: 'Fashion',
            status: 'active',
            rating: 4.6,
            revenue: 38000,
            transactions: 412,
            joined_date: '2025-02-10',
        },
        {
            id: '3',
            name: 'Food Delivery Co',
            email: 'support@foodco.com',
            category: 'Food & Beverage',
            status: 'pending',
            rating: 0,
            revenue: 0,
            transactions: 0,
            joined_date: '2025-12-20',
        },
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        category: 'Electronics',
    });
    const handleCreate = async () => {
        if (!formData.name || !formData.email) {
            alert('Name and email are required');
            return;
        }
        const newMerchant = {
            id: Date.now().toString(),
            name: formData.name,
            email: formData.email,
            category: formData.category,
            status: 'pending',
            rating: 0,
            revenue: 0,
            transactions: 0,
            joined_date: new Date().toISOString().split('T')[0],
        };
        setMerchants([newMerchant, ...merchants]);
        setFormData({ name: '', email: '', category: 'Electronics' });
        setShowForm(false);
        alert('Merchant created successfully!');
    };
    const filteredMerchants = merchants.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            inactive: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };
    const topMerchants = [...merchants]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 3);
    const totalRevenue = merchants
        .filter(m => m.status === 'active')
        .reduce((sum, m) => sum + m.revenue, 0);
    return (_jsx("div", { className: "p-8", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex justify-between items-center mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Merchants" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Manage merchant partners and commissions" })] }), _jsxs("button", { onClick: () => setShowForm(true), className: "inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Merchant"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8", children: [_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("p", { className: "text-gray-600 text-sm", children: "Total Merchants" }), _jsx("p", { className: "text-3xl font-bold text-gray-900 mt-2", children: merchants.length }), _jsxs("p", { className: "text-green-600 text-sm mt-2", children: [merchants.filter(m => m.status === 'active').length, " active"] })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("p", { className: "text-gray-600 text-sm", children: "Total Revenue" }), _jsxs("p", { className: "text-3xl font-bold text-gray-900 mt-2", children: ["$", (totalRevenue / 1000).toFixed(1), "k"] }), _jsx("p", { className: "text-blue-600 text-sm mt-2", children: "From active merchants" })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("p", { className: "text-gray-600 text-sm", children: "Total Transactions" }), _jsx("p", { className: "text-3xl font-bold text-gray-900 mt-2", children: merchants.reduce((sum, m) => sum + m.transactions, 0).toLocaleString() }), _jsx("p", { className: "text-purple-600 text-sm mt-2", children: "All time" })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("p", { className: "text-gray-600 text-sm", children: "Avg Rating" }), _jsx("p", { className: "text-3xl font-bold text-gray-900 mt-2", children: (merchants
                                        .filter(m => m.rating > 0)
                                        .reduce((sum, m) => sum + m.rating, 0) / merchants.filter(m => m.rating > 0).length).toFixed(1) }), _jsx("p", { className: "text-yellow-600 text-sm mt-2", children: "Active merchants" })] })] }), showForm && (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6 mb-8", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Add New Merchant" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4", children: [_jsx("input", { type: "text", placeholder: "Merchant Name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsx("input", { type: "email", placeholder: "Email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), className: "px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsxs("select", { value: formData.category, onChange: (e) => setFormData({ ...formData, category: e.target.value }), className: "px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "Electronics", children: "Electronics" }), _jsx("option", { value: "Fashion", children: "Fashion" }), _jsx("option", { value: "Food & Beverage", children: "Food & Beverage" }), _jsx("option", { value: "Services", children: "Services" }), _jsx("option", { value: "Other", children: "Other" })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleCreate, className: "px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700", children: "Create" }), _jsx("button", { onClick: () => setShowForm(false), className: "px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50", children: "Cancel" })] })] })), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6 mb-8", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Top Performing Merchants" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: topMerchants.map((merchant) => (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("h3", { className: "font-semibold text-gray-900", children: merchant.name }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Star, { className: "w-4 h-4 text-yellow-400 fill-yellow-400" }), _jsx("span", { className: "text-sm font-medium", children: merchant.rating.toFixed(1) })] })] }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: merchant.category }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Revenue" }), _jsxs("span", { className: "font-semibold text-green-600", children: ["$", merchant.revenue.toLocaleString()] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Transactions" }), _jsx("span", { className: "font-semibold", children: merchant.transactions })] })] })] }, merchant.id))) })] }), _jsx("div", { className: "mb-6", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-3 w-4 h-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search merchants...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })] }) }), _jsx("div", { className: "bg-white rounded-lg border border-gray-200 overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b border-gray-200", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Name" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Category" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Revenue" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Transactions" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Rating" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: filteredMerchants.map((merchant) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: merchant.name }), _jsx("p", { className: "text-sm text-gray-600", children: merchant.email })] }) }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: merchant.category }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: `px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(merchant.status)}`, children: merchant.status }) }), _jsxs("td", { className: "px-6 py-4 text-sm font-medium text-gray-900", children: ["$", merchant.revenue.toLocaleString()] }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: merchant.transactions }), _jsx("td", { className: "px-6 py-4", children: merchant.rating > 0 ? (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Star, { className: "w-4 h-4 text-yellow-400 fill-yellow-400" }), _jsx("span", { className: "text-sm font-medium", children: merchant.rating.toFixed(1) })] })) : (_jsx("span", { className: "text-sm text-gray-500", children: "N/A" })) }), _jsx("td", { className: "px-6 py-4 text-sm", children: _jsx("button", { className: "text-blue-600 hover:text-blue-700 font-medium", children: "Edit" }) })] }, merchant.id))) })] }) })] }) }));
}

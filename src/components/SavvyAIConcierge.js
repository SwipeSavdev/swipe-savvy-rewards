import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Zap } from 'lucide-react';
const SavvyAIConcierge = ({ currentPage, userRole }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    const handleSendMessage = async () => {
        if (!inputValue.trim())
            return;
        const userMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: inputValue,
            timestamp: new Date(),
            source: 'direct',
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        try {
            const aiMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: 'I understand. How can I help you further?',
                timestamp: new Date(),
                source: 'data-driven',
            };
            setTimeout(() => {
                setMessages(prev => [...prev, aiMessage]);
                setIsLoading(false);
            }, 1000);
        }
        catch (error) {
            console.error('Error sending message:', error);
            setIsLoading(false);
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setIsOpen(!isOpen), className: `fixed bottom-6 right-6 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 ${isOpen
                    ? 'bg-indigo-700 scale-95'
                    : 'bg-gradient-to-br from-indigo-600 to-purple-600 hover:scale-110'}`, children: isOpen ? (_jsx(X, { className: "w-6 h-6 text-white" })) : (_jsx(MessageCircle, { className: "w-6 h-6 text-white animate-pulse" })) }), isOpen && (_jsxs("div", { className: "fixed bottom-24 right-6 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50", style: { maxHeight: '500px' }, children: [_jsxs("div", { className: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "w-5 h-5 animate-pulse" }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-lg", children: "Savvy AI Concierge" }), _jsx("p", { className: "text-xs text-indigo-100", children: "Cross-Platform Intelligence" })] })] }), _jsx("button", { onClick: () => setIsOpen(false), className: "hover:bg-white/20 p-1 rounded transition-colors", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-4 bg-gray-50", children: [messages.map((msg) => (_jsx("div", { className: `mb-4 flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`, children: _jsxs("div", { className: `max-w-xs px-4 py-3 rounded-lg ${msg.type === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                        : 'bg-gray-200 text-gray-900 rounded-bl-none'}`, children: [_jsx("p", { className: "text-sm", children: msg.content }), _jsx("span", { className: `text-xs ${msg.type === 'user' ? 'text-indigo-100' : 'text-gray-500'} mt-1 block`, children: msg.timestamp.toLocaleTimeString() })] }) }, msg.id))), isLoading && (_jsx("div", { className: "mb-4 flex justify-start", children: _jsx("div", { className: "bg-gray-200 text-gray-900 px-4 py-3 rounded-lg", children: _jsxs("div", { className: "flex gap-1", children: [_jsx("span", { className: "w-2 h-2 bg-gray-500 rounded-full animate-bounce" }), _jsx("span", { className: "w-2 h-2 bg-gray-500 rounded-full animate-bounce", style: { animationDelay: '0.2s' } }), _jsx("span", { className: "w-2 h-2 bg-gray-500 rounded-full animate-bounce", style: { animationDelay: '0.4s' } })] }) }) })), _jsx("div", { ref: messagesEndRef })] }), _jsx("div", { className: "border-t border-gray-200 p-4 bg-white rounded-b-lg", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: inputValue, onChange: (e) => setInputValue(e.target.value), onKeyPress: handleKeyPress, placeholder: "Ask me anything...", className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500" }), _jsx("button", { onClick: handleSendMessage, disabled: isLoading || !inputValue.trim(), className: "p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50", children: _jsx(Send, { className: "w-4 h-4" }) })] }) })] })), _jsx("style", { children: `
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      ` })] }));
};
export default SavvyAIConcierge;

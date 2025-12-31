import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  metadata?: {
    insights?: string[];
    chart?: any;
  };
}

const mockChartData = [
  { day: 'Mon', spending: 120 },
  { day: 'Tue', spending: 150 },
  { day: 'Wed', spending: 98 },
  { day: 'Thu', spending: 220 },
  { day: 'Fri', spending: 280 },
  { day: 'Sat', spending: 190 },
  { day: 'Sun', spending: 145 },
];

const mockResponses = [
  "I've analyzed your spending patterns. You spent $1,183 this week, which is 15% above your average.",
  "Your top spending categories are: Food & Dining ($450), Transportation ($280), and Shopping ($375). Would you like optimization suggestions?",
  "I noticed you have 3 recurring subscriptions that aren't being actively used. You could save $45/month by canceling them.",
  "Your rewards balance is at 2,450 points! You're 180 points away from reaching Silver tier.",
  "Based on your current spending, I recommend setting a $1,000 weekly budget with alerts at 80% and 100%.",
  "You have 4 bills due in the next 7 days totaling $890. Would you like me to help schedule payments?",
];

const suggestedQuestions = [
  "What's my spending trend?",
  "Can you find savings opportunities?",
  "Analyze my top categories",
  "When are my bills due?",
  "Help me optimize rewards",
  "Set up a savings goal",
];

export function ConciergePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "👋 Welcome to Savvy Concierge! I'm your AI financial assistant for the admin portal. I can help you analyze user spending patterns, identify savings opportunities, optimize rewards, and provide financial insights. How can I help?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string = input) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response with delay
    setTimeout(() => {
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: randomResponse,
        timestamp: new Date(),
        metadata: {
          insights: [
            "📊 Spending analysis enabled",
            "💰 Budget recommendations",
            "⚡ Quick wins available",
          ],
          chart: mockChartData,
        },
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">🤖 Savvy Concierge</h1>
        <p className="text-sm text-gray-600 mt-1">AI-powered financial insights and recommendations</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl px-4 py-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none shadow-sm'
              }`}
            >
              <p className="text-sm">{message.content}</p>

              {/* Insights Pills */}
              {message.metadata?.insights && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.metadata.insights.map((insight, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-1 rounded-full ${
                        message.type === 'user'
                          ? 'bg-blue-400 text-blue-100'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {insight}
                    </span>
                  ))}
                </div>
              )}

              {/* Chart Display */}
              {message.metadata?.chart && (
                <div className="mt-4 bg-gray-50 p-4 rounded">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Weekly Spending Trend</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={message.metadata.chart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="spending"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <p className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg rounded-bl-none shadow-sm">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600">Concierge is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="px-6 py-4 bg-white border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-3">Suggested Questions:</p>
          <div className="grid grid-cols-2 gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="text-left px-3 py-2 bg-blue-50 text-blue-700 text-xs rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything about user finances, spending patterns, or recommendations..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

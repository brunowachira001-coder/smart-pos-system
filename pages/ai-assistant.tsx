import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'USER',
      content: input,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ASSISTANT',
        content: 'I can help you with sales analysis, inventory management, customer insights, and business recommendations. What would you like to know?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] shadow-sm p-6 h-[calc(100vh-12rem)] flex flex-col">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">AI Assistant</h1>
            <p className="text-[var(--text-secondary)] text-sm">Get insights and recommendations</p>
          </div>

          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[var(--text-secondary)]">
                <div className="text-center">
                  <p className="text-4xl mb-4">🤖</p>
                  <p>Start a conversation with your AI assistant</p>
                  <p className="text-sm mt-2">Ask about sales, inventory, customers, or get recommendations</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.role === 'USER'
                        ? 'bg-emerald-600 text-[var(--text-primary)] rounded-br-none'
                        : 'bg-gray-200 text-[var(--text-primary)] rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-[var(--text-primary)] px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-2 bg-emerald-600 text-[var(--text-primary)] rounded-lg hover:bg-emerald-700 font-semibold disabled:bg-gray-400"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] shadow-sm p-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Quick Prompts</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">Try these questions</p>
          <div className="space-y-2">
            <button
              onClick={() => setInput('What are my top selling products?')}
              className="w-full text-left p-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)] transition"
            >
              <p className="font-semibold text-[var(--text-primary)] text-sm">📊 Top Products</p>
              <p className="text-[var(--text-secondary)] text-xs">What are my top selling products?</p>
            </button>

            <button
              onClick={() => setInput('What inventory items are low on stock?')}
              className="w-full text-left p-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)] transition"
            >
              <p className="font-semibold text-[var(--text-primary)] text-sm">📦 Low Stock</p>
              <p className="text-[var(--text-secondary)] text-xs">What inventory items are low on stock?</p>
            </button>

            <button
              onClick={() => setInput('What is my sales forecast for next month?')}
              className="w-full text-left p-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)] transition"
            >
              <p className="font-semibold text-[var(--text-primary)] text-sm">📈 Forecast</p>
              <p className="text-[var(--text-secondary)] text-xs">What is my sales forecast for next month?</p>
            </button>

            <button
              onClick={() => setInput('Who are my top customers?')}
              className="w-full text-left p-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)] transition"
            >
              <p className="font-semibold text-[var(--text-primary)] text-sm">👥 Top Customers</p>
              <p className="text-[var(--text-secondary)] text-xs">Who are my top customers?</p>
            </button>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] shadow-sm p-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">AI Capabilities</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">What I can help with</p>
          <ul className="space-y-2 text-sm text-[var(--text-primary)]">
            <li>✅ Sales analysis & trends</li>
            <li>✅ Inventory optimization</li>
            <li>✅ Customer insights</li>
            <li>✅ Demand forecasting</li>
            <li>✅ Price recommendations</li>
            <li>✅ Business intelligence</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

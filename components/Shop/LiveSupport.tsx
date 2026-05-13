import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  sender: 'customer' | 'staff';
  text: string;
  timestamp: Date;
  staffName?: string;
  staffPhoto?: string;
  imageUrl?: string;
}

interface LiveSupportProps {
  tenantSlug: string;
  tenantId: string;
  customerName?: string;
  customerEmail?: string;
  primaryColor: string;
}

export default function LiveSupport({
  tenantSlug,
  tenantId,
  customerName,
  customerEmail,
  primaryColor,
}: LiveSupportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat_${tenantSlug}`);
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages);
      setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
    } else {
      // Welcome message
      setMessages([{
        id: '1',
        sender: 'staff',
        text: `Hi${customerName ? ' ' + customerName : ''}! 👋 Welcome to our store. How can we help you today?`,
        timestamp: new Date(),
        staffName: 'Support Team',
      }]);
    }
  }, [tenantSlug, customerName]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_${tenantSlug}`, JSON.stringify(messages));
    }
  }, [messages, tenantSlug]);

  // Send message
  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'customer',
      text: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate staff response (in real app, this would be WebSocket/API)
    setIsTyping(true);
    setTimeout(() => {
      const autoReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'staff',
        text: getAutoReply(inputText),
        timestamp: new Date(),
        staffName: 'Support Team',
      };
      setMessages(prev => [...prev, autoReply]);
      setIsTyping(false);
    }, 1500);
  };

  // Auto-reply logic (placeholder - in real app, this would be AI or human staff)
  const getAutoReply = (customerMessage: string): string => {
    const msg = customerMessage.toLowerCase();
    
    if (msg.includes('shipping') || msg.includes('delivery')) {
      return "We offer fast delivery! Most orders arrive within 2-5 business days. Free shipping on orders over KES 5,000. 🚚";
    }
    if (msg.includes('return') || msg.includes('refund')) {
      return "We have a 30-day return policy. If you're not satisfied, you can return items for a full refund. Just make sure they're in original condition. 💯";
    }
    if (msg.includes('payment') || msg.includes('pay')) {
      return "We accept M-PESA, Visa, Mastercard, and Airtel Money. All payments are secure and encrypted. 🔒";
    }
    if (msg.includes('size') || msg.includes('sizing')) {
      return "Check our size guide on each product page! If you're between sizes, we recommend sizing up. Need help with a specific item? Let me know! 📏";
    }
    if (msg.includes('stock') || msg.includes('available')) {
      return "You can see real-time stock availability on each product page. If something's out of stock, you can sign up for restock notifications! 📦";
    }
    if (msg.includes('track') || msg.includes('order')) {
      return "You can track your order from your account page. You'll also receive SMS updates when your order ships and when it's out for delivery! 📱";
    }
    
    return "Thanks for your message! A member of our team will respond shortly. In the meantime, feel free to browse our products or check our FAQ section. 😊";
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In real app, upload to server and get URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'customer',
        text: 'Sent an image',
        timestamp: new Date(),
        imageUrl: event.target?.result as string,
      };
      setMessages(prev => [...prev, newMessage]);
    };
    reader.readAsDataURL(file);
  };

  // Toggle chat window
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white transform hover:scale-110 transition-all duration-300 group"
        style={{ backgroundColor: primaryColor }}
        aria-label="Open live chat"
      >
        {isOpen ? (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {/* Online indicator */}
            {isOnline && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
            )}
            {/* Unread badge (if needed) */}
            {messages.filter(m => m.sender === 'staff').length > 1 && !isOpen && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {messages.filter(m => m.sender === 'staff').length - 1}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-slide-up">
          {/* Header */}
          <div 
            className="px-6 py-4 text-white flex items-center justify-between"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xl">
                  💬
                </div>
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg">Live Support</h3>
                <p className="text-xs opacity-90">
                  {isOnline ? 'We\'re online • Typically replies instantly' : 'Offline • We\'ll reply soon'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${message.sender === 'customer' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  {message.sender === 'staff' && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm flex-shrink-0">
                      {message.staffPhoto ? (
                        <img src={message.staffPhoto} alt={message.staffName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        '👤'
                      )}
                    </div>
                  )}
                  
                  {/* Message Bubble */}
                  <div>
                    {message.sender === 'staff' && message.staffName && (
                      <p className="text-xs text-gray-500 mb-1 px-1">{message.staffName}</p>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        message.sender === 'customer'
                          ? 'text-white rounded-br-none'
                          : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                      }`}
                      style={message.sender === 'customer' ? { backgroundColor: primaryColor } : {}}
                    >
                      {message.imageUrl && (
                        <img src={message.imageUrl} alt="Uploaded" className="max-w-full rounded-lg mb-2" />
                      )}
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 px-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm">
                    👤
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-200">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-end gap-2">
              {/* Image Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Attach image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              {/* Text Input */}
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm"
              />

              {/* Send Button */}
              <button
                onClick={sendMessage}
                disabled={!inputText.trim()}
                className="p-2 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all transform hover:scale-105"
                style={{ backgroundColor: primaryColor }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

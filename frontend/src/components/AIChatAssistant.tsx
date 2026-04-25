import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'NORMA AI Sentinel active. How can I assist your clinical workflow today?' }
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/webhook/whatsapp', {
        From: 'web-assistant',
        Body: userMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply || "Protocol execution complete. Diagnostic data updated." }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection to AI Mesh interrupted. Please retry." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl z-50 ${
          isOpen ? 'bg-zinc-900 border border-purple-500/30' : 'bg-purple-600 hover:bg-purple-700 hover:-translate-y-1'
        }`}
      >
        {isOpen ? <X className="text-purple-400" /> : <MessageSquare className="text-white" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-28 right-8 w-[400px] h-[550px] bg-white border border-gray-200 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden transition-all duration-500 z-50 transform origin-bottom-right ${
        isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'
      }`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-[#09090b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg">
              <Bot size={22} />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">AI Sentinel</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">System Active</p>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50/50 scrollbar-thin">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-purple-600 text-white font-semibold rounded-br-none' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-400 p-4 rounded-2xl rounded-bl-none border border-gray-100 flex items-center gap-2 shadow-sm">
                <Loader2 size={16} className="animate-spin text-purple-600" />
                <span className="text-[10px] font-black uppercase tracking-widest">Processing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-5 bg-white border-t border-gray-100">
          <div className="relative flex items-center gap-3">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Inquire about clinical data..."
              className="flex-1 bg-gray-100 border-none text-gray-900 px-5 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 transition-all text-sm font-medium"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-12 h-12 bg-[#09090b] text-white rounded-2xl flex items-center justify-center hover:bg-purple-600 transition-all disabled:opacity-50 shadow-md"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

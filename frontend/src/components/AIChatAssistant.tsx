import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'NORMA AI Sentinel active. High-fidelity clinical orchestration engaged. How can I assist?' }
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
      // We use the same webhook logic for consistency
      const res = await axios.post('http://localhost:5000/api/webhook/whatsapp', {
        From: 'web-terminal',
        Body: userMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply || "Clinical protocol executed. Mesh data updated." }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Neural link interrupted. Please check clinical mesh connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 shadow-2xl z-50 border ${
          isOpen ? 'bg-[#0b1326] border-[#44ddc1]/30' : 'bg-[#44ddc1] hover:bg-[#3bbfa4] border-transparent hover:-translate-y-1'
        }`}
      >
        {isOpen ? <X className="text-[#44ddc1]" /> : <MessageSquare className="text-[#00382f]" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0b1326] animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed bottom-28 right-8 w-[420px] h-[600px] glass-surface rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden z-50 border border-white/5"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 bg-[#131b2e]/80 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#44ddc1] flex items-center justify-center text-[#00382f] shadow-lg shadow-[#44ddc1]/20">
                  <Bot size={24} />
                </div>
                <div>
                  <p className="text-sm font-black text-[#dae2fd] leading-tight uppercase tracking-widest italic">Sentinel AI</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <p className="text-[9px] text-[#85948f] font-black uppercase tracking-[0.2em]">Clinical Link Active</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="bg-[#0b1326] p-2 rounded-xl text-[#85948f] hover:text-[#dae2fd] border border-white/5 transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#0b1326]/30 scrollbar-thin">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed border ${
                    msg.role === 'user' 
                      ? 'bg-[#44ddc1]/10 border-[#44ddc1]/20 text-[#dae2fd] font-medium rounded-br-none shadow-xl' 
                      : 'bg-[#171f33] border-white/5 text-[#dae2fd] rounded-bl-none shadow-2xl'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#171f33] text-[#85948f] p-5 rounded-2xl rounded-bl-none border border-white/5 flex items-center gap-3 shadow-2xl">
                    <Loader2 size={16} className="animate-spin text-[#44ddc1]" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Processing Neural Patterns...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-6 bg-[#131b2e]/50 border-t border-white/5">
              <div className="relative flex items-center gap-4">
                <div className="flex-1 relative group">
                  <Sparkles size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3c4a46] group-focus-within:text-[#44ddc1] transition-colors" />
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Authorize clinical inquiry..."
                    className="w-full bg-[#0b1326] border border-white/5 text-[#dae2fd] pl-12 pr-6 py-4 rounded-2xl outline-none focus:border-[#44ddc1]/30 transition-all text-xs font-bold uppercase tracking-widest placeholder-[#3c4a46]"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="w-14 h-14 bg-[#44ddc1] text-[#00382f] rounded-2xl flex items-center justify-center hover:bg-[#3bbfa4] transition-all disabled:opacity-30 shadow-2xl shadow-[#44ddc1]/20 active:scale-95"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

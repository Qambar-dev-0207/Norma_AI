import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, User, Clock, AlertCircle, CheckCircle2, 
  Search, Filter, ChevronRight, Phone, Calendar, 
  ShieldCheck, BrainCircuit, ArrowUpRight, Send, Loader2, X, Sparkles
} from 'lucide-react';
import { cn } from '../utils/cn';

export default function Inbox() {
  const [threads, setThreads] = useState<any[]>([]);
  const [activeThread, setActiveThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchThreads = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/messages/threads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setThreads(res.data);
      if (res.data.length > 0 && !activeThread) {
        setActiveThread(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to sync threads', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (phone: string) => {
    setMsgLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/messages/${phone}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setMsgLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
    const interval = setInterval(fetchThreads, 10000); // Polling for "Live" feel
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeThread) {
      fetchMessages(activeThread._id);
    }
  }, [activeThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeThread) return;

    const text = input.trim();
    setInput('');
    
    // Optimistic Update
    const tempMsg = { content: text, direction: 'outbound', timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const token = localStorage.getItem('token');
      // Simulate sending via backend (which triggers Twilio)
      await axios.post('http://localhost:5000/api/messages/webhook/whatsapp', 
        new URLSearchParams({ From: `whatsapp:${activeThread._id}`, Body: text }),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMessages(activeThread._id);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="nm-luxury p-12 rounded-[3rem] animate-pulse">
          <Loader2 className="animate-spin text-purple-600" size={40} />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-8"
    >
      {/* Left Pane: Threads List */}
      <div className="w-full lg:w-1/3 h-full nm-luxury rounded-[3rem] border border-white flex flex-col overflow-hidden bg-white/40 glass">
        <div className="p-8 border-b border-slate-100 bg-white/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic flex items-center gap-3">
              <MessageSquare size={24} className="text-purple-600" />
              Inbox
            </h2>
            {threads.filter(t => t.unread_count > 0).length > 0 && (
              <div className="bg-purple-100 text-purple-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest animate-bounce">
                {threads.filter(t => t.unread_count > 0).length} New
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 bg-white/60 px-5 py-3 rounded-[1.5rem] border border-white focus-within:border-purple-200 focus-within:ring-4 focus-within:ring-purple-500/5 transition-all">
            <Search size={16} className="text-slate-400" />
            <input type="text" placeholder="Search conversations..." className="bg-transparent border-none outline-none text-sm w-full text-slate-700 font-medium placeholder-slate-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {threads.length > 0 ? threads.map(thread => (
            <motion.div 
              key={thread._id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveThread(thread)}
              className={cn(
                "p-5 rounded-[2rem] cursor-pointer transition-all duration-300 border border-transparent group",
                activeThread?._id === thread._id ? "bg-white shadow-xl shadow-purple-500/5 border-white" : "hover:bg-white/50"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-[10px] font-black text-white shadow-lg group-hover:scale-110 transition-transform">
                      {thread.patient_name.split(' ').map((n: any) => n[0]).join('')}
                    </div>
                    {thread.unread_count > 0 && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-purple-500 rounded-full border-2 border-white animate-pulse" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 leading-none">{thread.patient_name}</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{thread._id}</p>
                  </div>
                </div>
                <span className="text-[9px] font-black text-slate-300 uppercase">{new Date(thread.last_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-3 pl-13 opacity-70 italic">"{thread.last_message}"</p>
            </motion.div>
          )) : (
            <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale scale-75">
               <Sparkles size={64} className="text-slate-300 mb-4" />
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">No active clinical<br />threads identified</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: Conversation & AI Actions */}
      <div className="flex-1 h-full nm-luxury rounded-[3rem] border border-white flex flex-col overflow-hidden bg-white/60 glass relative">
        
        {activeThread ? (
          <>
            {/* Chat Header */}
            <div className="p-8 border-b border-slate-100 bg-white/80 flex justify-between items-center z-10 relative">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-[1.5rem] nm-inset bg-white flex items-center justify-center text-lg font-black text-purple-600">
                  {activeThread.patient_name.split(' ').map((n: any) => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">{activeThread.patient_name}</h2>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> 
                    Real-time Sync Active
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                 <button className="nm-button-luxury w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 hover:text-purple-600 transition-all"><Phone size={20} /></button>
                 <button className="nm-button-luxury w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 hover:text-purple-600 transition-all"><User size={20} /></button>
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-10 space-y-8 z-10 scrollbar-thin relative">
              <div className="flex justify-center mb-12">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] bg-white/50 px-6 py-2.5 rounded-full border border-white shadow-sm">
                   Clinical Communication Protocol Active
                </span>
              </div>

              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div 
                    key={msg._id || i}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                      "flex items-end gap-4",
                      msg.direction === 'outbound' ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.direction === 'inbound' && (
                       <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-[10px] font-black text-purple-400 shadow-xl flex-shrink-0">
                          {activeThread.patient_name[0]}
                       </div>
                    )}
                    <div className={cn(
                      "max-w-[70%] p-6 rounded-[2.2rem] shadow-xl transition-all hover:scale-[1.02]",
                      msg.direction === 'outbound' 
                        ? "bg-zinc-900 text-white rounded-br-md shadow-zinc-900/10" 
                        : "bg-white text-slate-700 rounded-bl-md border border-slate-100 shadow-purple-500/5"
                    )}>
                      <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                      <span className={cn(
                        "text-[9px] font-black uppercase mt-3 block tracking-widest opacity-40",
                        msg.direction === 'outbound' ? "text-right" : "text-left"
                      )}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-8 bg-white/80 border-t border-slate-100 z-10">
              <form onSubmit={handleSend} className="flex items-center gap-5 bg-slate-50/50 p-2.5 rounded-[2.5rem] border border-white focus-within:bg-white focus-within:ring-4 focus-within:ring-purple-500/5 transition-all duration-700 shadow-inner">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a clinical response..." 
                  className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-800 px-8 placeholder-slate-300" 
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="w-14 h-14 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-purple-600 transition-all shadow-xl shadow-zinc-900/20 active:scale-95 disabled:opacity-30 group"
                >
                  <Send size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center space-y-6">
             <div className="nm-flat p-10 rounded-[3rem] text-slate-200">
                <MessageSquare size={64} />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Select a node to establish communication</p>
          </div>
        )}

        {/* Ethereal Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-200/10 blur-[120px] rounded-full pointer-events-none" />
      </div>
    </motion.div>
  );
}

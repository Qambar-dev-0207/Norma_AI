import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Globe, Database, Cpu, Lock, 
  RefreshCw, Terminal, Activity, MoreVertical,
  CheckCircle2, Sparkles, Send, Loader2, Command, Search, Bell, Sun
} from 'lucide-react';
import { cn } from '../utils/cn';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Admin telemetry sync failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  const systemMetrics = [
    { label: 'CLOUD LATENCY', value: '14ms', status: 'OPTIMAL', icon: Globe, color: 'text-black' },
    { label: 'DATABASE HEALTH', value: '99.9%', status: 'SYNCED', icon: Database, color: 'text-[#7c3aed]' },
    { label: 'NEURAL ENGINE', value: 'Active', status: 'PROTOCOL 2.5', icon: Cpu, color: 'text-black' },
    { label: 'SECURITY MESH', value: 'Encrypted', status: 'AES-256', icon: Shield, color: 'text-[#7c3aed]' },
  ];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-black" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-[1500px] mx-auto space-y-20 animate-in fade-in duration-700 relative pt-4">
      
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-8 py-3.5 rounded-xl flex items-center gap-3 shadow-2xl font-black uppercase tracking-widest text-[10px]"
          >
            <Activity size={16} className="text-[#7c3aed]" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Header - Exact Image Match */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 rounded-full bg-[#7c3aed] shadow-[0_0_8px_rgba(124,58,237,0.5)]" />
             <span className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em]">SYSTEM ADMINISTRATOR PRIVILEGES ACTIVE</span>
          </div>
          <h1 className="text-8xl font-black text-black tracking-tighter uppercase italic leading-[0.85]">SYSTEM CONTROL</h1>
          <p className="text-zinc-500 font-bold text-xl italic">Master orchestration of the clinical network and neural nodes.</p>
        </div>
        
        <div className="flex items-center gap-10">
           <button onClick={() => showToast('Protocol: Node Reset Initialized')} className="flex items-center gap-4 text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em] hover:text-[#7c3aed] transition-all group">
              <RefreshCw size={20} className="text-[#7c3aed] group-hover:rotate-180 transition-transform duration-700" />
              REBOOT NODES
           </button>
           <button className="bg-[#0b1326] text-white px-14 py-7 rounded-[1.8rem] text-[12px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-[#7c3aed] transition-all active:scale-95 flex items-center gap-6">
              <Send size={20} className="text-[#7c3aed]" />
              OPEN CONSOLE
           </button>
        </div>
      </header>

      {/* SOTA Metrics Row - Exact Image Style */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {systemMetrics.map((m, i) => (
          <div 
            key={i}
            className="bg-white p-14 aspect-square flex flex-col justify-between relative overflow-hidden group rounded-[3.5rem] border-2 border-zinc-50 shadow-sm hover:border-[#7c3aed]/20 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="w-20 h-20 rounded-[2rem] bg-zinc-50 flex items-center justify-center transition-all group-hover:bg-black group-hover:text-white group-hover:shadow-xl">
                 <m.icon size={36} className={m.color} />
              </div>
              <span className="px-5 py-2 bg-zinc-50 text-zinc-400 text-[10px] font-black uppercase tracking-widest border border-zinc-100 rounded-xl group-hover:text-[#7c3aed] group-hover:bg-[#7c3aed]/5 transition-all">
                {m.status}
              </span>
            </div>
            
            <div className="space-y-4">
              <p className="text-[13px] font-black text-zinc-400 uppercase tracking-[0.4em] leading-none">{m.label}</p>
              <p className="text-7xl font-black text-black tracking-tighter leading-none">{m.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Floating Chat Icon - Exact Image Match */}
      <div className="fixed bottom-12 right-12 z-[100]">
         <div className="relative group">
            <button className="w-20 h-20 rounded-[1.8rem] bg-[#7c3aed] text-white flex items-center justify-center shadow-2xl shadow-violet-500/40 hover:scale-110 transition-all active:scale-95">
               <MessageSquare size={32} />
            </button>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-4 border-white animate-pulse" />
         </div>
      </div>
    </div>
  );
}

function MessageSquare({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Globe, Database, Cpu, Lock, 
  RefreshCw, Terminal, Activity, MoreVertical,
  CheckCircle2, Sparkles, Send, Loader2
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
    { label: 'Cloud Latency', value: '14ms', status: 'Optimal', icon: Globe, color: 'text-black' },
    { label: 'Database Health', value: '99.9%', status: 'Synced', icon: Database, color: 'text-[#7c3aed]' },
    { label: 'Neural Engine', value: 'Active', status: 'Core v3.0', icon: Cpu, color: 'text-black' },
    { label: 'Security Mesh', value: 'Protected', status: 'AES-512', icon: Shield, color: 'text-[#7c3aed]' },
  ];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-black" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-700 relative">
      
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

      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" />
             <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">Administrative Authority Active</span>
          </div>
          <h1 className="text-6xl font-black text-black tracking-tighter uppercase leading-none">System Control</h1>
          <p className="text-zinc-500 font-bold text-lg opacity-80">Orchestrating clinical neural nodes and distributed infrastructure.</p>
        </div>
        
        <div className="flex items-center gap-6">
           <button onClick={() => showToast('Protocol: Node Reset Initialized')} className="flex items-center gap-3 px-6 py-4 rounded-xl border border-zinc-200 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all">
              <RefreshCw size={16} className="text-[#7c3aed]" />
              Reset Nodes
           </button>
           <button className="bg-black text-white px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7c3aed] transition-all active:scale-95 flex items-center gap-4">
              <Terminal size={16} />
              Open Console
           </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {systemMetrics.map((m, i) => (
          <div 
            key={i}
            className="bg-white p-10 border-2 border-zinc-50 flex flex-col justify-between aspect-square rounded-[2rem] hover:border-[#7c3aed]/20 transition-all group"
          >
            <div className="flex justify-between items-start">
              <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                 <m.icon size={28} className={m.color} />
              </div>
              <span className="px-3 py-1 bg-zinc-50 text-black text-[9px] font-black uppercase tracking-widest border border-zinc-100">
                {m.status}
              </span>
            </div>
            
            <div className="space-y-2">
              <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.3em]">{m.label}</p>
              <p className="text-5xl font-black text-black tracking-tighter leading-none">{m.value}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-black text-white p-10 rounded-[2.5rem] relative overflow-hidden">
            <div className="relative z-10">
               <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">Neural Activity</h3>
               <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">Node Alpha Response Mesh</p>
               
               <div className="space-y-4">
                  {[
                    { node: 'Core Sentinel', status: 'Online', load: '14%' },
                    { node: 'Identity Node', status: 'Online', load: '32%' },
                    { node: 'Sync Relay', status: 'Optimizing', load: '8%' },
                  ].map((node, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-zinc-900 rounded-2xl border border-white/5">
                       <span className="text-sm font-black uppercase italic">{node.node}</span>
                       <div className="flex items-center gap-8">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Load: {node.load}</span>
                          <span className="text-[10px] font-black text-[#7c3aed] uppercase tracking-widest animate-pulse">{node.status}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            <div className="absolute top-0 right-0 p-12 opacity-10">
               <Sparkles size={180} />
            </div>
         </div>

         <div className="bg-[#7c3aed] text-white p-10 rounded-[2.5rem] flex flex-col justify-between">
            <div>
               <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 italic leading-none">Security<br />Integrity</h3>
               <p className="text-white/60 text-xs font-bold leading-relaxed">Automatic quantum-safe rotation completed 2h ago. All nodes synchronized.</p>
            </div>
            <button onClick={() => showToast('Full System Audit Initiated')} className="w-full bg-white text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
               Run Full Audit
            </button>
         </div>
      </div>

    </div>
  );
}

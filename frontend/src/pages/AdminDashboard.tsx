import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Users, Building2, Activity, Database, Key, 
  AlertTriangle, Server, ChevronRight, Search, Cpu, 
  Zap, Globe, ShieldCheck, HardDrive, RefreshCw, 
  Terminal, Lock, Fingerprint, Network, MoreVertical,
  ShieldAlert, CheckCircle2, CloudLightning, Cpu as Brain
} from 'lucide-react';
import { cn } from '../utils/cn';

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
  }
};

const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  }
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    { label: 'Network Latency', value: '14ms', status: 'Optimal', icon: Globe, color: 'text-emerald-400' },
    { label: 'Mesh Integrity', value: '99.9%', status: 'Synced', icon: Database, color: 'text-[#44ddc1]' },
    { label: 'Sentinel Core', value: 'Active', status: 'v2.6', icon: Brain, color: 'text-blue-400' },
    { label: 'Clinical Shield', value: 'Secured', status: 'E2EE', icon: ShieldCheck, color: 'text-[#44ddc1]' },
  ];

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0b1326]">
        <motion.div animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 3 }} className="glass-surface p-20 rounded-full relative border border-[#44ddc1]/20">
           <div className="absolute inset-0 blur-3xl bg-[#44ddc1]/10 rounded-full" />
           <Server className="text-[#44ddc1] relative z-10" size={64} />
        </motion.div>
        <p className="mt-12 text-[10px] font-black uppercase tracking-[0.5em] text-[#85948f] animate-pulse italic">Establishing Root Uplink</p>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-[1600px] mx-auto space-y-12 pb-20 px-4 font-premium">
      {/* Admin Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-[#44ddc1]/5 border border-[#44ddc1]/20">
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
             <span className="text-[10px] font-black text-[#44ddc1] uppercase tracking-[0.4em]">Root Administrator Authorized</span>
          </div>
          <h1 className="text-6xl font-black text-[#dae2fd] tracking-tighter uppercase italic leading-none">System Control</h1>
          <p className="text-[#85948f] font-medium text-xl italic max-w-2xl leading-relaxed">High-fidelity orchestration of clinical neural nodes and distributed infrastructure.</p>
        </div>
        
        <div className="flex gap-6">
           <button className="glass-surface px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-[#85948f] flex items-center gap-4 hover:text-[#44ddc1] border border-white/5 transition-all">
              <RefreshCw size={18} className="text-[#44ddc1]" />
              Reset Nodes
           </button>
           <button className="bg-[#44ddc1] text-[#00382f] px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-[#44ddc1]/20 hover:shadow-[#44ddc1]/40 transition-all flex items-center gap-5">
              <Terminal size={18} />
              System Console
           </button>
        </div>
      </header>

      {/* Metrics Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {systemMetrics.map((m, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="glass-surface p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group cursor-default"
          >
            <div className="flex justify-between items-start mb-10">
              <div className={cn("p-4 rounded-xl bg-[#0b1326] border border-white/5 shadow-inner transition-transform group-hover:scale-110 duration-700", m.color)}>
                 <m.icon size={28} />
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/5 border border-emerald-400/20 px-3 py-1 rounded-lg uppercase tracking-widest">{m.status}</span>
                 <p className="text-[8px] font-black text-[#3c4a46] uppercase tracking-widest mt-3 italic">Metric v2.6</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#85948f] uppercase tracking-[0.4em] mb-3 leading-none opacity-60">{m.label}</p>
              <p className="text-4xl font-black text-[#dae2fd] tracking-tighter italic">{m.value}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Node Map */}
        <div className="lg:col-span-8 space-y-8">
           <div className="glass-surface p-12 rounded-[3.5rem] border border-white/5 relative overflow-hidden bg-[#131b2e]/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-10">
                 <div className="flex items-center gap-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#0b1326] flex items-center justify-center text-[#44ddc1] shadow-2xl border border-[#44ddc1]/10">
                       <Network size={32} />
                    </div>
                    <div>
                       <h2 className="text-3xl font-black text-[#dae2fd] tracking-tighter uppercase leading-none italic">Distributed Nodes</h2>
                       <p className="text-[10px] text-[#85948f] font-black uppercase tracking-[0.4em] mt-3 italic">Clinical Ingestion Mesh Node Alpha</p>
                    </div>
                 </div>
                 <div className="flex p-2 bg-[#0b1326] rounded-2xl gap-1 border border-white/5">
                    {['Active', 'Offline', 'Audit'].map(tab => (
                      <button key={tab} className={cn("px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500", tab === 'Active' ? "bg-[#131b2e] text-[#44ddc1] shadow-xl border border-[#44ddc1]/10" : "text-[#3c4a46] hover:text-[#85948f]")}>
                        {tab}
                      </button>
                    ))}
                 </div>
              </div>
              
              <div className="space-y-6">
                {[
                  { name: 'Core Sentinel (Primary)', location: 'Cloud Mesh', load: '12%', status: 'Optimal', icon: Brain },
                  { name: 'Identity Resolver (Edge)', location: 'Secure Node DX-2', load: '45%', status: 'Thinking', icon: Fingerprint },
                  { name: 'Global Database Cluster', location: 'Distributed M-8', load: '8%', status: 'Synced', icon: HardDrive },
                  { name: 'Omnichannel Webhook', location: 'Secure Tunnel', load: '22%', status: 'Listening', icon: Zap },
                ].map((node, i) => (
                  <motion.div key={i} whileHover={{ x: 10 }} className="flex items-center justify-between p-8 rounded-[2rem] bg-[#0b1326]/50 border border-white/5 hover:bg-[#131b2e] hover:border-[#44ddc1]/20 transition-all duration-700 group cursor-default">
                    <div className="flex items-center gap-8">
                       <div className="w-14 h-14 rounded-xl bg-[#131b2e] border border-white/5 flex items-center justify-center text-[#44ddc1] group-hover:scale-110 transition-transform duration-700 shadow-xl">
                          <node.icon size={24} />
                       </div>
                       <div>
                          <p className="text-xl font-black text-[#dae2fd] tracking-tighter uppercase italic">{node.name}</p>
                          <p className="text-[10px] font-black text-[#3c4a46] uppercase tracking-widest mt-2">{node.location}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-12">
                       <div className="text-right">
                          <p className="text-[9px] font-black text-[#3c4a46] uppercase tracking-widest mb-1">Vector Load</p>
                          <p className="text-lg font-black text-[#85948f] italic">{node.load}</p>
                       </div>
                       <div className={cn("px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border", node.status === 'Optimal' ? 'bg-emerald-400/5 border-emerald-400/20 text-emerald-400' : 'bg-amber-400/5 border-amber-400/20 text-amber-400 animate-pulse')}>
                          {node.status}
                       </div>
                       <button className="p-3 rounded-xl text-[#3c4a46] hover:text-[#44ddc1] transition-all">
                          <MoreVertical size={20} />
                       </button>
                    </div>
                  </motion.div>
                ))}
              </div>
           </div>
        </div>

        {/* Security Hub */}
        <div className="lg:col-span-4 space-y-8">
           <motion.div variants={itemVariants} className="glass-surface p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden group bg-[#131b2e] text-[#dae2fd]">
              <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:rotate-45 transition-transform duration-1000 text-[#44ddc1]">
                 <Shield size={200} />
              </div>
              <h2 className="text-2xl font-black tracking-tighter uppercase mb-12 flex items-center gap-5 italic leading-none relative z-10">
                 <Lock size={28} className="text-[#44ddc1] shadow-2xl" />
                 Security Hub
              </h2>
              
              <div className="space-y-10 relative z-10">
                 {[
                   { label: 'Role Authority', detail: 'RBAC Enabled v2', icon: Users, color: 'text-blue-400' },
                   { label: 'Digital Fingerprint', detail: 'E2EE Ingestion', icon: Fingerprint, color: 'text-[#44ddc1]' },
                   { label: 'Encryption Node', detail: 'Root Rotated 4h ago', icon: Key, color: 'text-emerald-400' },
                 ].map((item, i) => (
                   <div key={i} className="flex gap-6 group/item hover:translate-x-2 transition-transform duration-700">
                      <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#3c4a46] group-hover/item:text-[#44ddc1] transition-colors duration-500">
                         <item.icon size={24} className={item.color} />
                      </div>
                      <div className="pt-1">
                         <p className="text-[9px] font-black text-[#3c4a46] uppercase tracking-[0.3em] mb-2">{item.label}</p>
                         <p className="text-base font-black tracking-tight italic text-[#dae2fd] opacity-90">{item.detail}</p>
                      </div>
                   </div>
                 ))}
              </div>
              
              <button className="w-full mt-16 py-6 rounded-2xl bg-[#dae2fd] text-[#0b1326] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[#44ddc1] transition-all duration-700 shadow-2xl relative z-10">
                 Full Security Audit
              </button>
           </motion.div>

           {/* Compliance */}
           <motion.div variants={itemVariants} className="glass-surface p-10 rounded-[3rem] border border-[#44ddc1]/20 shadow-2xl relative overflow-hidden text-center group bg-[#44ddc1]/5">
              <div className="mx-auto w-20 h-24 rounded-2xl bg-[#44ddc1] flex items-center justify-center text-[#00382f] shadow-2xl shadow-[#44ddc1]/30 mb-8 group-hover:rotate-12 transition-transform duration-1000">
                 <ShieldCheck size={40} />
              </div>
              <h3 className="text-3xl font-black text-[#dae2fd] uppercase tracking-tighter mb-5 italic italic">Clinical Rank</h3>
              <p className="text-sm text-[#85948f] font-medium leading-relaxed italic mb-10 px-4">"Norma AI exceeds clinical data safety standards in the current session cycle."</p>
              <div className="flex flex-wrap justify-center gap-4 text-[9px] font-black text-[#44ddc1] uppercase tracking-[0.3em]">
                 <span className="flex items-center gap-2 px-3 py-1.5 bg-[#44ddc1]/10 rounded-lg border border-[#44ddc1]/20"><CheckCircle2 size={12} /> HIPAA</span>
                 <span className="flex items-center gap-2 px-3 py-1.5 bg-[#44ddc1]/10 rounded-lg border border-[#44ddc1]/20"><CheckCircle2 size={12} /> GDPR</span>
                 <span className="flex items-center gap-2 px-3 py-1.5 bg-[#44ddc1]/10 rounded-lg border border-[#44ddc1]/20"><CheckCircle2 size={12} /> HL7</span>
              </div>
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

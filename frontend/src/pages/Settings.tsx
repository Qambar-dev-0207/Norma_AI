import { motion } from 'framer-motion';
import { 
  Settings2, User, Shield, Bell, Database, Key, 
  Smartphone, Monitor, Activity, CheckCircle2, ChevronRight
} from 'lucide-react';
import { cn } from '../utils/cn';

export default function Settings() {
  const sections = [
    {
      title: "Clinical Identity",
      icon: User,
      items: [
        { label: "Profile Information", desc: "Update your medical credentials and personal details." },
        { label: "Professional Preferences", desc: "Manage specialties and working hours." },
      ]
    },
    {
      title: "System & Security",
      icon: Shield,
      items: [
        { label: "Authentication", desc: "Manage passwords, 2FA, and active sessions." },
        { label: "Data Compliance", desc: "HIPAA and GDPR compliance settings." },
      ]
    },
    {
      title: "Neural Engine",
      icon: Activity,
      items: [
        { label: "Autonomous Behaviors", desc: "Configure how AI handles scheduling and replies." },
        { label: "Alert Thresholds", desc: "Set sensitivity for clinical anomalies." },
      ]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-5xl mx-auto space-y-12 pb-32"
    >
      <header className="space-y-3">
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">Configuration</h1>
        <p className="text-slate-500 font-medium text-lg">Manage your clinical identity and system parameters.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Left Side: Navigation Links */}
        <div className="md:col-span-4 space-y-3">
          {sections.map((section, i) => (
            <button 
              key={i}
              className={cn(
                "w-full flex items-center gap-4 p-5 rounded-[2rem] transition-all duration-300 text-left font-black uppercase tracking-widest text-[10px]",
                i === 0 ? "bg-zinc-900 text-white shadow-xl shadow-zinc-900/10" : "bg-white text-slate-500 hover:bg-purple-50 hover:text-purple-600 border border-white"
              )}
            >
              <section.icon size={18} className={i === 0 ? "text-purple-400" : ""} />
              {section.title}
            </button>
          ))}
        </div>

        {/* Right Side: Active Settings Panel */}
        <div className="md:col-span-8 space-y-8">
          <div className="nm-luxury rounded-[3.5rem] p-10 bg-white/60 glass border border-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
               <Settings2 size={150} className="text-purple-600" />
            </div>

            <div className="relative z-10 mb-12">
               <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Clinical Identity</h2>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Manage your core credentials</p>
            </div>

            <div className="space-y-8 relative z-10">
              {/* Profile Card */}
              <div className="flex items-center gap-8 p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100">
                <div className="w-24 h-24 rounded-[2rem] bg-zinc-900 border-4 border-white shadow-2xl overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=sarah" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Dr. Sarah Connor</h3>
                  <p className="text-xs text-slate-500 font-bold mb-4">Lead Consultant • Cardiology</p>
                  <button className="nm-button-luxury px-6 py-2.5 rounded-xl text-[10px] font-black text-purple-600 uppercase tracking-widest">Update Photo</button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Full Name</label>
                  <input type="text" defaultValue="Dr. Sarah Connor" className="w-full bg-white border border-slate-100 text-slate-800 px-6 py-4 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-purple-500/10 font-bold text-sm shadow-sm" />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Contact Node</label>
                  <input type="email" defaultValue="sarah.c@norma.ai" className="w-full bg-white border border-slate-100 text-slate-800 px-6 py-4 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-purple-500/10 font-bold text-sm shadow-sm" />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button className="bg-zinc-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-purple-600 transition-all shadow-xl shadow-zinc-900/10 active:scale-95">Save Configuration</button>
              </div>
            </div>
          </div>

          <div className="nm-luxury rounded-[3.5rem] p-10 bg-purple-600 text-white relative overflow-hidden flex items-center justify-between group cursor-pointer">
             <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             <div className="relative z-10">
                <h3 className="text-lg font-black uppercase tracking-tight italic mb-1 flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-purple-300" />
                  System Up to Date
                </h3>
                <p className="text-xs text-purple-200 font-medium">Running Norma AI v2.5.0 Stable Release</p>
             </div>
             <ChevronRight size={24} className="relative z-10 text-purple-300 group-hover:translate-x-2 transition-transform" />
          </div>
        </div>

      </div>
    </motion.div>
  );
}

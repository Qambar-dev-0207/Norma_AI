import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AIChatAssistant from '../components/AIChatAssistant';
import { Bell, Search, HelpCircle, User, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Layout() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-[#0b1326] text-[#dae2fd] font-premium overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative px-6 py-6 overflow-hidden">
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-surface h-24 rounded-[2.5rem] flex items-center justify-between px-10 mb-6 shadow-2xl border border-white/5"
        >
          <div className="flex items-center gap-5 bg-[#0b1326]/50 px-6 py-3 rounded-2xl border border-[#3c4a46]/20 shadow-inner w-[450px] group focus-within:bg-[#0b1326] transition-all">
            <Search size={18} className="text-[#3c4a46] group-focus-within:text-[#44ddc1]" />
            <input 
              type="text" 
              placeholder="Search clinical registry or schedule..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder-[#3c4a46] text-[#dae2fd] font-medium"
            />
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <button className="bg-[#171f33] border border-[#3c4a46]/20 w-12 h-12 rounded-xl flex items-center justify-center text-[#85948f] hover:text-[#44ddc1] transition-all relative shadow-xl">
                <Bell size={20} />
                <span className="absolute top-3 right-3 w-2 h-2 bg-[#44ddc1] rounded-full shadow-[0_0_8px_rgba(68,221,193,0.5)]" />
              </button>
              <button className="bg-[#171f33] border border-[#3c4a46]/20 w-12 h-12 rounded-xl flex items-center justify-center text-[#85948f] hover:text-[#44ddc1] transition-all shadow-xl">
                <SettingsIcon size={20} />
              </button>
            </div>
            
            <div className="h-10 w-[1px] bg-[#3c4a46]/20" />
            
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="text-right">
                <p className="text-sm font-bold text-[#dae2fd] group-hover:text-[#44ddc1] transition-colors">Dr. Sarah Connor</p>
                <p className="text-[10px] text-[#85948f] font-bold uppercase tracking-wider">Clinical Admin</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#171f33] border border-[#44ddc1]/30 flex items-center justify-center text-[#44ddc1] shadow-2xl group-hover:scale-105 transition-all">
                <User size={24} />
              </div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
          <Outlet />
        </main>
      </div>

      <AIChatAssistant />

      {/* Deep Space Decorative Elements */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#44ddc1]/5 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-[#7c3aed]/5 blur-[100px] rounded-full -z-10" />
    </div>
  );
}

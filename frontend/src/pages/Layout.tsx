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
    <div className="flex h-screen bg-[#f0f2f5] text-slate-800 font-premium overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative px-6 py-6 overflow-hidden">
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass h-24 rounded-[2.5rem] flex items-center justify-between px-10 mb-6 shadow-sm border border-white"
        >
          <div className="flex items-center gap-5 bg-white/50 px-6 py-3 rounded-2xl border border-white shadow-inner w-[450px] group focus-within:bg-white transition-all">
            <Search size={18} className="text-slate-300 group-focus-within:text-purple-500" />
            <input 
              type="text" 
              placeholder="Search for patients or appointments..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder-slate-300 text-slate-600 font-medium"
            />
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <button className="nm-button w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 hover:text-purple-600 transition-all relative">
                <Bell size={20} />
                <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
              </button>
              <button className="nm-button w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 hover:text-purple-600 transition-all">
                <SettingsIcon size={20} />
              </button>
            </div>
            
            <div className="h-10 w-[1px] bg-slate-200" />
            
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800 group-hover:text-purple-600 transition-colors">Dr. Sarah Connor</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hospital Admin</p>
              </div>
              <div className="w-12 h-12 rounded-2xl nm-flat-sm flex items-center justify-center text-purple-600 border border-white group-hover:scale-105 transition-all">
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

      {/* Subtle Background Decorative Blobs */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-200/20 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-blue-200/10 blur-[100px] rounded-full -z-10" />
    </div>
  );
}

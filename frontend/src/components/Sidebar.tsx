import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, UploadCloud, Settings, LogOut, Shield, Heart, Info, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const location = useLocation();
  const role = localStorage.getItem('role') || 'doctor';

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Overview', roles: ['doctor', 'receptionist'] },
    { path: '/admin-dashboard', icon: Shield, label: 'Admin Command', roles: ['admin'] },
    { path: '/inbox', icon: MessageSquare, label: 'Inbox', roles: ['doctor', 'receptionist', 'admin'] },
    { path: '/appointments', icon: Calendar, label: 'Schedule', roles: ['admin', 'doctor', 'receptionist'] },
    { path: '/patients', icon: Users, label: 'Patients', roles: ['admin', 'doctor', 'receptionist'] },
    { path: '/bulk-upload', icon: UploadCloud, label: 'Add Data', roles: ['admin', 'doctor'] },
    { path: '/settings', icon: Settings, label: 'Settings', roles: ['admin', 'doctor', 'receptionist'] },
  ];

  return (
    <div className="w-72 h-screen flex flex-col p-6 z-20 relative bg-[#0b1326]">
      <div className="glass-surface rounded-[2.5rem] flex-1 flex flex-col overflow-hidden border border-white/10">
        <div className="p-8 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#44ddc1] flex items-center justify-center text-[#00382f] shadow-lg shadow-[#44ddc1]/20">
              <Heart size={22} fill="currentColor" />
            </div>
            <h1 className="text-xl font-black text-[#dae2fd] tracking-tight font-premium uppercase italic">Norma</h1>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 scrollbar-thin">
          <nav className="space-y-3">
            {menuItems.filter(item => item.roles.includes(role)).map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className="block group"
                >
                  <motion.div 
                    whileHover={{ x: 5 }}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 relative ${
                      isActive 
                        ? 'bg-[#171f33] text-[#44ddc1] font-bold shadow-inner' 
                        : 'text-[#85948f] hover:text-[#dae2fd]'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-[#44ddc1]' : 'text-[#3c4a46] group-hover:text-[#44ddc1]'} />
                    <span className="text-sm tracking-tight">{item.label}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="activePill"
                        className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#44ddc1] shadow-[0_0_8px_rgba(68,221,193,0.5)]" 
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-6 border-t border-white/5">
          <Link 
            to="/" 
            onClick={() => { localStorage.clear(); }}
            className="flex items-center justify-center gap-3 px-5 py-4 text-[#85948f] hover:bg-red-500/10 hover:text-red-400 rounded-2xl transition-all group"
          >
            <LogOut size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
          </Link>
        </div>
      </div>

      <div className="mt-6 px-4 flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity">
        <Info size={14} className="text-[#85948f]" />
        <p className="text-[9px] font-bold text-[#85948f] uppercase tracking-widest">Sentinel v2.6.0 Stable</p>
      </div>
    </div>
  );
}

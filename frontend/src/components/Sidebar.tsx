import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, UploadCloud, Settings, LogOut, Shield, Heart, Info, MessageSquare, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const location = useLocation();
  const role = localStorage.getItem('role') || 'doctor';

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Overview', roles: ['doctor', 'receptionist'] },
    { path: '/admin-dashboard', icon: Shield, label: 'Admin Panel', roles: ['admin'] },
    { path: '/inbox', icon: MessageSquare, label: 'Inbox', roles: ['doctor', 'receptionist', 'admin'] },
    { path: '/appointments', icon: Calendar, label: 'Schedule', roles: ['admin', 'doctor', 'receptionist'] },
    { path: '/patients', icon: Users, label: 'Patients', roles: ['admin', 'doctor', 'receptionist'] },
    { path: '/doctors', icon: Stethoscope, label: 'Doctors', roles: ['admin', 'doctor', 'receptionist'] },
    { path: '/bulk-upload', icon: UploadCloud, label: 'Add Data', roles: ['admin', 'doctor'] },
    { path: '/settings', icon: Settings, label: 'Settings', roles: ['admin', 'doctor', 'receptionist'] },
  ];

  return (
    <div className="w-72 h-screen flex flex-col p-6 z-20 relative bg-black">
      <div className="flex-1 flex flex-col overflow-hidden border border-white/5 rounded-[2rem] bg-zinc-900/30 p-2">
        <div className="p-8 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#7c3aed] flex items-center justify-center text-white shadow-2xl shadow-violet-500/20">
              <Heart size={26} fill="white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Norma</h1>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 scrollbar-thin">
          <nav className="space-y-2">
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
                    whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    className={`flex items-center gap-5 px-6 py-4 rounded-xl transition-all duration-300 relative ${
                      isActive 
                        ? 'bg-[#7c3aed] text-white font-black' 
                        : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-white' : 'text-zinc-600 group-hover:text-white'} />
                    <span className="text-xs uppercase font-black tracking-widest">{item.label}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="activePill"
                        className="absolute right-4 w-1.5 h-6 rounded-full bg-white/20" 
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-6">
          <Link 
            to="/" 
            onClick={() => { localStorage.clear(); }}
            className="flex items-center justify-center gap-4 px-6 py-5 bg-black text-zinc-500 hover:text-red-500 border border-white/5 rounded-2xl transition-all group font-black uppercase tracking-widest text-[10px]"
          >
            <LogOut size={18} />
            Sign Out
          </Link>
        </div>
      </div>

      <div className="mt-6 px-4 flex items-center gap-3 opacity-30">
        <Info size={14} className="text-zinc-600" />
        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none">NORMA CORE v3.0</p>
      </div>
    </div>
  );
}

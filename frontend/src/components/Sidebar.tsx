import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, UploadCloud, Settings, LogOut, Shield, Heart, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const location = useLocation();
  const role = localStorage.getItem('role') || 'doctor';

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Overview', roles: ['doctor', 'receptionist'] },
    { path: '/admin-dashboard', icon: Shield, label: 'Settings', roles: ['admin'] },
    { path: '/appointments', icon: Calendar, label: 'Schedule', roles: ['admin', 'doctor', 'receptionist'] },
    { path: '/patients', icon: Users, label: 'Patients', roles: ['admin', 'doctor', 'receptionist'] },
    { path: '/bulk-upload', icon: UploadCloud, label: 'Add Data', roles: ['admin', 'doctor'] },
  ];

  return (
    <div className="w-72 h-screen flex flex-col p-6 z-20 relative">
      <div className="nm-flat rounded-[2.5rem] flex-1 flex flex-col overflow-hidden border border-white/40">
        <div className="p-8 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-200">
              <Heart size={22} fill="white" />
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight font-premium uppercase italic">Norma</h1>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4">
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
                        ? 'nm-inset text-purple-600 font-bold' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-purple-600' : 'text-slate-300 group-hover:text-slate-400'} />
                    <span className="text-sm tracking-tight">{item.label}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="activePill"
                        className="absolute right-4 w-1.5 h-1.5 rounded-full bg-purple-600 shadow-[0_0_8px_rgba(124,58,237,0.5)]" 
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-6 border-t border-white/50">
          <Link 
            to="/" 
            onClick={() => { localStorage.clear(); }}
            className="nm-button flex items-center justify-center gap-3 px-5 py-4 text-slate-400 hover:text-red-500 rounded-2xl transition-all group"
          >
            <LogOut size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
          </Link>
        </div>
      </div>

      <div className="mt-6 px-4 flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity">
        <Info size={14} className="text-slate-400" />
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">System v2.5.0 Stable</p>
      </div>
    </div>
  );
}

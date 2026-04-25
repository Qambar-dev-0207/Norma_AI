import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, UploadCloud, Settings, LogOut, Shield } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const role = localStorage.getItem('role') || 'doctor';

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard', roles: ['doctor', 'receptionist'] },
    { path: '/admin-dashboard', icon: Shield, label: 'Admin Command', roles: ['admin'] },
    { path: '/appointments', icon: Calendar, label: 'Appointments', roles: ['admin', 'doctor', 'receptionist'] },
    { path: '/patients', icon: Users, label: 'Patients', roles: ['admin', 'doctor', 'receptionist'] },
    { path: '/bulk-upload', icon: UploadCloud, label: 'Bulk Upload', roles: ['admin', 'doctor'] },
    { path: '/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
  ];

  return (
    <div className="w-64 bg-[#0b1326] h-screen flex flex-col border-r border-[#3c4a46]/10">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#44ddc1] text-[#00382f] p-2 rounded-md shadow-[0_0_15px_rgba(68,221,193,0.3)]">
            <span className="text-xl font-bold tracking-tighter">NA</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#dae2fd] tracking-tight">NORMA AI</h1>
            <p className="text-[10px] text-[#44ddc1] font-bold uppercase tracking-[0.2em]">Clinical Portal</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="space-y-2 px-4">
          {menuItems.filter(item => item.roles.includes(role)).map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                  isActive 
                    ? 'bg-[#171f33] text-[#44ddc1] shadow-inner' 
                    : 'text-[#85948f] hover:bg-[#131b2e] hover:text-[#dae2fd]'
                }`}
              >
                <div className={`transition-colors duration-300 ${isActive ? 'text-[#44ddc1]' : 'text-[#85948f] group-hover:text-[#44ddc1]'}`}>
                  <Icon size={20} />
                </div>
                <span className="text-sm font-semibold tracking-wide">
                  {item.label}
                </span>
                {isActive && (
                  <div className="ml-auto w-1 h-4 bg-[#44ddc1] rounded-full shadow-[0_0_8px_rgba(68,221,193,0.5)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-6 border-t border-[#3c4a46]/10">
        <Link 
          to="/" 
          onClick={() => { localStorage.clear(); }}
          className="flex items-center gap-3 px-4 py-3 text-[#85948f] hover:bg-red-500/5 hover:text-red-400 rounded-lg transition-all duration-300"
        >
          <LogOut size={20} />
          <span className="text-sm font-semibold">Logout</span>
        </Link>
      </div>
    </div>
  );
}

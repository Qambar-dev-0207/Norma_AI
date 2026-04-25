import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Bell, Search, HelpCircle, User } from 'lucide-react';

export default function Layout() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-[#0b1326] text-[#dae2fd]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-[#0b1326] border-b border-[#3c4a46]/10 h-20 flex items-center justify-between px-10">
          <div className="flex items-center gap-4 bg-[#131b2e] px-4 py-2 rounded-full border border-[#3c4a46]/10 w-96">
            <Search size={18} className="text-[#85948f]" />
            <input 
              type="text" 
              placeholder="Search patients, doctors, records..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder-[#85948f]"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="text-[#85948f] hover:text-[#44ddc1] transition-colors relative">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#44ddc1] rounded-full shadow-[0_0_8px_rgba(68,221,193,0.5)]" />
            </button>
            <button className="text-[#85948f] hover:text-[#44ddc1] transition-colors">
              <HelpCircle size={22} />
            </button>
            <div className="h-8 w-[1px] bg-[#3c4a46]/20 mx-2" />
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold tracking-tight">Dr. Sarah Connor</p>
                <p className="text-[10px] text-[#44ddc1] font-bold uppercase tracking-wider">Chief Medical Officer</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#171f33] border border-[#44ddc1]/30 flex items-center justify-center text-[#44ddc1] shadow-lg">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0b1326] p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
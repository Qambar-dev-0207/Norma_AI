import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Search, Bell, Sun, Command } from 'lucide-react';

export default function Layout() {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sharp Header */}
        <header className="h-28 flex items-center justify-between px-12 border-b border-zinc-100 bg-white z-10">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white">
                  <Command size={18} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">System Mesh</p>
                  <p className="text-sm font-black text-black uppercase tracking-tighter mt-1">NORMA CORE v3.0</p>
               </div>
            </div>

            <div className="w-[450px] bg-zinc-50 px-8 py-3.5 rounded-xl border border-zinc-200 flex items-center gap-4 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-500/5 transition-all">
               <Search size={16} className="text-zinc-400" />
               <input type="text" placeholder="Search registry..." className="bg-transparent border-none outline-none text-sm w-full font-bold text-black placeholder-zinc-300" />
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
               <button className="w-11 h-11 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-50 transition-all">
                  <Bell size={18} />
               </button>
               <button className="w-11 h-11 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-50 transition-all">
                  <Sun size={18} />
               </button>
            </div>

            <div className="flex items-center gap-5 pl-8 border-l border-zinc-100">
               <div className="text-right">
                  <p className="text-sm font-black text-black leading-none">Dr. Sarah Connor</p>
                  <p className="text-[9px] font-black text-violet-600 uppercase tracking-widest mt-1.5">Authorized Provider</p>
               </div>
               <div className="w-12 h-12 rounded-xl border-2 border-black p-0.5 overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=sarah" alt="Profile" className="w-full h-full object-cover rounded-lg" />
               </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-12 py-10 scrollbar-thin bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Shield, Zap, MessageSquare, ChevronRight, Bot, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

const ScrambleText = ({ text }: { text: string }) => {
  const [display, setDisplay] = useState('');
  const chars = '!<>-_\\/[]{}—=+*^?#________';

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(
        text.split('').map((char, index) => {
          if (index < iteration) return text[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('')
      );
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{display}</span>;
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-zinc-900 overflow-x-hidden selection:bg-purple-100 selection:text-purple-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full p-8 flex justify-between items-center z-[100] bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 text-white p-2 rounded-xl shadow-lg shadow-purple-500/20">
            <Activity size={24} />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase italic">Norma AI</span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          {['Network', 'Sentinel', 'Infrastructure', 'Security'].map(item => (
            <a key={item} href="#" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-purple-600 transition-colors">{item}</a>
          ))}
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="bg-zinc-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-purple-600 transition-all shadow-xl shadow-zinc-900/10 flex items-center gap-3"
        >
          Initialize Command <ArrowRight size={14} />
        </button>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-40 pb-32 px-10 flex flex-col items-center justify-center overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-50 rounded-full blur-[120px] -z-10 opacity-60" />
        
        <div className="max-w-5xl mx-auto text-center space-y-10 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-50 border border-purple-100 mb-4">
            <Sparkles size={14} className="text-purple-600" />
            <span className="text-[10px] font-black tracking-[0.3em] text-purple-600 uppercase">Next-Gen Clinical Protocol v2.5</span>
          </div>
          
          <h1 className="text-7xl md:text-[120px] font-black tracking-tighter leading-[0.85] text-zinc-900 uppercase">
            Clinical<br />
            <span className="text-purple-600 italic">Sentinel</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-medium leading-relaxed tracking-tight">
            The world's most advanced AI clinical orchestration system. 
            Automate patient flow, synchronize diagnostic data, and optimize care with zero friction.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12">
            <button 
              onClick={() => navigate('/login')}
              className="group bg-zinc-900 text-white px-12 py-6 rounded-[2rem] font-black tracking-widest text-xs shadow-2xl shadow-zinc-900/20 hover:bg-purple-600 hover:-translate-y-1 transition-all flex items-center gap-4"
            >
              ESTABLISH UPLINK <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-12 py-6 rounded-[2rem] border border-gray-200 font-black tracking-widest text-xs hover:bg-gray-50 transition-all flex items-center gap-3">
              VIEW ARCHITECTURE <div className="w-2 h-2 rounded-full bg-purple-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Feature Section */}
      <section className="py-40 px-10 bg-[#09090b] text-white rounded-[4rem] mx-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { icon: Zap, title: "Neural Ingestion", desc: "Process complex clinical datasets and medical histories in milliseconds with zero error rate." },
              { icon: MessageSquare, title: "Omnichannel AI", desc: "Automate patient interaction via secure WhatsApp and Web nodes with Gemini v2.5." },
              { icon: Shield, title: "Zero-Trust Security", desc: "End-to-end encrypted clinical records with multi-layered role-based authorization." }
            ].map((f, i) => (
              <div key={i} className="group space-y-8 p-10 rounded-[3rem] border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-500">
                <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all">
                  <f.icon size={32} />
                </div>
                <h3 className="text-3xl font-black tracking-tight">{f.title}</h3>
                <p className="text-gray-400 font-medium leading-relaxed text-lg">{f.desc}</p>
                <div className="pt-4 flex items-center gap-2 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em]">
                   <span>Read Documentation</span>
                   <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure Section */}
      <section className="py-40 px-10 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-10">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-zinc-900 uppercase">
              Robust<br />
              <span className="text-purple-600">Infrastructure</span>
            </h2>
            <p className="text-xl text-gray-500 font-medium leading-relaxed">
              Norma AI is built on a distributed clinical network architecture designed for 99.99% uptime and sub-10ms latency.
            </p>
            <div className="space-y-6">
              {[
                "Distributed Database Synchronization",
                "Real-time AI Sentinel Monitoring",
                "Automated Patient Registry Ingestion",
                "Scalable Multi-Node Architecture"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="font-bold text-zinc-900 tracking-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-purple-100 rounded-[3rem] rotate-3 -z-10" />
            <div className="bg-zinc-900 p-10 rounded-[3rem] shadow-2xl border border-gray-800">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sentinel_Log.sys</div>
              </div>
              <div className="space-y-4 font-mono text-sm">
                <p className="text-purple-400 font-bold underline mb-4">Initialize system_uplink...</p>
                <p className="text-gray-400"><span className="text-green-500">[OK]</span> DB_MESH CONNECTED</p>
                <p className="text-gray-400"><span className="text-green-500">[OK]</span> AI_SENTINEL_NODE ACTIVE</p>
                <p className="text-gray-400"><span className="text-green-500">[OK]</span> CRYPTO_MODULE ENABLED</p>
                <p className="text-gray-400 animate-pulse"><span className="text-purple-500">[&gt;]</span> SYNCING CLINICAL TELEMETRY...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-10 border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-900 text-white p-1.5 rounded-lg">
              <Activity size={20} />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">Norma AI</span>
          </div>
          <p className="text-[10px] font-black text-gray-400 tracking-[0.3em] uppercase">
            &copy; 2026 Norma AI Clinical Systems • Secure Medical Network
          </p>
          <div className="flex gap-8">
            {['Privacy', 'Security', 'Uptime'].map(item => (
              <a key={item} href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-purple-600 transition-all">{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, Lock, Phone, AlertCircle, ArrowRight, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('norma2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', phone);
      formData.append('password', password);

      const res = await axios.post('http://localhost:5000/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('role', res.data.role);
      
      if (res.data.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1326] relative overflow-hidden p-6 font-premium">
      {/* Deep Space Decorative Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#44ddc1]/5 blur-[120px] rounded-full -mr-32 -mt-32 -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#7c3aed]/5 blur-[120px] rounded-full -ml-32 -mb-32 -z-10" />

      <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 glass-surface rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden min-h-[700px] relative z-10">
        {/* Left Side: Clinical Sentinel Branding */}
        <div className="hidden lg:flex flex-col justify-between bg-[#131b2e]/50 p-16 relative overflow-hidden border-r border-white/5">
          <div className="absolute top-0 right-0 p-10 opacity-5">
             <Activity size={350} className="text-[#44ddc1]" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-16">
              <div className="bg-[#44ddc1] text-[#00382f] p-3 rounded-2xl shadow-2xl shadow-[#44ddc1]/20">
                <Activity size={32} />
              </div>
              <span className="text-2xl font-black text-[#dae2fd] italic tracking-tighter uppercase">NORMA AI</span>
            </div>
            
            <h2 className="text-7xl font-black text-[#dae2fd] tracking-tighter leading-[0.9] uppercase mb-10 italic">
              Clinical<br />
              <span className="text-[#44ddc1]">Sentinel</span>
            </h2>
            <p className="text-[#85948f] text-xl font-medium leading-relaxed max-w-sm">
              Global clinical mesh access enabled. Authenticate clinical terminal ID to establish secure session.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-[#131b2e] bg-[#0b1326] overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="Clinical Staff" className="opacity-80 grayscale hover:grayscale-0 transition-all cursor-crosshair" />
                </div>
              ))}
            </div>
            <p className="text-[10px] font-black text-[#85948f] uppercase tracking-[0.25em] leading-tight">
              1,240+ Active Nodes<br /><span className="text-[#44ddc1]">Secure Multi-Sync</span>
            </p>
          </div>
        </div>

        {/* Right Side: Authentication Terminal */}
        <div className="p-12 md:p-24 flex flex-col justify-center relative bg-[#0b1326]/30">
          <div className="mb-16">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-[#44ddc1]/5 border border-[#44ddc1]/20 mb-8">
              <ShieldCheck size={16} className="text-[#44ddc1]" />
              <span className="text-[10px] font-black tracking-[0.3em] text-[#44ddc1] uppercase">Authorize Session</span>
            </div>
            <h3 className="text-5xl font-black text-[#dae2fd] tracking-tighter uppercase italic leading-none">Sign In</h3>
            <p className="text-[#85948f] font-bold text-xs uppercase tracking-[0.4em] mt-4 opacity-60">Initializing clinical protocol...</p>
          </div>
          
          {error && (
            <motion.div 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl mb-10 flex items-center gap-4 text-red-400 text-sm font-bold animate-in shake duration-500"
            >
              <AlertCircle size={20} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#85948f] uppercase tracking-[0.3em] ml-2">Terminal ID (Phone)</label>
              <div className="relative group">
                <Phone size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#3c4a46] group-focus-within:text-[#44ddc1] transition-colors" />
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-clinical w-full pl-16 pr-8 py-6 rounded-[2rem] text-lg font-black tracking-tight"
                  placeholder="Enter Phone..."
                  required
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#85948f] uppercase tracking-[0.3em] ml-2">Access Key</label>
              <div className="relative group">
                <Lock size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#3c4a46] group-focus-within:text-[#44ddc1] transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-clinical w-full pl-16 pr-8 py-6 rounded-[2rem] text-lg font-black tracking-tight"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="btn-clinical w-full group relative py-8 rounded-[2rem] mt-6"
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" size={24} />
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <span className="text-xs uppercase tracking-[0.5em]">Establish Link</span>
                  <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform duration-500" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-20 text-center">
            <div className="flex items-center justify-center gap-5 opacity-20 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-1000 cursor-help group">
              <Sparkles size={18} className="group-hover:text-[#44ddc1] transition-colors" />
              <p className="text-[10px] text-[#85948f] font-black uppercase tracking-[0.5em]">Multi-Node Secure Sync</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

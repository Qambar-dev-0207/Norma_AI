import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, Lock, Phone, AlertCircle, ArrowRight, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('naorma2026');
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
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden p-6">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-100/50 blur-[120px] rounded-full -mr-32 -mt-32 -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100/30 blur-[120px] rounded-full -ml-32 -mb-32 -z-10" />

      <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden min-h-[700px]">
        {/* Left Side: Illustration/Text */}
        <div className="hidden lg:flex flex-col justify-between bg-zinc-900 p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
             <Activity size={300} className="text-purple-500" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="bg-purple-600 text-white p-2 rounded-xl">
                <Activity size={28} />
              </div>
              <span className="text-2xl font-black text-white italic tracking-tighter">NORMA AI</span>
            </div>
            
            <h2 className="text-6xl font-black text-white tracking-tighter leading-none uppercase mb-8">
              Clinical<br />
              <span className="text-purple-500">Sentinel</span>
            </h2>
            <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-sm">
              Authorized access only. Enter your clinical terminal ID and security key to establish connection.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-4 border-zinc-900 bg-gray-700 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                </div>
              ))}
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">
              850+ Clinical Nodes<br />Active in network
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-12 md:p-20 flex flex-col justify-center relative">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-100 mb-6">
              <ShieldCheck size={14} className="text-purple-600" />
              <span className="text-[10px] font-black tracking-widest text-purple-600 uppercase">Secure Portal</span>
            </div>
            <h3 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase">Sign In</h3>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">Initialize protocol session</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-8 flex items-center gap-3 text-red-500 text-sm font-bold animate-in shake duration-500">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Terminal ID (Phone)</label>
              <div className="relative group">
                <Phone size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-purple-600 transition-colors" />
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 text-zinc-900 pl-14 pr-6 py-5 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-sm shadow-inner"
                  placeholder="Enter ID..."
                  required
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Access Key</label>
              <div className="relative group">
                <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-purple-600 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 text-zinc-900 pl-14 pr-6 py-5 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-sm shadow-inner"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full group relative bg-zinc-900 text-white py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-zinc-900/20 hover:bg-purple-600 hover:-translate-y-1 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>Establish Connection <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="mt-16 text-center">
            <div className="flex items-center justify-center gap-4 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer group">
              <Sparkles size={16} className="group-hover:text-purple-600" />
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Multi-Node Sync Enabled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

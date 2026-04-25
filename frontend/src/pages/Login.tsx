import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, Lock, Phone, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-[#0b1326] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#44ddc1]/5 blur-[120px] rounded-full -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#44ddc1]/5 blur-[120px] rounded-full -ml-64 -mb-64" />

      <div className="bg-[#131b2e] p-10 rounded-3xl border border-[#3c4a46]/10 w-full max-w-md shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-[#44ddc1] text-[#00382f] p-4 rounded-2xl shadow-[0_0_30px_rgba(68,221,193,0.3)] mb-6">
            <Activity size={32} />
          </div>
          <h2 className="text-3xl font-bold text-[#dae2fd] tracking-tighter">NORMA AI</h2>
          <p className="text-[#85948f] text-sm font-medium mt-1 uppercase tracking-[0.2em]">Clinical Sentinel</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6 flex items-center gap-3 text-red-400 text-sm font-medium animate-in shake duration-500">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">Terminal ID (Phone)</label>
            <div className="relative group">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#85948f] group-focus-within:text-[#44ddc1] transition-colors" />
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] pl-12 pr-4 py-4 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all font-medium"
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">Access Key</label>
            <div className="relative group">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#85948f] group-focus-within:text-[#44ddc1] transition-colors" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] pl-12 pr-4 py-4 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all font-medium"
                placeholder="Enter password"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#44ddc1] text-[#00382f] py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(68,221,193,0.2)] hover:shadow-[0_0_30px_rgba(68,221,193,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:scale-100 mt-4 uppercase tracking-widest"
          >
            {loading ? 'Authenticating...' : 'Establish Connection'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-[#85948f] font-bold uppercase tracking-widest opacity-50">Secure Access Point 01</p>
        </div>
      </div>
    </div>
  );
}
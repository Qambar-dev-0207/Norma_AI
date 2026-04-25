import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Shield, 
  Users, 
  Building2, 
  Activity, 
  Database, 
  Key, 
  AlertTriangle,
  Server,
  ChevronRight,
  Search
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Admin data fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#44ddc1]/10 p-2 rounded-lg border border-[#44ddc1]/20">
              <Shield size={20} className="text-[#44ddc1]" />
            </div>
            <span className="text-[10px] font-bold text-[#44ddc1] uppercase tracking-[0.3em]">System Level: Root</span>
          </div>
          <h1 className="text-4xl font-bold text-[#dae2fd] tracking-tighter">Norma AI Central Command</h1>
        </div>
        
        <div className="flex items-center gap-4 bg-[#131b2e] p-2 rounded-2xl border border-[#3c4a46]/10">
          <div className="px-4 py-2">
            <p className="text-[10px] text-[#85948f] font-bold uppercase tracking-widest">Network Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#44ddc1] animate-pulse" />
              <span className="text-sm font-bold text-[#dae2fd]">Operational</span>
            </div>
          </div>
          <div className="w-[1px] h-10 bg-[#3c4a46]/20" />
          <button className="bg-[#44ddc1] text-[#00382f] px-6 py-3 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(68,221,193,0.3)]">
            System Reboot
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#131b2e] p-8 rounded-3xl border border-[#3c4a46]/10 relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 text-[#44ddc1]/5 group-hover:text-[#44ddc1]/10 transition-colors">
            <Users size={160} />
          </div>
          <p className="text-[11px] font-bold text-[#85948f] uppercase tracking-[0.2em] mb-4">Total Population</p>
          <p className="text-5xl font-bold text-[#dae2fd] tracking-tighter">{stats?.total_patients || 0}</p>
          <div className="mt-6 flex items-center gap-2 text-[#44ddc1] text-xs font-bold uppercase tracking-wider">
            <span>Manage Directory</span>
            <ChevronRight size={14} />
          </div>
        </div>

        <div className="bg-[#131b2e] p-8 rounded-3xl border border-[#3c4a46]/10 relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 text-[#9ed1c3]/5 group-hover:text-[#9ed1c3]/10 transition-colors">
            <Building2 size={160} />
          </div>
          <p className="text-[11px] font-bold text-[#85948f] uppercase tracking-[0.2em] mb-4">Node Count</p>
          <p className="text-5xl font-bold text-[#dae2fd] tracking-tighter">12</p>
          <div className="mt-6 flex items-center gap-2 text-[#9ed1c3] text-xs font-bold uppercase tracking-wider">
            <span>Clinic Infrastructure</span>
            <ChevronRight size={14} />
          </div>
        </div>

        <div className="bg-[#131b2e] p-8 rounded-3xl border border-[#3c4a46]/10 relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 text-[#44ddc1]/5 group-hover:text-[#44ddc1]/10 transition-colors">
            <Activity size={160} />
          </div>
          <p className="text-[11px] font-bold text-[#85948f] uppercase tracking-[0.2em] mb-4">AI Ingestion Flow</p>
          <p className="text-5xl font-bold text-[#dae2fd] tracking-tighter">{stats?.ai_interactions || 0}</p>
          <div className="mt-6 flex items-center gap-2 text-[#44ddc1] text-xs font-bold uppercase tracking-wider">
            <span>Audit Stream</span>
            <ChevronRight size={14} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#131b2e] rounded-3xl border border-[#3c4a46]/10 overflow-hidden">
          <div className="p-8 border-b border-[#3c4a46]/10 flex justify-between items-center bg-[#171f33]/50">
            <h2 className="text-xl font-bold text-[#dae2fd] tracking-tight flex items-center gap-3">
              <Database className="text-[#44ddc1]" />
              Infrastructure Monitoring
            </h2>
          </div>
          <div className="p-8 space-y-6">
            {[
              { label: 'Database Sync', value: '99.9%', icon: Server },
              { label: 'Auth Handshakes', value: '2.4k/hr', icon: Key },
              { label: 'Latency', value: '14ms', icon: Activity },
            ].map((node, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#0b1326] border border-[#3c4a46]/10">
                <div className="flex items-center gap-4">
                  <div className="bg-[#131b2e] p-2 rounded-lg text-[#85948f]">
                    <node.icon size={20} />
                  </div>
                  <span className="font-bold text-[#dae2fd] tracking-tight">{node.label}</span>
                </div>
                <span className="font-mono text-[#44ddc1] font-bold">{node.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#131b2e] p-8 rounded-3xl border border-[#3c4a46]/10">
          <h2 className="text-xl font-bold text-[#dae2fd] tracking-tight mb-8 flex items-center gap-3">
            <AlertTriangle className="text-yellow-500" />
            Security Audit Log
          </h2>
          <div className="space-y-6">
            {[
              { event: 'Root Access Established', user: 'norma_admin', time: '2m ago' },
              { event: 'Bulk Upload Approved', user: 'dr_connor', time: '14m ago' },
              { event: 'New Doctor Node Provisioned', user: 'receptionist_01', time: '1h ago' },
              { event: 'Failed Auth Attempt', user: 'unknown_ip', time: '3h ago', critical: true },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-[#171f33]/50 transition-colors group">
                <div className={`w-2 h-2 rounded-full mt-2 ${log.critical ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-[#44ddc1]'}`} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#dae2fd] tracking-tight">{log.event}</p>
                  <p className="text-[10px] text-[#85948f] font-bold uppercase tracking-widest mt-1">User: {log.user} • {log.time}</p>
                </div>
                <ChevronRight size={16} className="text-[#3c4a46] group-hover:text-[#44ddc1] transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

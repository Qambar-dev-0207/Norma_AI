import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Calendar, Users, MessageSquare, Clock, MoreVertical, 
  ChevronRight, Loader2, Plus, X, Stethoscope, Phone, User, 
  MapPin, Sparkles, TrendingUp, AlertCircle, Bot, Zap, ArrowRight,
  CheckCircle2, Compass, Target, Fingerprint, Waves, Cpu, ArrowUpRight,
  ShieldCheck, LayoutGrid
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { cn } from '../utils/cn';

const mockChartData = [
  { name: '8am', load: 4 },
  { name: '10am', load: 12 },
  { name: '12pm', load: 8 },
  { name: '2pm', load: 15 },
  { name: '4pm', load: 10 },
  { name: '6pm', load: 6 },
];

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAptModal, setShowAptModal] = useState(false);
  const [patientForm, setPatientForm] = useState({ full_name: '', phone_number: '', address: '', notes: '' });
  const [aptForm, setAptForm] = useState({ patient_id: '', scheduled_at: '', type: 'General Checkup' });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, aptsRes, patientsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/dashboard/stats', { headers }),
        axios.get('http://localhost:5000/api/appointments', { headers }),
        axios.get('http://localhost:5000/api/patients', { headers })
      ]);
      setStats(statsRes.data);
      setAppointments(aptsRes.data);
      setPatients(patientsRes.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/patients', patientForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowPatientModal(false);
      setPatientForm({ full_name: '', phone_number: '', address: '', notes: '' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleAddApt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/appointments', aptForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAptModal(false);
      setAptForm({ patient_id: '', scheduled_at: '', type: 'General Checkup' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0b1326]">
        <div className="glass-surface p-12 rounded-[3rem] animate-pulse border border-[#44ddc1]/20">
          <Loader2 className="animate-spin text-[#44ddc1]" size={40} />
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Today\'s Visits', value: stats?.today_appointments || 0, icon: Calendar, color: 'bg-[#44ddc1]/10 text-[#44ddc1]' },
    { label: 'Clinical Assets', value: stats?.total_patients || 0, icon: Users, color: 'bg-blue-500/10 text-blue-400' },
    { label: 'AI Node Syncs', value: stats?.ai_interactions || 0, icon: MessageSquare, color: 'bg-purple-500/10 text-purple-400' },
    { label: 'Practice Load', value: stats?.efficiency || '94%', icon: Activity, color: 'bg-emerald-500/10 text-emerald-400' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-[1600px] mx-auto space-y-8 pb-40 px-4">
      
      {/* Top Intelligence Bento Row */}
      <div className="grid grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Practice Analytics */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {statCards.map((stat, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="glass-surface p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={cn("p-3 rounded-xl shadow-sm transition-transform group-hover:scale-110", stat.color)}>
                    <stat.icon size={18} />
                  </div>
                  <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">+12%</div>
                </div>
                <div>
                  <p className="text-[8px] font-black text-[#85948f] uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-[#dae2fd] tracking-tighter">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Chart Card */}
          <motion.div variants={itemVariants} className="glass-surface rounded-[3.5rem] p-10 border border-white/5 relative overflow-hidden bg-[#131b2e]/50">
            <div className="flex justify-between items-start mb-12">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#0b1326] flex items-center justify-center text-[#44ddc1] shadow-xl border border-[#44ddc1]/10">
                     <TrendingUp size={24} />
                  </div>
                  <div>
                     <h2 className="text-2xl font-black text-[#dae2fd] uppercase tracking-tighter italic leading-none">Visit Volume</h2>
                     <p className="text-[10px] font-black text-[#85948f] uppercase tracking-[0.3em] mt-2">Neural Ingestion Feed</p>
                  </div>
               </div>
               <div className="px-5 py-2 rounded-xl text-[9px] font-black text-[#44ddc1] uppercase tracking-widest bg-[#44ddc1]/5 border border-[#44ddc1]/10">
                  Real-time Node
               </div>
            </div>
            
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="clinicalGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#44ddc1" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#44ddc1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="6 6" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="#3c4a46" fontSize={11} fontWeight="900" axisLine={false} tickLine={false} dy={20} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#131b2e', border: '1px solid rgba(68,221,193,0.1)', borderRadius: '20px', padding: '15px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', color: '#dae2fd' }} />
                  <Area type="monotone" dataKey="load" stroke="#44ddc1" strokeWidth={4} fillOpacity={1} fill="url(#clinicalGlow)" animationDuration={2000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Actions & AI */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           
           {/* Experience Card (Key Action) */}
           <motion.div variants={itemVariants} className="glass-surface rounded-[3.5rem] bg-[#131b2e] p-10 text-[#dae2fd] relative overflow-hidden group min-h-[460px] flex flex-col justify-between border border-[#44ddc1]/10">
              <div className="absolute top-0 right-0 p-8 text-[#44ddc1]/5 group-hover:rotate-12 transition-transform duration-1000">
                 <Sparkles size={180} />
              </div>
              <div className="relative z-10">
                 <div className="w-14 h-14 rounded-2xl bg-[#44ddc1] flex items-center justify-center text-[#00382f] mb-8 shadow-2xl shadow-[#44ddc1]/20 group-hover:scale-110 transition-transform duration-500">
                    <Plus size={28} />
                 </div>
                 <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none mb-6">Admission<br />Control</h2>
                 <p className="text-[#85948f] font-medium text-lg leading-relaxed">Instantly authorize clinical admissions or schedule new encounters.</p>
              </div>
              
              <div className="space-y-4 relative z-10">
                 <button onClick={() => setShowPatientModal(true)} className="btn-clinical w-full py-6 flex items-center justify-center gap-4">
                    Register Identity <User size={16} />
                 </button>
                 <button onClick={() => setShowAptModal(true)} className="w-full border-2 border-[#44ddc1]/10 text-[#44ddc1] py-6 rounded-[1.8rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-[#44ddc1]/5 transition-all flex items-center justify-center gap-4">
                    Schedule Visit <Clock size={16} />
                 </button>
              </div>
           </motion.div>

           {/* AI Hub Card */}
           <motion.div variants={itemVariants} className="glass-surface rounded-[3rem] bg-[#44ddc1]/5 p-8 border border-[#44ddc1]/10 relative overflow-hidden group cursor-pointer">
              <div className="flex items-center gap-4 mb-6 relative z-10">
                 <div className="p-3 bg-[#44ddc1] rounded-xl text-[#00382f] shadow-xl shadow-[#44ddc1]/20">
                    <Bot size={24} />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-[#dae2fd] uppercase leading-none italic">Clinical Sentinel</h3>
                    <p className="text-[8px] font-black text-[#44ddc1] uppercase tracking-widest mt-1.5">Autonomous Sync</p>
                 </div>
              </div>
              <p className="text-sm text-[#85948f] font-medium leading-relaxed italic mb-8">"Analyzing 14 message patterns to optimize clinic throughput."</p>
              <div className="flex items-center gap-3 text-[#44ddc1] font-black text-[9px] uppercase tracking-[0.3em] relative z-10">
                 <span>Authorize Sentinel Logic</span>
                 <ArrowUpRight size={12} />
              </div>
           </motion.div>
        </div>

      </div>

      {/* Simplified Registration Modal */}
      <AnimatePresence>
        {showPatientModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPatientModal(false)} className="absolute inset-0 bg-[#0b1326]/80 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#131b2e] glass-surface rounded-[3.5rem] w-full max-w-xl p-16 relative z-10 border border-[#44ddc1]/20">
               <div className="flex justify-between items-start mb-12">
                  <div>
                    <h2 className="text-3xl font-black text-[#dae2fd] uppercase tracking-tighter italic italic">Register Patient</h2>
                    <p className="text-[#85948f] font-bold uppercase tracking-widest text-[9px] mt-3">Global Identity Provisioning</p>
                  </div>
                  <button onClick={() => setShowPatientModal(false)} className="bg-[#0b1326] p-4 rounded-2xl text-[#85948f] hover:text-[#44ddc1] border border-white/5 transition-all"><X size={28} /></button>
               </div>
               <form onSubmit={handleAddPatient} className="space-y-10">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-[#85948f] uppercase tracking-widest ml-3">Full Clinical Name</label>
                     <div className="relative group">
                        <User size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#3c4a46] group-focus-within:text-[#44ddc1]" />
                        <input type="text" required placeholder="Ex: John Alexander Smith" className="input-clinical w-full pl-16 pr-8 py-6 rounded-[1.8rem]" value={patientForm.full_name} onChange={e => setPatientForm({...patientForm, full_name: e.target.value})} />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-[#85948f] uppercase tracking-widest ml-3">International Phone</label>
                     <div className="relative group">
                        <Phone size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#3c4a46] group-focus-within:text-[#44ddc1]" />
                        <input type="text" required placeholder="Ex: +971 50 123 4567" className="input-clinical w-full pl-16 pr-8 py-6 rounded-[1.8rem]" value={patientForm.phone_number} onChange={e => setPatientForm({...patientForm, phone_number: e.target.value})} />
                     </div>
                  </div>
                  <button type="submit" className="btn-clinical w-full py-8 rounded-[2rem]">Commit Record</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simplified Visit Modal */}
      <AnimatePresence>
        {showAptModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAptModal(false)} className="absolute inset-0 bg-[#0b1326]/80 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#131b2e] glass-surface rounded-[3.5rem] w-full max-w-xl p-16 relative z-10 border border-[#44ddc1]/20">
               <div className="flex justify-between items-start mb-12">
                  <div>
                    <h2 className="text-3xl font-black text-[#dae2fd] uppercase tracking-tighter italic">Schedule Visit</h2>
                    <p className="text-[#85948f] font-bold uppercase tracking-widest text-[9px] mt-3">Encounter Alignment Matrix</p>
                  </div>
                  <button onClick={() => setShowAptModal(false)} className="bg-[#0b1326] p-4 rounded-2xl text-[#85948f] hover:text-[#44ddc1] border border-white/5 transition-all"><X size={28} /></button>
               </div>
               <form onSubmit={handleAddApt} className="space-y-10">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-[#85948f] uppercase tracking-widest ml-3">Identify Patient</label>
                     <select required className="input-clinical w-full px-8 py-6 rounded-[1.8rem] appearance-none cursor-pointer" value={aptForm.patient_id} onChange={e => setAptForm({...aptForm, patient_id: e.target.value})}>
                        <option value="">Select from list...</option>
                        {patients.map(p => <option key={p._id} value={p._id}>{p.full_name}</option>)}
                     </select>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-[#85948f] uppercase tracking-widest ml-3">Pick Time</label>
                     <input type="datetime-local" required className="input-clinical w-full px-8 py-6 rounded-[1.8rem] [color-scheme:dark]" value={aptForm.scheduled_at} onChange={e => setAptForm({...aptForm, scheduled_at: e.target.value})} />
                  </div>
                  <button type="submit" className="btn-clinical w-full py-8 rounded-[2rem]">Authorize Encounter</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </motion.div>
  );
}

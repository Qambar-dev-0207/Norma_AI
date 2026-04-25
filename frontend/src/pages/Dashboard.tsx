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
  const [patientForm, setPatientForm] = useState({ full_name: '', phone: '', address: '', medical_notes: '' });
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
      setPatientForm({ full_name: '', phone_number: '', address: '', medical_notes: '' });
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
      <div className="h-full flex items-center justify-center">
        <div className="nm-luxury p-12 rounded-[3rem] animate-pulse">
          <Loader2 className="animate-spin text-purple-600" size={40} />
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-[1600px] mx-auto space-y-8 pb-40 px-4">
      
      {/* Top Intelligence Bento Row */}
      <div className="grid grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Practice Analytics */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* Main Chart Card */}
          <motion.div variants={itemVariants} className="nm-luxury rounded-[3rem] p-8 border border-white relative overflow-hidden bg-white/50 glass">
            <div className="flex justify-between items-start mb-10">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-purple-400 shadow-xl">
                     <TrendingUp size={24} />
                  </div>
                  <div>
                     <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">Visit Volume</h2>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5">Live Telemetry</p>
                  </div>
               </div>
               <div className="nm-inset px-4 py-1.5 rounded-xl text-[8px] font-black text-purple-600 uppercase tracking-widest">
                  Real-time Node
               </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="6 6" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#cbd5e1" fontSize={11} fontWeight="900" axisLine={false} tickLine={false} dy={20} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '20px', padding: '15px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }} />
                  <Area type="monotone" dataKey="load" stroke="#7c3aed" strokeWidth={5} fillOpacity={1} fill="url(#purpleGlow)" animationDuration={2000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Bottom Left: Patients Matrix */}
          <motion.div variants={itemVariants} className="nm-luxury rounded-[3rem] p-8 bg-white border border-white overflow-hidden">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-2xl nm-inset flex items-center justify-center text-purple-600">
                     <Users size={18} />
                  </div>
                  <h2 className="text-lg font-black text-slate-800 uppercase italic">Registered Patients</h2>
               </div>
               <button onClick={() => navigate('/patients')} className="nm-button-luxury px-5 py-2.5 rounded-xl text-[8px] font-black text-slate-400 uppercase tracking-widest hover:text-purple-600">See All</button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {patients.slice(0, 4).map((p, i) => (
                <motion.div key={i} whileHover={{ y: -3 }} onClick={() => navigate('/patients')} className="nm-flat-sm p-5 rounded-[2rem] flex flex-col items-center text-center gap-3 border border-white cursor-pointer group">
                   <div className="w-14 h-14 rounded-full bg-zinc-900 border-4 border-white shadow-xl flex items-center justify-center text-[10px] font-black text-purple-400 group-hover:scale-105 transition-transform duration-500">
                      {p.full_name?.split(' ').map((n: any) => n[0]).join('')}
                   </div>
                   <div>
                      <p className="text-xs font-black text-slate-800 leading-tight truncate w-28">{p.full_name}</p>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-60">Identity Asset</p>
                   </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Actions & AI */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           
           {/* Experience Card (Key Action) */}
           <motion.div variants={itemVariants} className="nm-luxury rounded-[3rem] bg-zinc-900 p-8 text-white relative overflow-hidden group min-h-[440px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
                 <Sparkles size={150} />
              </div>
              <div className="relative z-10">
                 <div className="w-14 h-14 rounded-[1.25rem] bg-purple-600 flex items-center justify-center text-white mb-8 shadow-2xl shadow-purple-500/40 group-hover:scale-110 transition-transform duration-500">
                    <Plus size={28} />
                 </div>
                 <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none mb-5">Admission<br />Control</h2>
                 <p className="text-slate-400 font-medium text-base leading-relaxed opacity-80">Instantly authorize new patient admissions or clinical sessions.</p>
              </div>
              
              <div className="space-y-3 relative z-10">
                 <button onClick={() => setShowPatientModal(true)} className="w-full bg-white text-zinc-900 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[9px] hover:bg-purple-600 hover:text-white transition-all duration-500 flex items-center justify-center gap-4">
                    Add Information <User size={14} />
                 </button>
                 <button onClick={() => setShowAptModal(true)} className="w-full border-2 border-white/10 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[9px] hover:bg-white/5 transition-all flex items-center justify-center gap-4">
                    Book Appointment <Clock size={14} />
                 </button>
              </div>
           </motion.div>

           {/* AI Hub Card */}
           <motion.div variants={itemVariants} className="nm-luxury rounded-[3rem] bg-purple-50 p-8 border border-purple-100 relative overflow-hidden group cursor-pointer">
              <div className="flex items-center gap-4 mb-6 relative z-10">
                 <div className="p-2.5 bg-purple-600 rounded-xl text-white shadow-xl shadow-purple-200">
                    <Bot size={24} />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-purple-950 uppercase leading-none">Smart Node</h3>
                    <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest mt-1">Autonomous</p>
                 </div>
              </div>
              <p className="text-sm text-purple-900/60 font-medium leading-relaxed italic mb-6">"Optimizing 4 follow-up tasks to maximize practice efficiency."</p>
              <div className="flex items-center gap-3 text-purple-600 font-black text-[9px] uppercase tracking-[0.3em] relative z-10">
                 <span>Authorize Suggestions</span>
                 <ArrowUpRight size={12} />
              </div>
           </motion.div>

           {/* Live Feed Card */}
           <motion.div variants={itemVariants} className="nm-luxury rounded-[3rem] p-8 bg-white border border-white flex flex-col gap-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest italic">Clinical Pulse</h3>
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { user: 'Sarah', msg: 'Schedule Synced', time: '2m', color: 'bg-purple-600' },
                   { user: 'Node-14', msg: 'Data Ingestion', time: '14m', color: 'bg-zinc-800' }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-4">
                      <div className={cn("w-1 h-8 rounded-full", item.color)} />
                      <div className="flex-1">
                         <p className="text-[10px] font-black text-slate-800 leading-none mb-1 uppercase">{item.user}</p>
                         <p className="text-[9px] text-slate-400 font-bold">{item.msg}</p>
                      </div>
                      <span className="text-[8px] font-black text-slate-300 uppercase">{item.time}</span>
                   </div>
                 ))}
              </div>
           </motion.div>
        </div>

      </div>

      {/* SOTA Registration Modal */}
      <AnimatePresence>
        {showPatientModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPatientModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#f8fafc] nm-luxury rounded-[3rem] w-full max-w-xl p-12 relative z-10 border border-white">
               <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">Admission</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] mt-3">Clinical identity protocol</p>
                  </div>
                  <button onClick={() => setShowPatientModal(false)} className="nm-button-luxury p-4 rounded-xl text-slate-400 hover:text-red-500 transition-all shadow-sm"><X size={24} /></button>
               </div>
               <form onSubmit={handleAddPatient} className="space-y-8">
                  <div className="space-y-3">
                     <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Full Identity</label>
                     <input type="text" required placeholder="Ex: John Smith" className="w-full nm-inset pl-6 pr-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-purple-600/5 transition-all text-sm font-bold text-slate-800 border-2 border-transparent focus:border-purple-100" value={patientForm.full_name} onChange={e => setPatientForm({...patientForm, full_name: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Secure Contact Axis</label>
                     <input type="text" required placeholder="+1..." className="w-full nm-inset pl-6 pr-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-purple-600/5 transition-all text-sm font-bold text-slate-800 border-2 border-transparent focus:border-purple-100" value={patientForm.phone_number} onChange={e => setPatientForm({...patientForm, phone_number: e.target.value})} />
                  </div>
                  <button type="submit" className="w-full bg-zinc-900 text-white py-6 rounded-[1.8rem] font-black uppercase tracking-[0.4em] text-[10px] hover:bg-purple-600 shadow-xl shadow-zinc-900/10 active:scale-95 transition-all">Authorize Admission</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SOTA Schedule Modal */}
      <AnimatePresence>
        {showAptModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAptModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#f8fafc] nm-luxury rounded-[3rem] w-full max-w-xl p-12 relative z-10 border border-white">
               <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">Schedule</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] mt-3">Encounter alignment protocol</p>
                  </div>
                  <button onClick={() => setShowAptModal(false)} className="nm-button-luxury p-4 rounded-xl text-slate-400 hover:text-red-500 transition-all shadow-sm"><X size={24} /></button>
               </div>
               <form onSubmit={handleAddApt} className="space-y-8">
                  <div className="space-y-3">
                     <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Identify Asset</label>
                     <select required className="w-full nm-inset px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-purple-600/5 transition-all text-sm font-bold text-slate-800 appearance-none border-2 border-transparent focus:border-purple-100 cursor-pointer" value={aptForm.patient_id} onChange={e => setAptForm({...aptForm, patient_id: e.target.value})}>
                        <option value="">Select from list...</option>
                        {patients.map(p => <option key={p._id} value={p._id}>{p.full_name}</option>)}
                     </select>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Temporal Alignment</label>
                     <input type="datetime-local" required className="w-full nm-inset px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-purple-600/5 transition-all text-sm font-bold text-slate-800 border-2 border-transparent focus:border-purple-100" value={aptForm.scheduled_at} onChange={e => setAptForm({...aptForm, scheduled_at: e.target.value})} />
                  </div>
                  <button type="submit" className="w-full bg-zinc-900 text-white py-6 rounded-[1.8rem] font-black uppercase tracking-[0.4em] text-[10px] hover:bg-purple-600 shadow-xl shadow-zinc-900/10 active:scale-95 transition-all">Authorize Encounter</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </motion.div>
  );
}

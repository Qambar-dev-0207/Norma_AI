import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Calendar, Users, MessageSquare, Clock, MoreVertical, 
  ChevronRight, Loader2, Plus, X, Stethoscope, Phone, User, 
  MapPin, Sparkles, TrendingUp, AlertCircle, Bot, Zap, ArrowRight,
  CheckCircle2, Star, Target, Zap as Fast, ArrowUpRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../utils/cn';

const mockChartData = [
  { name: '8am', load: 4 },
  { name: '10am', load: 12 },
  { name: '12pm', load: 8 },
  { name: '2pm', load: 15 },
  { name: '4pm', load: 10 },
  { name: '6pm', load: 6 },
];

export default function Dashboard() {
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
    } catch (error) {
      console.error('Data Fetch Error', error);
    } finally {
      setLoading(false);
    }
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
      setPatientForm({ full_name: '', phone: '', address: '', medical_notes: '' });
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
      <div className="h-full flex flex-col items-center justify-center">
        <div className="nm-flat p-10 rounded-[3rem] animate-pulse">
           <Loader2 className="animate-spin text-purple-600" size={40} />
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Appointments', value: stats?.today_appointments || 0, icon: Calendar, color: 'bg-purple-100 text-purple-600' },
    { label: 'Registered Patients', value: stats?.total_patients || 0, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'AI Helper Chats', value: stats?.ai_interactions || 0, icon: MessageSquare, color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Clinic Efficiency', value: stats?.efficiency || '94%', icon: Activity, color: 'bg-emerald-100 text-emerald-600' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight font-premium">Clinic Overview</h1>
          <p className="text-slate-400 font-medium tracking-tight">Everything is running smoothly today.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowPatientModal(true)}
            className="nm-button px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-slate-600 hover:text-purple-600 border border-white"
          >
            Add Patient
          </button>
          <button 
            onClick={() => setShowAptModal(true)}
            className="bg-purple-600 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-purple-200 hover:bg-purple-700 hover:-translate-y-1 transition-all flex items-center gap-3"
          >
            Book Visit <ArrowUpRight size={16} />
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((stat, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -5 }}
            className="nm-flat p-8 rounded-[2.5rem] border border-white relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-4 rounded-2xl shadow-sm border border-white/50 transition-transform group-hover:scale-110", stat.color)}>
                <stat.icon size={22} />
              </div>
              <div className="nm-inset px-3 py-1 rounded-xl text-[10px] font-black text-emerald-600 uppercase tracking-widest">+12%</div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <p className="text-4xl font-black text-slate-800 tracking-tighter">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Chart Card */}
          <div className="nm-flat p-10 rounded-[3rem] border border-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-white shadow-sm">
                  <TrendingUp size={24} />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Visit Volume</h2>
              </div>
              <div className="nm-inset px-4 py-2 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Updates</div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="softPurple" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight="800" axisLine={false} tickLine={false} dy={20} />
                  <YAxis stroke="#94a3b8" fontSize={11} fontWeight="800" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ border: 'none', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontWeight: '900' }} />
                  <Area type="monotone" dataKey="load" stroke="#7c3aed" strokeWidth={5} fillOpacity={1} fill="url(#softPurple)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table Card */}
          <div className="nm-flat rounded-[3rem] border border-white overflow-hidden">
            <div className="p-10 border-b border-white bg-white/10 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-white shadow-lg">
                  <Clock size={22} />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">Upcoming Visits</h2>
              </div>
              <button className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] nm-button px-6 py-3 rounded-xl">View Schedule</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">Patient Name</th>
                    <th className="px-10 py-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">Time</th>
                    <th className="px-10 py-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">Type</th>
                    <th className="px-10 py-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">Status</th>
                    <th className="px-10 py-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/50">
                  {appointments.length > 0 ? appointments.slice(0, 5).map((apt) => (
                    <tr key={apt._id} className="hover:bg-white/40 transition-all group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl nm-inset flex items-center justify-center text-sm font-black text-purple-600 shadow-inner group-hover:scale-105 transition-transform duration-500 bg-white">
                            {apt.patient_name?.split(' ').map((n: string) => n[0]).join('') || 'P'}
                          </div>
                          <div>
                            <p className="text-base font-black text-slate-700 tracking-tight">{apt.patient_name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-70 italic">{apt.patient_phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className="text-sm font-black text-slate-800">
                          {new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <span className="text-[10px] font-black px-4 py-2 nm-inset bg-white rounded-xl text-slate-500 uppercase tracking-widest border border-white">
                          {apt.type}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2.5">
                          <div className={cn("w-2 h-2 rounded-full shadow-sm animate-pulse", apt.status.toLowerCase() === 'completed' ? "bg-purple-600" : "bg-amber-400")} />
                          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{apt.status}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button className="nm-button p-3 rounded-xl text-slate-300 hover:text-purple-600">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-10 py-24 text-center text-slate-300 font-medium italic opacity-60">No visits scheduled for today.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {/* Notifications Card */}
          <div className="nm-flat p-10 rounded-[3rem] border border-white relative overflow-hidden group">
            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase mb-10 flex items-center gap-4 italic">
               <div className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
               Recent Activity
            </h2>
            <div className="space-y-10">
              {[
                { label: 'Booking', msg: 'New visit confirmed via WhatsApp', time: '2m ago', color: 'bg-purple-500' },
                { label: 'Update', msg: 'Patient records updated', time: '14m ago', color: 'bg-blue-500' },
                { label: 'Alert', msg: 'Schedule drift detected', time: '1h ago', color: 'bg-amber-500' },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 relative">
                  {i !== 2 && <div className="absolute top-10 left-2.5 w-[2px] h-12 bg-slate-200" />}
                  <div className={cn("w-5 h-5 rounded-full border-4 border-white shadow-md flex-shrink-0 z-10", item.color)} />
                  <div className="flex-1 -mt-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-sm font-bold text-slate-700 leading-snug">{item.msg}</p>
                    <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-[0.2em]">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-12 py-5 rounded-[1.8rem] nm-button text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] hover:text-purple-600">
               Load More Activity
            </button>
          </div>

          {/* AI Advice Card */}
          <div className="glass p-10 rounded-[3.5rem] border border-white shadow-2xl relative overflow-hidden group">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-xl shadow-purple-200">
                   <Sparkles size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase leading-none">Smart Assistant</h3>
             </div>
             <p className="text-sm text-slate-500 leading-relaxed font-medium mb-8 italic">"Our AI suggests automating follow-up texts for 4 patients today to save time."</p>
             <button className="w-full py-5 rounded-[1.8rem] bg-slate-800 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-purple-600 transition-all flex items-center justify-center gap-4">
                Execute Suggestions <Zap size={16} fill="currentColor" />
             </button>
          </div>
        </div>
      </div>

      {/* Simplified Registration Modal */}
      <AnimatePresence>
        {showPatientModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPatientModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#f0f2f5] nm-flat rounded-[4rem] w-full max-w-xl p-16 relative z-10 border border-white">
               <div className="flex justify-between items-start mb-12">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic">Register Patient</h2>
                    <p className="text-slate-400 font-medium mt-2">Adding a new person to your clinic list.</p>
                  </div>
                  <button onClick={() => setShowPatientModal(false)} className="nm-button p-4 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X size={28} /></button>
               </div>
               <form onSubmit={handleAddPatient} className="space-y-10">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Full Name</label>
                     <div className="relative group">
                        <User size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-600" />
                        <input type="text" required placeholder="Ex: John Smith" className="w-full nm-inset pl-16 pr-8 py-6 rounded-2xl outline-none focus:ring-4 focus:ring-purple-600/5 transition-all text-base font-bold text-slate-800" value={patientForm.full_name} onChange={e => setPatientForm({...patientForm, full_name: e.target.value})} />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Phone Number</label>
                     <div className="relative group">
                        <Phone size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-600" />
                        <input type="text" required placeholder="+1..." className="w-full nm-inset pl-16 pr-8 py-6 rounded-2xl outline-none focus:ring-4 focus:ring-purple-600/5 transition-all text-base font-bold text-slate-800" value={patientForm.phone} onChange={e => setPatientForm({...patientForm, phone: e.target.value})} />
                     </div>
                  </div>
                  <button type="submit" className="w-full bg-purple-600 text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-purple-200 hover:bg-purple-700 hover:-translate-y-1 transition-all active:scale-95">Save Information</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simplified Visit Modal */}
      <AnimatePresence>
        {showAptModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAptModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#f0f2f5] nm-flat rounded-[4rem] w-full max-w-xl p-16 relative z-10 border border-white">
               <div className="flex justify-between items-start mb-12">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic">Schedule Visit</h2>
                    <p className="text-slate-400 font-medium mt-2">Pick a time for a patient appointment.</p>
                  </div>
                  <button onClick={() => setShowAptModal(false)} className="nm-button p-4 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X size={28} /></button>
               </div>
               <form onSubmit={handleAddApt} className="space-y-10">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Select Patient</label>
                     <select required className="w-full nm-inset px-8 py-6 rounded-2xl outline-none focus:ring-4 focus:ring-purple-600/5 transition-all text-base font-black text-slate-800 appearance-none cursor-pointer" value={aptForm.patient_id} onChange={e => setAptForm({...aptForm, patient_id: e.target.value})}>
                        <option value="">Select from list...</option>
                        {patients.map(p => <option key={p._id} value={p._id}>{p.full_name}</option>)}
                     </select>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Pick Time</label>
                     <input type="datetime-local" required className="w-full nm-inset px-8 py-6 rounded-2xl outline-none focus:ring-4 focus:ring-purple-600/5 transition-all text-base font-black text-slate-800" value={aptForm.scheduled_at} onChange={e => setAptForm({...aptForm, scheduled_at: e.target.value})} />
                  </div>
                  <button type="submit" className="w-full bg-purple-600 text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-purple-200 hover:bg-purple-700 hover:-translate-y-1 transition-all active:scale-95">Book Appointment</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

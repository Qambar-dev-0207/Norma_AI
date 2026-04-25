import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, Plus, MoreVertical, Edit2, Trash2, Loader2, X,
  Clock, User, Stethoscope, ChevronRight, Sparkles, Send, Zap,
  AlertCircle, CheckCircle2, Search, Filter, RefreshCw
} from 'lucide-react';
import { cn } from '../utils/cn';
import { motion } from 'framer-motion';

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingApt, setEditingApt] = useState<any>(null);
  
  const initialForm = {
    patient_id: '',
    doctor_id: '',
    scheduled_at: '',
    type: 'Consultation',
    notes: '',
    status: 'upcoming'
  };
  
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [aptRes, patRes, docRes] = await Promise.all([
        axios.get('http://localhost:5000/api/appointments/', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/patients/', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/doctors', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setAppointments(aptRes.data);
      setPatients(patRes.data);
      setDoctors(docRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (editingApt) {
        await axios.patch(`http://localhost:5000/api/appointments/${editingApt._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/appointments/', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-black" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-black tracking-tight uppercase italic">Temporal Mesh</h1>
          <p className="text-zinc-500 mt-2 font-bold text-lg">Master orchestration of clinical encounters and provider availability.</p>
        </div>
        <button 
          onClick={() => { setEditingApt(null); setFormData(initialForm); setShowModal(true); }}
          className="group bg-black text-white px-10 py-5 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-[#7c3aed] transition-all flex items-center gap-4 active:scale-95"
        >
          <Calendar size={18} className="text-white group-hover:rotate-12 transition-transform" /> 
          Initialize Encounter
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200 mb-4">
             <Search size={20} className="text-zinc-400 ml-2" />
             <input type="text" placeholder="Locate encounter record..." className="bg-transparent border-none outline-none text-sm w-full font-bold text-black placeholder-zinc-300" />
          </div>

          <div className="bg-white rounded-[2rem] border-2 border-zinc-50 overflow-hidden shadow-sm p-4">
             <div className="space-y-4">
                {appointments.length > 0 ? appointments.map((apt) => (
                  <motion.div 
                    key={apt._id}
                    whileHover={{ scale: 1.01, x: 10 }}
                    className="p-8 rounded-2xl bg-zinc-50/50 border border-zinc-100 hover:border-black hover:bg-white transition-all group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-8">
                       <div className="w-16 h-16 rounded-xl bg-black flex flex-col items-center justify-center text-center">
                          <p className="text-[9px] font-black text-zinc-500 uppercase">{new Date(apt.scheduled_at).toLocaleDateString([], { month: 'short' })}</p>
                          <p className="text-2xl font-black text-white leading-none">{new Date(apt.scheduled_at).getDate()}</p>
                       </div>
                       <div>
                          <p className="text-xl font-black text-black tracking-tight flex items-center gap-3">
                            {apt.patient_name}
                            <span className="text-[9px] px-3 py-1 bg-black text-white rounded font-black uppercase tracking-widest">{apt.type}</span>
                          </p>
                          <div className="flex items-center gap-6 mt-2">
                             <p className="text-xs font-bold text-zinc-400 flex items-center gap-2">
                               <Clock size={14} className="text-[#7c3aed]" />
                               {new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </p>
                             <p className="text-xs font-bold text-zinc-400 flex items-center gap-2">
                               <Stethoscope size={14} className="text-[#7c3aed]" />
                               Dr. {doctors.find(d => d._id === apt.doctor_id)?.full_name || 'Specialist'}
                             </p>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-10">
                       <div className={cn(
                         "px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border-2",
                         apt.status === 'upcoming' ? 'bg-black text-white border-black' : 'bg-white text-zinc-300 border-zinc-100'
                       )}>
                         {apt.status}
                       </div>
                       <button className="text-zinc-300 hover:text-black p-3 rounded-xl border border-transparent hover:border-zinc-200 transition-all">
                          <MoreVertical size={20} />
                       </button>
                    </div>
                  </motion.div>
                )) : (
                  <div className="py-32 text-center flex flex-col items-center gap-4 opacity-20 grayscale scale-90">
                     <Sparkles size={64} className="text-black" />
                     <p className="text-lg font-bold text-black italic uppercase tracking-tighter">Temporal Grid Empty. No encounters identified.</p>
                  </div>
                )}
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
           <div className="bg-black text-white p-10 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-45 transition-transform duration-1000">
                 <Zap size={150} fill="white" />
              </div>
              <h3 className="text-2xl font-black tracking-tighter uppercase italic mb-4 relative z-10">Clinical Pulse</h3>
              <p className="text-zinc-500 text-xs font-bold mb-10 leading-relaxed relative z-10">"Autonomous mesh synchronization active. Node stability verified at 99.9%."</p>
              
              <div className="space-y-4 relative z-10">
                {[
                  { label: 'Sync Axis', val: 'Real-time', icon: RefreshCw },
                  { label: 'Mesh Node', val: 'Alpha-9', icon: Zap },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-white/5">
                     <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{stat.label}</span>
                     <span className="text-xs font-black uppercase italic text-[#7c3aed]">{stat.val}</span>
                  </div>
                ))}
              </div>

              <button className="w-full mt-10 py-5 rounded-xl bg-[#7c3aed] text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all shadow-xl active:scale-95">
                 Optimize Timeline
              </button>
           </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[100] p-6">
          <div className="bg-white border-4 border-black rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-700">
            <div className="p-12 border-b-2 border-zinc-50 flex justify-between items-center bg-zinc-50/50">
               <div>
                  <h2 className="text-3xl font-black text-black tracking-tighter uppercase italic">Temporal Slotting</h2>
                  <p className="text-[10px] text-[#7c3aed] font-black uppercase tracking-[0.4em] mt-2 italic">Encounter Alignment Matrix</p>
               </div>
               <button onClick={() => setShowModal(false)} className="bg-black text-white p-4 rounded-xl hover:bg-[#7c3aed] transition-all">
                 <X size={24} />
               </button>
            </div>

            <form onSubmit={handleSubmit} className="p-12 grid grid-cols-2 gap-10 bg-white">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Identity *</label>
                <select required className="w-full bg-zinc-50 border-2 border-transparent text-black px-8 py-5 rounded-xl outline-none focus:bg-white focus:border-black transition-all text-base font-black shadow-inner appearance-none" value={formData.patient_id} onChange={e => setFormData({...formData, patient_id: e.target.value})}>
                  <option value="">Select identity...</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.full_name}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Provider *</label>
                <select required className="w-full bg-zinc-50 border-2 border-transparent text-black px-8 py-5 rounded-xl outline-none focus:bg-white focus:border-black transition-all text-base font-black shadow-inner appearance-none" value={formData.doctor_id} onChange={e => setFormData({...formData, doctor_id: e.target.value})}>
                  <option value="">Select provider...</option>
                  {doctors.map(d => <option key={d._id} value={d._id}>{d.full_name}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Temporal Point *</label>
                <input type="datetime-local" required className="w-full bg-zinc-50 border-2 border-transparent text-black px-8 py-5 rounded-xl outline-none focus:bg-white focus:border-black transition-all text-base font-black shadow-inner" value={formData.scheduled_at} onChange={e => setFormData({...formData, scheduled_at: e.target.value})} />
              </div>

              <div className="col-span-2 pt-10 flex gap-8">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-zinc-100 text-black py-6 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all">Abort Sequence</button>
                <button type="submit" className="flex-1 bg-black text-white py-6 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#7c3aed] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4">
                   Commit Slot
                   <Zap size={16} className="text-[#7c3aed]" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

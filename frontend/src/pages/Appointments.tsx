import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Loader2, 
  X,
  Clock,
  User,
  Stethoscope,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingApt, setEditingApt] = useState<any>(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    scheduled_at: '',
    type: 'General Checkup',
    status: 'upcoming'
  });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [aptsRes, patientsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/appointments', { headers }),
        axios.get('http://localhost:5000/api/patients', { headers })
      ]);
      setAppointments(aptsRes.data);
      setPatients(patientsRes.data);
    } catch (err) {
      console.error('Data synchronization failed', err);
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
        await axios.post('http://localhost:5000/api/appointments', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      setEditingApt(null);
      fetchData();
    } catch (err) {
      console.error('Temporal alignment failed', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this clinical encounter from the schedule?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Encounter removal failed', err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6">
        <div className="relative">
           <div className="absolute inset-0 blur-2xl bg-purple-500/20 rounded-full animate-pulse" />
           <Loader2 className="animate-spin text-purple-600 relative z-10" size={48} />
        </div>
        <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Practice Schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight uppercase">Clinical Schedule</h1>
          <p className="text-gray-500 mt-2 font-medium text-lg italic">Coordination of clinical resources and patient temporal alignments.</p>
        </div>
        <button 
          onClick={() => {
            setEditingApt(null);
            setFormData({ patient_id: '', scheduled_at: '', type: 'General Checkup', status: 'upcoming' });
            setShowModal(true);
          }}
          className="group bg-[#09090b] text-white px-10 py-5 rounded-[2rem] text-sm font-black shadow-2xl shadow-zinc-900/20 hover:bg-purple-600 transition-all flex items-center gap-3"
        >
          <Plus size={20} className="text-purple-400 group-hover:rotate-90 transition-transform duration-500" />
          Authorize Encounter
        </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Patient Asset</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Temporal Alignment</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Clinical Protocol</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Session Status</th>
                <th className="px-10 py-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {appointments.map((apt) => (
                <tr key={apt._id} className="hover:bg-gray-50/80 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-gray-800 flex items-center justify-center text-xs font-black text-purple-400 shadow-xl group-hover:scale-105 transition-transform duration-500">
                        {apt.patient_name?.split(' ').map((n: string) => n[0]).join('') || 'P'}
                      </div>
                      <div>
                        <p className="text-base font-black text-zinc-900 group-hover:text-purple-600 transition-colors tracking-tight">{apt.patient_name}</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 opacity-70 italic">{apt.patient_phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                       <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
                          <Clock size={18} />
                       </div>
                       <div>
                          <span className="text-sm font-black text-zinc-900 block">
                            {new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 block">
                            {new Date(apt.scheduled_at).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-[10px] font-black px-4 py-2 bg-white rounded-xl border-2 border-gray-100 text-zinc-900 uppercase tracking-widest shadow-sm">
                      {apt.type}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl border ${
                      apt.status.toLowerCase() === 'completed' ? 'bg-purple-50 border-purple-100 text-purple-600' : 'bg-amber-50 border-amber-100 text-amber-600'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        apt.status.toLowerCase() === 'completed' ? 'bg-purple-600' : 'bg-amber-500'
                      } shadow-sm animate-pulse`} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{apt.status}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === apt._id ? null : apt._id)}
                      className="text-gray-300 hover:text-purple-600 p-3 rounded-2xl hover:bg-white transition-all shadow-none hover:shadow-lg"
                    >
                      <MoreVertical size={24} />
                    </button>
                    
                    {activeMenu === apt._id && (
                      <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-white border border-gray-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 py-3 w-48 animate-in zoom-in-95 duration-300 text-left">
                        <button 
                          onClick={() => {
                            setEditingApt(apt);
                            setFormData({
                              patient_id: apt.patient_id,
                              scheduled_at: apt.scheduled_at.split('.')[0],
                              type: apt.type,
                              status: apt.status
                            });
                            setShowModal(true);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center justify-between px-6 py-3 text-sm font-black text-zinc-900 hover:bg-purple-50 hover:text-purple-600 transition-all group/btn"
                        >
                          Reschedule <Edit2 size={16} />
                        </button>
                        <div className="h-[1px] bg-gray-50 my-1 mx-4" />
                        <button 
                          onClick={() => {
                            handleDelete(apt._id);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center justify-between px-6 py-3 text-sm font-black text-red-500 hover:bg-red-50 transition-all"
                        >
                          Cancel <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30 grayscale">
                       <Calendar size={64} className="text-gray-400" />
                       <p className="text-lg font-bold text-gray-500 italic">Clinical schedule synchronization complete. Zero encounters detected.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-zinc-900/70 backdrop-blur-3xl flex items-center justify-center z-[100] p-6">
          <div className="bg-white border border-gray-200 rounded-[3.5rem] w-full max-w-2xl shadow-[0_60px_120px_-20px_rgba(0,0,0,0.4)] overflow-hidden animate-in zoom-in-95 duration-700">
            <div className="p-12 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase leading-none">
                  {editingApt ? 'Reschedule session' : 'Schedule Session'}
                </h2>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] mt-4 italic">Practice Alignment Matrix</p>
              </div>
              <button onClick={() => setShowModal(false)} className="bg-white p-5 rounded-[1.8rem] text-gray-300 hover:text-red-500 border border-gray-100 hover:border-red-100 transition-all shadow-sm">
                <X size={32} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-12 md:p-16 space-y-12">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Identify Patient Asset</label>
                <div className="relative group">
                  <User size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-purple-600 transition-colors" />
                  <select 
                    required
                    className="w-full bg-gray-50 border-2 border-transparent text-zinc-900 pl-16 pr-8 py-6 rounded-[1.8rem] outline-none focus:bg-white focus:border-purple-200 transition-all text-base font-black shadow-inner appearance-none cursor-pointer"
                    value={formData.patient_id}
                    onChange={e => setFormData({...formData, patient_id: e.target.value})}
                  >
                    <option value="">Select registry profile...</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id}>{p.full_name} ({p.phone})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Temporal Alignment</label>
                  <div className="relative group">
                    <Calendar size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-purple-600 transition-colors pointer-events-none" />
                    <input 
                      type="datetime-local" 
                      required
                      className="w-full bg-gray-50 border-2 border-transparent text-zinc-900 pl-16 pr-8 py-6 rounded-[1.8rem] outline-none focus:bg-white focus:border-purple-200 transition-all text-base font-black shadow-inner"
                      value={formData.scheduled_at}
                      onChange={e => setFormData({...formData, scheduled_at: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Clinical Protocol</label>
                  <div className="relative group">
                    <Stethoscope size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-purple-600 transition-colors pointer-events-none" />
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Diagnostic Session"
                      className="w-full bg-gray-50 border-2 border-transparent text-zinc-900 pl-16 pr-8 py-6 rounded-[1.8rem] outline-none focus:bg-white focus:border-purple-200 transition-all text-base font-black shadow-inner"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 flex gap-10">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-white text-gray-400 py-7 rounded-[2.2rem] font-black uppercase tracking-[0.3em] text-xs border-2 border-gray-100 hover:bg-gray-50 hover:text-zinc-900 transition-all shadow-sm"
                >
                  Discard Session
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-zinc-900 text-white py-7 rounded-[2.2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-zinc-900/20 hover:bg-purple-600 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-4"
                >
                   {editingApt ? 'Confirm Realignment' : 'Authorize Encounter'}
                   <Zap size={18} className="text-purple-400" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

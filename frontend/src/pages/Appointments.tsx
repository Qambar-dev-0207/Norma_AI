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
  Stethoscope
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
      console.error('Failed to fetch data', err);
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
      console.error('Operation failed', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this appointment?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#44ddc1]" size={40} />
        <p className="text-[#85948f] font-bold uppercase tracking-widest text-xs">Syncing Schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-[#dae2fd] tracking-tighter">Clinical Schedule</h1>
          <p className="text-[#85948f] mt-1 font-medium">Coordinate patient encounters and clinical availability.</p>
        </div>
        <button 
          onClick={() => {
            setEditingApt(null);
            setFormData({ patient_id: '', scheduled_at: '', type: 'General Checkup', status: 'upcoming' });
            setShowModal(true);
          }}
          className="bg-[#44ddc1] text-[#00382f] px-6 py-3 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(68,221,193,0.3)] hover:shadow-[0_0_30px_rgba(68,221,193,0.5)] transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          New Appointment
        </button>
      </div>

      <div className="bg-[#131b2e] rounded-2xl border border-[#3c4a46]/10 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#3c4a46]/10 bg-[#171f33]/50">
              <th className="px-8 py-5 text-[11px] font-bold text-[#85948f] uppercase tracking-wider">Patient</th>
              <th className="px-8 py-5 text-[11px] font-bold text-[#85948f] uppercase tracking-wider">Scheduled Time</th>
              <th className="px-8 py-5 text-[11px] font-bold text-[#85948f] uppercase tracking-wider">Encounter Type</th>
              <th className="px-8 py-5 text-[11px] font-bold text-[#85948f] uppercase tracking-wider">Status</th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3c4a46]/5">
            {appointments.map((apt) => (
              <tr key={apt._id} className="hover:bg-[#171f33]/40 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0b1326] border border-[#3c4a46]/20 flex items-center justify-center text-xs font-bold text-[#44ddc1]">
                      {apt.patient_name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#dae2fd]">{apt.patient_name}</p>
                      <p className="text-[10px] text-[#85948f]">{apt.patient_phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#dae2fd]">
                    <Clock size={14} className="text-[#44ddc1]" />
                    {new Date(apt.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-[10px] font-bold px-2 py-1 bg-[#171f33] rounded border border-[#3c4a46]/20 text-[#dae2fd] uppercase tracking-wider">
                    {apt.type}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      apt.status.toLowerCase() === 'completed' ? 'bg-[#44ddc1]' : 'bg-yellow-400'
                    } shadow-[0_0_8px_currentColor]`} />
                    <span className="text-[11px] font-bold text-[#dae2fd] capitalize">{apt.status}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-right relative">
                  <button 
                    onClick={() => setActiveMenu(activeMenu === apt._id ? null : apt._id)}
                    className="text-[#85948f] hover:text-[#dae2fd] p-1 transition-colors"
                  >
                    <MoreVertical size={20} />
                  </button>
                  
                  {activeMenu === apt._id && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 bg-[#171f33] border border-[#3c4a46]/20 rounded-xl shadow-2xl z-50 py-2 w-40 animate-in zoom-in-95 duration-200">
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
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-[#dae2fd] hover:bg-[#44ddc1]/10 hover:text-[#44ddc1] transition-colors"
                      >
                        <Edit2 size={16} /> Reschedule
                      </button>
                      <button 
                        onClick={() => {
                          handleDelete(apt._id);
                          setActiveMenu(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={16} /> Cancel
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-[#060e20]/80 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-[#131b2e] border border-[#3c4a46]/20 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-[#3c4a46]/10 flex justify-between items-center bg-[#171f33]/50">
              <h2 className="text-xl font-bold text-[#dae2fd] tracking-tight">
                {editingApt ? 'Reschedule Encounter' : 'Schedule New Encounter'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#85948f] hover:text-[#dae2fd]">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">Select Patient</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#85948f]" />
                  <select 
                    required
                    className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] pl-10 pr-4 py-3 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all text-sm appearance-none"
                    value={formData.patient_id}
                    onChange={e => setFormData({...formData, patient_id: e.target.value})}
                  >
                    <option value="">Choose from registry...</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id}>{p.full_name} ({p.phone})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">Date & Time</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#85948f]" />
                  <input 
                    type="datetime-local" 
                    required
                    className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] pl-10 pr-4 py-3 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all text-sm [color-scheme:dark]"
                    value={formData.scheduled_at}
                    onChange={e => setFormData({...formData, scheduled_at: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">Encounter Type</label>
                <div className="relative">
                  <Stethoscope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#85948f]" />
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. General Checkup, Surgery"
                    className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] pl-10 pr-4 py-3 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all text-sm"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-[#171f33] text-[#dae2fd] py-4 rounded-xl font-bold border border-[#3c4a46]/20 hover:bg-[#222a3d] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#44ddc1] text-[#00382f] py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(68,221,193,0.2)] hover:shadow-[0_0_30px_rgba(68,221,193,0.4)] transition-all"
                >
                  {editingApt ? 'Update Schedule' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

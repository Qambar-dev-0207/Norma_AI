import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Search, Plus, MoreVertical, Edit2, Trash2, Loader2, X,
  Phone, User, ShieldCheck, AlertCircle, Fingerprint, ArrowUpRight, Filter,
  Stethoscope, Mail
} from 'lucide-react';

export default function Doctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  
  const initialForm = {
    full_name: '',
    specialty: '',
    license_number: '',
    whatsapp_number: '',
    email: '',
    phone: '',
    consultation_fee: 0,
    is_active: true
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/doctors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setError('');

    try {
      if (editingDoctor) {
        await axios.patch(`http://localhost:5000/api/doctors/${editingDoctor._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/doctors', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      setEditingDoctor(null);
      setFormData(initialForm);
      fetchDoctors();
    } catch (err: any) { 
      console.error('Operation failed', err);
      setError(err.response?.data?.detail || 'Doctor registration failed. Verify network connectivity.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Archive this doctor record?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDoctors();
    } catch (err) { console.error(err); }
  };

  const filteredDoctors = doctors.filter(d => 
    d.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    d.specialty?.toLowerCase().includes(search.toLowerCase()) ||
    d.whatsapp_number?.includes(search)
  );

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
          <h1 className="text-4xl font-black text-black tracking-tight uppercase italic">Provider Registry</h1>
          <p className="text-zinc-500 mt-2 font-bold text-lg">Comprehensive specialist and clinic personnel management.</p>
        </div>
        <button 
          onClick={() => { setEditingDoctor(null); setFormData(initialForm); setError(''); setShowModal(true); }}
          className="group bg-black text-white px-10 py-5 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-[#7c3aed] transition-all flex items-center gap-4 active:scale-95"
        >
          <Plus size={18} className="text-white group-hover:rotate-90 transition-transform duration-500" /> 
          Register Provider
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 bg-zinc-50 p-5 rounded-xl border border-zinc-200 flex items-center gap-5 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-500/5 transition-all">
          <Search size={20} className="text-zinc-400 ml-3" />
          <input 
            type="text" 
            placeholder="Identify provider by name or specialty..." 
            className="bg-transparent border-none outline-none text-black w-full py-2 font-bold text-sm placeholder-zinc-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="px-8 py-5 bg-white border border-zinc-200 rounded-xl text-zinc-500 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 hover:text-black hover:border-black transition-all">
          <Filter size={18} />
          Refine Search
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border-2 border-zinc-50 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Provider Identity</th>
                <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Specialty & License</th>
                <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Contact Axis</th>
                <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Financial Base</th>
                <th className="px-10 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredDoctors.map((doctor) => (
                <tr key={doctor._id} className="hover:bg-zinc-50/50 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center text-xs font-black text-[#7c3aed] group-hover:scale-105 transition-transform duration-500">
                        {doctor.full_name?.split(' ').map((n: any) => n[0]).join('') || 'D'}
                      </div>
                      <div>
                        <p className="text-base font-black text-black group-hover:text-[#7c3aed] transition-colors tracking-tight">{doctor.full_name}</p>
                        <div className={`mt-1.5 flex items-center gap-2 px-2 py-0.5 rounded border w-fit ${doctor.is_active ? 'bg-black text-white border-black' : 'bg-zinc-100 text-zinc-400 border-zinc-200'}`}>
                          <span className="text-[8px] font-black uppercase tracking-widest leading-none">{doctor.is_active ? 'Authorized' : 'Archived'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-sm font-bold text-black flex items-center gap-2">
                       {doctor.specialty || 'General Practice'}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-bold tracking-tight mt-1 uppercase italic">Lic: {doctor.license_number || 'N/A'}</p>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-sm font-bold text-black flex items-center gap-2">
                       {doctor.whatsapp_number}
                    </p>
                    <p className="text-[10px] text-[#7c3aed] font-bold tracking-tight mt-1 lowercase italic">{doctor.email || 'no-mail'}</p>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-[10px] font-black px-4 py-2 bg-black text-white rounded-lg uppercase tracking-widest">
                      ${doctor.consultation_fee?.toFixed(2) || '0.00'}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === doctor._id ? null : doctor._id)}
                      className="text-zinc-300 hover:text-black p-3 rounded-xl border border-transparent hover:border-zinc-200 transition-all"
                    >
                      <MoreVertical size={22} />
                    </button>
                    
                    {activeMenu === doctor._id && (
                      <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-black text-white rounded-xl shadow-2xl z-50 py-3 w-56 animate-in zoom-in-95 duration-300">
                        <button 
                          onClick={() => {
                            setEditingDoctor(doctor);
                            setFormData({ ...doctor });
                            setShowModal(true);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center justify-between px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#7c3aed] transition-all"
                        >
                          Modify Profile <ArrowUpRight size={14} />
                        </button>
                        <div className="h-[1px] bg-white/5 my-1 mx-4" />
                        <button 
                          onClick={() => { handleDelete(doctor._id); setActiveMenu(null); }}
                          className="w-full flex items-center justify-between px-6 py-3 text-xs font-black uppercase tracking-widest text-red-400 hover:bg-red-500 hover:text-white transition-all"
                        >
                          Archive <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[100] p-6">
          <div className="bg-white border-4 border-black rounded-[3rem] w-full max-w-5xl shadow-[0_60px_120px_-20px_rgba(0,0,0,0.4)] overflow-hidden animate-in zoom-in-95 duration-700">
            <div className="p-12 border-b-2 border-zinc-50 flex justify-between items-center bg-zinc-50/50">
              <div>
                <h2 className="text-4xl font-black text-black tracking-tighter uppercase leading-none">
                  {editingDoctor ? 'Modify Identity' : 'Register Asset'}
                </h2>
                <p className="text-[10px] text-[#7c3aed] font-black uppercase tracking-[0.4em] mt-4 italic">Personnel Configuration Matrix</p>
              </div>
              <button onClick={() => setShowModal(false)} className="bg-black text-white p-5 rounded-2xl hover:bg-[#7c3aed] transition-all shadow-xl">
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-12 md:p-16 grid grid-cols-2 gap-10 overflow-y-auto max-h-[65vh] scrollbar-thin bg-white">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Full Name *</label>
                <input type="text" required placeholder="Ex: Dr. Jane Doe" className="w-full bg-zinc-50 border-2 border-transparent text-black px-8 py-5 rounded-xl outline-none focus:bg-white focus:border-black transition-all text-base font-black shadow-inner" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Specialty</label>
                <input type="text" placeholder="e.g., Cardiology" className="w-full bg-zinc-50 border-2 border-transparent text-black px-8 py-5 rounded-xl outline-none focus:bg-white focus:border-black transition-all text-base font-black shadow-inner" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">WhatsApp Axis *</label>
                <input type="text" required placeholder="+123..." className="w-full bg-zinc-50 border-2 border-transparent text-black px-8 py-5 rounded-xl outline-none focus:bg-white focus:border-black transition-all text-base font-black shadow-inner" value={formData.whatsapp_number} onChange={e => setFormData({...formData, whatsapp_number: e.target.value})} />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Consultation Fee</label>
                <div className="relative">
                   <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 font-black">$</span>
                   <input type="number" min="0" step="0.01" className="w-full bg-zinc-50 border-2 border-transparent text-black pl-12 pr-8 py-5 rounded-xl outline-none focus:bg-white focus:border-black transition-all text-base font-black shadow-inner" value={formData.consultation_fee} onChange={e => setFormData({...formData, consultation_fee: parseFloat(e.target.value)})} />
                </div>
              </div>

              <div className="col-span-2 pt-10 flex gap-8">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-zinc-100 text-black py-6 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all">Discard Sequences</button>
                <button type="submit" className="flex-1 bg-black text-white py-6 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#7c3aed] transition-all shadow-2xl active:scale-95">Commit Registration</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

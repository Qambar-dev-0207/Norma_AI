import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Search, Plus, MoreVertical, Edit2, Trash2, Loader2, X,
  Phone, User, MapPin, FileText, Mail, Calendar, Languages, ShieldCheck, AlertCircle,
  ArrowUpRight, Filter, Fingerprint
} from 'lucide-react';
import { cn } from '../utils/cn';

export default function Patients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  
  const initialForm = {
    full_name: '',
    phone_number: '',
    email: '',
    gender: 'Other',
    address: '',
    notes: '',
    preferred_language: 'ar'
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/patients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setError('');

    try {
      if (editingPatient) {
        await axios.patch(`http://localhost:5000/api/patients/${editingPatient._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/patients', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      setEditingPatient(null);
      setFormData(initialForm);
      fetchPatients();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'System rejected the entry. Verify clinical credentials.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('De-authorize this patient record?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPatients();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    p.phone_number?.includes(search)
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
          <h1 className="text-4xl font-black text-black tracking-tight uppercase italic">Patient Mesh</h1>
          <p className="text-zinc-500 mt-2 font-bold text-lg">Autonomous patient identity and clinical profile management.</p>
        </div>
        <button 
          onClick={() => { setEditingPatient(null); setFormData(initialForm); setError(''); setShowModal(true); }}
          className="group bg-black text-white px-10 py-5 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-[#7c3aed] transition-all flex items-center gap-4 active:scale-95"
        >
          <Plus size={18} className="text-white group-hover:rotate-90 transition-transform duration-500" /> 
          Authorize Identity
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 bg-zinc-50 p-5 rounded-xl border border-zinc-200 flex items-center gap-5 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-500/5 transition-all">
          <Search size={20} className="text-zinc-400 ml-3" />
          <input 
            type="text" 
            placeholder="Search by name or contact code..." 
            className="bg-transparent border-none outline-none text-black w-full py-2 font-bold text-sm placeholder-zinc-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="px-8 py-5 bg-white border border-zinc-200 rounded-xl text-zinc-500 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 hover:text-black hover:border-black transition-all">
          <Filter size={18} />
          Refine Registry
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border-2 border-zinc-50 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Patient Identity</th>
                <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Neural Axis</th>
                <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Temporal Info</th>
                <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">System Rank</th>
                <th className="px-10 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredPatients.map((patient) => (
                <tr key={patient._id} className="hover:bg-zinc-50/50 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center text-xs font-black text-[#7c3aed] group-hover:scale-105 transition-transform duration-500">
                        {patient.full_name?.split(' ').map((n: any) => n[0]).join('') || 'P'}
                      </div>
                      <div>
                        <p className="text-base font-black text-black group-hover:text-[#7c3aed] transition-colors tracking-tight">{patient.full_name}</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1 opacity-60">#{patient.patient_uuid?.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-sm font-bold text-black flex items-center gap-2">
                       {patient.phone_number}
                    </p>
                    <p className="text-[10px] text-[#7c3aed] font-bold tracking-tight mt-1 lowercase italic">{patient.email || 'no-mail'}</p>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-sm font-bold text-black">{patient.gender}</p>
                    <p className="text-[10px] text-zinc-400 font-bold tracking-tight mt-1 uppercase italic flex items-center gap-2">
                       <MapPin size={12} className="text-[#7c3aed]" />
                       {patient.address || 'Geo-Location Missing'}
                    </p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2.5 px-4 py-2 bg-black text-white rounded-lg w-fit">
                       <ShieldCheck size={14} className="text-[#7c3aed]" />
                       <span className="text-[9px] font-black uppercase tracking-widest">Verified Resident</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === patient._id ? null : patient._id)}
                      className="text-zinc-300 hover:text-black p-3 rounded-xl border border-transparent hover:border-zinc-200 transition-all"
                    >
                      <MoreVertical size={22} />
                    </button>
                    
                    {activeMenu === patient._id && (
                      <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-black text-white rounded-xl shadow-2xl z-50 py-3 w-56 animate-in zoom-in-95 duration-300">
                        <button 
                          onClick={() => {
                            setEditingPatient(patient);
                            setFormData({
                              full_name: patient.full_name,
                              phone_number: patient.phone_number,
                              email: patient.email || '',
                              gender: patient.gender,
                              address: patient.address || '',
                              notes: patient.notes || '',
                              preferred_language: patient.preferred_language || 'ar'
                            });
                            setShowModal(true);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center justify-between px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#7c3aed] transition-all"
                        >
                          Modify Assets <ArrowUpRight size={14} />
                        </button>
                        <div className="h-[1px] bg-white/5 my-1 mx-4" />
                        <button 
                          onClick={() => { handleDelete(patient._id); setActiveMenu(null); }}
                          className="w-full flex items-center justify-between px-6 py-3 text-xs font-black uppercase tracking-widest text-red-400 hover:bg-red-500 hover:text-white transition-all"
                        >
                          Erase Record <Trash2 size={14} />
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
                  {editingPatient ? 'Modify identity' : 'Register Identity'}
                </h2>
                <p className="text-[10px] text-[#7c3aed] font-black uppercase tracking-[0.4em] mt-4 italic">Registry Synchronization Node</p>
              </div>
              <button onClick={() => setShowModal(false)} className="bg-black text-white p-5 rounded-2xl hover:bg-[#7c3aed] transition-all shadow-xl">
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-12 md:p-16 grid grid-cols-2 gap-10 overflow-y-auto max-h-[65vh] scrollbar-thin bg-white">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Full Identity *</label>
                <input type="text" required placeholder="Legal Name..." className="w-full bg-zinc-50 border-2 border-transparent text-black px-8 py-5 rounded-xl outline-none focus:bg-white focus:border-black transition-all text-base font-black shadow-inner" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Neural Contact *</label>
                <input type="text" required placeholder="E.164 Format..." className="w-full bg-zinc-50 border-2 border-transparent text-black px-8 py-5 rounded-xl outline-none focus:bg-white focus:border-black transition-all text-base font-black shadow-inner" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
              </div>

              <div className="col-span-2 space-y-4">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Observational Data</label>
                <textarea rows={4} placeholder="Allergies, markers, or anomalies..." className="w-full bg-zinc-50 border-2 border-transparent text-black px-8 py-5 rounded-xl outline-none focus:bg-white focus:border-black transition-all text-base font-black shadow-inner resize-none" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>

              <div className="col-span-2 pt-10 flex gap-8">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-zinc-100 text-black py-6 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all">Abort Sequence</button>
                <button type="submit" className="flex-1 bg-black text-white py-6 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#7c3aed] transition-all shadow-2xl active:scale-95">Commit Registry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

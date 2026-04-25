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
    if (!window.confirm('Archive this doctor record? This action will restrict scheduling visibility.')) return;
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
      <div className="h-full flex flex-col items-center justify-center space-y-6">
        <div className="relative">
           <div className="absolute inset-0 blur-2xl bg-blue-500/20 rounded-full animate-pulse" />
           <Loader2 className="animate-spin text-blue-600 relative z-10" size={48} />
        </div>
        <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Provider Mesh...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight uppercase">Medical Providers</h1>
          <p className="text-gray-500 mt-2 font-medium text-lg italic">Comprehensive doctor and specialist lifecycle management.</p>
        </div>
        <button 
          onClick={() => { setEditingDoctor(null); setFormData(initialForm); setError(''); setShowModal(true); }}
          className="group bg-[#09090b] text-white px-10 py-5 rounded-[2rem] text-sm font-black shadow-2xl shadow-zinc-900/20 hover:bg-blue-600 transition-all flex items-center gap-3"
        >
          <Plus size={20} className="text-blue-400 group-hover:rotate-90 transition-transform duration-500" /> 
          Add Provider
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white p-5 rounded-[1.8rem] border border-gray-100 shadow-sm flex items-center gap-5 focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-200 transition-all">
          <Search size={22} className="text-gray-300 ml-3" />
          <input 
            type="text" 
            placeholder="Search by name, specialty, or WhatsApp number..." 
            className="bg-transparent border-none outline-none text-zinc-900 w-full py-2 font-bold text-sm placeholder-gray-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="bg-white px-8 py-5 rounded-[1.8rem] border border-gray-100 text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-gray-50 transition-all shadow-sm">
          <Filter size={18} />
          Refine Search
        </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Provider Identity</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Specialty & License</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Contact Axis</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Financial Base</th>
                <th className="px-10 py-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredDoctors.map((doctor) => (
                <tr key={doctor._id} className="hover:bg-gray-50/80 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-gray-800 flex items-center justify-center text-xs font-black text-blue-400 shadow-xl group-hover:scale-105 transition-transform duration-500">
                        {doctor.full_name?.split(' ').map((n: any) => n[0]).join('') || 'D'}
                      </div>
                      <div>
                        <p className="text-base font-black text-zinc-900 group-hover:text-blue-600 transition-colors tracking-tight">{doctor.full_name}</p>
                        <div className={`mt-1 flex items-center gap-2 px-2 py-0.5 rounded-lg border w-fit ${doctor.is_active ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${doctor.is_active ? 'bg-emerald-600 animate-pulse' : 'bg-gray-400'}`} />
                          <span className="text-[8px] font-black uppercase tracking-widest">{doctor.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-sm font-black text-zinc-900 flex items-center gap-2">
                       <Stethoscope size={14} className="text-blue-400" />
                       {doctor.specialty || 'General Practice'}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold tracking-tight mt-1 uppercase italic">Lic: {doctor.license_number || 'N/A'}</p>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-sm font-black text-zinc-900 flex items-center gap-2">
                       <Phone size={14} className="text-blue-400" />
                       {doctor.whatsapp_number}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold tracking-tight mt-1 lowercase italic flex items-center gap-2">
                       <Mail size={12} className="text-gray-400" />
                       {doctor.email || 'no-email'}
                    </p>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-[10px] font-black px-4 py-2 bg-white rounded-xl border-2 border-gray-100 text-zinc-900 uppercase tracking-widest shadow-sm">
                      ${doctor.consultation_fee?.toFixed(2) || '0.00'}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === doctor._id ? null : doctor._id)}
                      className="text-gray-300 hover:text-blue-600 p-3 rounded-2xl hover:bg-white transition-all shadow-none hover:shadow-lg"
                    >
                      <MoreVertical size={24} />
                    </button>
                    
                    {activeMenu === doctor._id && (
                      <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-white border border-gray-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 py-3 w-56 animate-in zoom-in-95 duration-300">
                        <button 
                          onClick={() => {
                            setEditingDoctor(doctor);
                            setFormData({
                              ...doctor
                            });
                            setShowModal(true);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center justify-between px-6 py-3 text-sm font-black text-zinc-900 hover:bg-blue-50 hover:text-blue-600 transition-all group/btn"
                        >
                          Modify Profile <ArrowUpRight size={16} className="text-gray-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </button>
                        <div className="h-[1px] bg-gray-50 my-1 mx-4" />
                        <button 
                          onClick={() => { handleDelete(doctor._id); setActiveMenu(null); }}
                          className="w-full flex items-center justify-between px-6 py-3 text-sm font-black text-red-500 hover:bg-red-50 transition-all"
                        >
                          Archive Provider <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredDoctors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30 grayscale">
                       <Stethoscope size={64} className="text-gray-400" />
                       <p className="text-lg font-bold text-gray-500 italic">No medical providers found in the registry.</p>
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
          <div className="bg-white border border-gray-200 rounded-[3.5rem] w-full max-w-5xl shadow-[0_60px_120px_-20px_rgba(0,0,0,0.4)] overflow-hidden animate-in zoom-in-95 duration-700">
            <div className="p-12 md:p-16 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase leading-none">
                  {editingDoctor ? 'Modify Provider' : 'Add New Provider'}
                </h2>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] mt-4">Provider Identity Registration</p>
              </div>
              <button onClick={() => setShowModal(false)} className="bg-white p-5 rounded-[1.8rem] text-gray-300 hover:text-red-500 border border-gray-100 hover:border-red-100 transition-all shadow-sm">
                <X size={32} />
              </button>
            </div>

            {error && (
              <div className="mx-12 mt-10 bg-red-50 border-2 border-red-100 p-6 rounded-[2rem] flex items-center gap-5 text-red-500 text-xs font-black uppercase tracking-widest animate-in shake duration-500 shadow-xl shadow-red-500/5">
                <AlertCircle size={24} />
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="p-12 md:p-16 grid grid-cols-2 gap-x-16 gap-y-10 overflow-y-auto max-h-[65vh] scrollbar-thin">
              {/* Primary Identity */}
              <div className="col-span-2 flex items-center gap-6 mb-2">
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em] whitespace-nowrap">Professional Identity</span>
                <div className="h-[2px] w-full bg-gradient-to-r from-blue-100 to-transparent" />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Full Name *</label>
                <div className="relative group">
                  <User size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                  <input type="text" required placeholder="Ex: Dr. Jane Doe" className="w-full bg-gray-50 border-2 border-transparent text-zinc-900 pl-16 pr-8 py-6 rounded-[1.8rem] outline-none focus:bg-white focus:border-blue-200 transition-all text-base font-black shadow-inner" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Specialty</label>
                <div className="relative group">
                  <Stethoscope size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                  <input type="text" placeholder="e.g., Cardiology" className="w-full bg-gray-50 border-2 border-transparent text-zinc-900 pl-16 pr-8 py-6 rounded-[1.8rem] outline-none focus:bg-white focus:border-blue-200 transition-all text-base font-black shadow-inner" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">License Number</label>
                <div className="relative group">
                  <ShieldCheck size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                  <input type="text" placeholder="Medical License ID" className="w-full bg-gray-50 border-2 border-transparent text-zinc-900 pl-16 pr-8 py-6 rounded-[1.8rem] outline-none focus:bg-white focus:border-blue-200 transition-all text-base font-black shadow-inner" value={formData.license_number} onChange={e => setFormData({...formData, license_number: e.target.value})} />
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Consultation Fee</label>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 font-bold group-focus-within:text-blue-600 transition-colors">$</span>
                  <input type="number" min="0" step="0.01" className="w-full bg-gray-50 border-2 border-transparent text-zinc-900 pl-12 pr-8 py-6 rounded-[1.8rem] outline-none focus:bg-white focus:border-blue-200 transition-all text-base font-black shadow-inner" value={formData.consultation_fee} onChange={e => setFormData({...formData, consultation_fee: parseFloat(e.target.value)})} />
                </div>
              </div>

              {/* Contact Info */}
              <div className="col-span-2 flex items-center gap-6 mt-6 mb-2">
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em] whitespace-nowrap">Contact Matrix</span>
                <div className="h-[2px] w-full bg-gradient-to-r from-blue-100 to-transparent" />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">WhatsApp Number *</label>
                <div className="relative group">
                  <Phone size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                  <input type="text" required placeholder="+0..." className="w-full bg-gray-50 border-2 border-transparent text-zinc-900 pl-16 pr-8 py-6 rounded-[1.8rem] outline-none focus:bg-white focus:border-blue-200 transition-all text-base font-black shadow-inner" value={formData.whatsapp_number} onChange={e => setFormData({...formData, whatsapp_number: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Email Address</label>
                <div className="relative group">
                  <Mail size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                  <input type="email" placeholder="doctor@clinic.net" className="w-full bg-gray-50 border-2 border-transparent text-zinc-900 pl-16 pr-8 py-6 rounded-[1.8rem] outline-none focus:bg-white focus:border-blue-200 transition-all text-base font-black shadow-inner" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div className="col-span-2 pt-10 flex gap-10">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white text-gray-400 py-7 rounded-[2.2rem] font-black uppercase tracking-[0.3em] text-xs border-2 border-gray-100 hover:bg-gray-50 hover:text-zinc-900 transition-all shadow-sm">Discard Entry</button>
                <button type="submit" className="flex-1 bg-zinc-900 text-white py-7 rounded-[2.2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-zinc-900/20 hover:bg-blue-600 hover:-translate-y-1 transition-all active:scale-95">Commit Provider</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
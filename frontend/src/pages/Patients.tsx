import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Search, Plus, MoreVertical, Edit2, Trash2, Loader2, X,
  Phone, User, MapPin, FileText, Mail, Calendar, Languages, ShieldCheck, AlertCircle, HeartPulse,
  Fingerprint, ArrowUpRight, Filter
} from 'lucide-react';

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
    date_of_birth: '',
    gender: 'Other',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    preferred_language: 'ar',
    medical_alerts: '',
    insurance_provider: '',
    insurance_id: '',
    notes: '',
    is_active: true
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
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setError('');
    
    const submissionData = {
      ...formData,
      medical_alerts: formData.medical_alerts.split(',').map(s => s.trim()).filter(s => s !== ''),
      date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth).toISOString() : null
    };

    try {
      if (editingPatient) {
        await axios.patch(`http://localhost:5000/api/patients/${editingPatient._id}`, submissionData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/patients', submissionData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      setEditingPatient(null);
      setFormData(initialForm);
      fetchPatients();
    } catch (err: any) { 
      console.error('Operation failed', err);
      setError(err.response?.data?.detail || 'Clinical registration failed. Verify network connectivity.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Archive this clinical record? This action will restrict patient lifecycle visibility.')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPatients();
    } catch (err) { console.error(err); }
  };

  const filteredPatients = patients.filter(p => 
    p.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    p.phone_number?.includes(search) ||
    p.patient_uuid?.includes(search)
  );

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6">
        <div className="relative">
           <div className="absolute inset-0 blur-2xl bg-purple-500/20 rounded-full animate-pulse" />
           <Loader2 className="animate-spin text-purple-600 relative z-10" size={48} />
        </div>
        <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Accessing Patient Mesh...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight uppercase">Patient Registry</h1>
          <p className="text-gray-500 mt-2 font-medium text-lg italic">Comprehensive identity and health record lifecycle management.</p>
        </div>
        <button 
          onClick={() => { setEditingPatient(null); setFormData(initialForm); setError(''); setShowModal(true); }}
          className="group bg-[#09090b] text-white px-10 py-5 rounded-[2rem] text-sm font-black shadow-2xl shadow-zinc-900/20 hover:bg-purple-600 transition-all flex items-center gap-3"
        >
          <Plus size={20} className="text-purple-400 group-hover:rotate-90 transition-transform duration-500" /> 
          Admission Intake
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white p-5 rounded-[1.8rem] border border-gray-100 shadow-sm flex items-center gap-5 focus-within:ring-4 focus-within:ring-purple-500/5 focus-within:border-purple-200 transition-all">
          <Search size={22} className="text-gray-300 ml-3" />
          <input 
            type="text" 
            placeholder="Search by legal name, contact axis, or global UUID..." 
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
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Identity Asset</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Secure Contact</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Protocol Status</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Financial Matrix</th>
                <th className="px-10 py-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPatients.map((patient) => (
                <tr key={patient._id} className="hover:bg-gray-50/80 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-gray-800 flex items-center justify-center text-xs font-black text-purple-400 shadow-xl group-hover:scale-105 transition-transform duration-500">
                        {patient.full_name?.split(' ').map((n: any) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-base font-black text-zinc-900 group-hover:text-purple-600 transition-colors tracking-tight">{patient.full_name}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 opacity-70 flex items-center gap-2">
                           <Fingerprint size={12} className="text-purple-600/50" />
                           {patient.patient_uuid?.slice(0,12)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-sm font-black text-zinc-900">{patient.phone_number}</p>
                    <p className="text-[10px] text-gray-400 font-bold tracking-tight mt-1 lowercase italic">{patient.email || 'no-email-authorized'}</p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-wrap gap-2.5">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${patient.is_active ? 'bg-purple-50 border-purple-100 text-purple-600' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${patient.is_active ? 'bg-purple-600 animate-pulse' : 'bg-gray-400'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{patient.is_active ? 'Operational' : 'Restricted'}</span>
                      </div>
                      {patient.medical_alerts?.length > 0 && (
                        <span className="text-[10px] font-black px-3 py-1.5 bg-red-50 border border-red-100 text-red-500 uppercase flex items-center gap-1.5 shadow-sm">
                          <AlertCircle size={12} /> {patient.medical_alerts.length} Critical Alerts
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-sm font-black text-zinc-900">{patient.insurance_provider || 'Direct-Pay Protocol'}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {patient.insurance_id || 'unassigned'}</p>
                  </td>
                  <td className="px-10 py-8 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === patient._id ? null : patient._id)}
                      className="text-gray-300 hover:text-purple-600 p-3 rounded-2xl hover:bg-white transition-all shadow-none hover:shadow-lg"
                    >
                      <MoreVertical size={24} />
                    </button>
                    
                    {activeMenu === patient._id && (
                      <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-white border border-gray-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 py-3 w-56 animate-in zoom-in-95 duration-300">
                        <button 
                          onClick={() => {
                            setEditingPatient(patient);
                            setFormData({
                              ...patient,
                              medical_alerts: patient.medical_alerts?.join(', ') || '',
                              date_of_birth: patient.date_of_birth ? new Date(patient.date_of_birth).toISOString().split('T')[0] : ''
                            });
                            setShowModal(true);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center justify-between px-6 py-3 text-sm font-black text-zinc-900 hover:bg-purple-50 hover:text-purple-600 transition-all group/btn"
                        >
                          Modify Protocol <ArrowUpRight size={16} className="text-gray-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </button>
                        <div className="h-[1px] bg-gray-50 my-1 mx-4" />
                        <button 
                          onClick={() => { handleDelete(patient._id); setActiveMenu(null); }}
                          className="w-full flex items-center justify-between px-6 py-3 text-sm font-black text-red-500 hover:bg-red-50 transition-all"
                        >
                          Archive Asset <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30 grayscale">
                       <Users size={64} className="text-gray-400" />
                       <p className="text-lg font-bold text-gray-500 italic">Registry synchronization yielded zero results.</p>
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
                  {editingPatient ? 'Modify Record' : 'Global Admission'}
                </h2>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] mt-4">Authorized Clinical Ingestion Node 01</p>
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
                <span className="text-[11px] font-black text-purple-600 uppercase tracking-[0.4em] whitespace-nowrap">Identity Matrix</span>
                <div className="h-[2px] w-full bg-gradient-to-r from-purple-100 to-transparent" />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Full Legal Name *</label>
                <div className="relative group">
                  <User size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-purple-600 transition-colors" />
                  <input type="text" required placeholder="Enter primary identity..." className="w-full bg-gray-50 border-2 border-transparent text-zinc-900 pl-16 pr-8 py-6 rounded-[1.8rem] outline-none focus:bg-white focus:border-purple-200 transition-all text-base font-black shadow-inner" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Secure Contact Axis *</label>
                <div className="relative group">
                  <Phone size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-purple-600 transition-colors" />
                  <input type="text" required placeholder="+0 000 000 0000" className="w-full bg-gray-50 border-2 border-transparent text-zinc-900 pl-16 pr-8 py-6 rounded-[1.8rem] outline-none focus:bg-white focus:border-purple-200 transition-all text-base font-black shadow-inner" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Secure Digital Mail</label>
                <div className="relative group">
                  <Mail size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-purple-600 transition-colors" />
                  <input type="email" placeholder="patient@mesh.net" className="w-full bg-gray-50 border-2 border-transparent text-zinc-900 pl-16 pr-8 py-6 rounded-[1.8rem] outline-none focus:bg-white focus:border-purple-200 transition-all text-base font-black shadow-inner" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Temporal Birth</label>
                  <input type="date" className="w-full bg-gray-50 border-2 border-transparent text-zinc-900 px-8 py-6 rounded-[1.8rem] outline-none focus:bg-white focus:border-purple-200 transition-all text-sm font-black shadow-inner" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Identity Spectrum</label>
                  <select className="w-full bg-gray-50 border-2 border-transparent text-zinc-900 px-8 py-6 rounded-[1.8rem] outline-none focus:bg-white focus:border-purple-200 transition-all text-sm font-black shadow-inner appearance-none cursor-pointer" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other Protocol</option>
                  </select>
                </div>
              </div>

              {/* Emergency & Language */}
              <div className="col-span-2 flex items-center gap-6 mt-6 mb-2">
                <span className="text-[11px] font-black text-purple-600 uppercase tracking-[0.4em] whitespace-nowrap">Social & Linguistic Configuration</span>
                <div className="h-[2px] w-full bg-gradient-to-r from-purple-100 to-transparent" />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Care Contact Identifier</label>
                <input type="text" placeholder="Authorized representative" className="w-full bg-gray-50 border-2 border-transparent text-zinc-900 px-8 py-6 rounded-[1.8rem] outline-none focus:bg-white focus:border-purple-200 transition-all text-sm font-black shadow-inner" value={formData.emergency_contact_name} onChange={e => setFormData({...formData, emergency_contact_name: e.target.value})} />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Care Contact Axis</label>
                <input type="text" placeholder="+0..." className="w-full bg-gray-50 border-2 border-transparent text-zinc-900 px-8 py-6 rounded-[1.8rem] outline-none focus:bg-white focus:border-purple-200 transition-all text-sm font-black shadow-inner" value={formData.emergency_contact_phone} onChange={e => setFormData({...formData, emergency_contact_phone: e.target.value})} />
              </div>

              {/* Medical & Insurance */}
              <div className="col-span-2 flex items-center gap-6 mt-6 mb-2">
                <span className="text-[11px] font-black text-purple-600 uppercase tracking-[0.4em] whitespace-nowrap">Diagnostic & Insurance Matrix</span>
                <div className="h-[2px] w-full bg-gradient-to-r from-purple-100 to-transparent" />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Insurance Provider Node</label>
                <div className="relative group">
                  <ShieldCheck size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-purple-600 transition-colors" />
                  <input type="text" placeholder="Authorized Provider..." className="w-full bg-gray-50 border-2 border-transparent text-zinc-900 pl-16 pr-8 py-6 rounded-[1.8rem] outline-none focus:bg-white focus:border-purple-200 transition-all text-sm font-black shadow-inner" value={formData.insurance_provider} onChange={e => setFormData({...formData, insurance_provider: e.target.value})} />
                </div>
              </div>

              <div className="col-span-2 space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Critical Health Alerts (comma separated)</label>
                <div className="relative group">
                  <HeartPulse size={20} className="absolute left-6 top-6 text-red-400 group-focus-within:animate-pulse" />
                  <textarea rows={2} placeholder="Allergies, chronic vectors, etc..." className="w-full bg-red-50/20 border-2 border-red-50 text-zinc-900 pl-16 pr-8 py-6 rounded-[2rem] outline-none focus:bg-white focus:border-red-200 transition-all text-sm font-black shadow-inner resize-none" value={formData.medical_alerts} onChange={e => setFormData({...formData, medical_alerts: e.target.value})} />
                </div>
              </div>

              <div className="col-span-2 pt-10 flex gap-10">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white text-gray-400 py-7 rounded-[2.2rem] font-black uppercase tracking-[0.3em] text-xs border-2 border-gray-100 hover:bg-gray-50 hover:text-zinc-900 transition-all shadow-sm">Discard Protocol</button>
                <button type="submit" className="flex-1 bg-zinc-900 text-white py-7 rounded-[2.2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-zinc-900/20 hover:bg-purple-600 hover:-translate-y-1 transition-all active:scale-95">Commit Asset To Registry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

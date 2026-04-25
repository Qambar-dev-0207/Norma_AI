import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Search, Plus, MoreVertical, Edit2, Trash2, Loader2, X,
  Phone, User, MapPin, FileText, Mail, Calendar, Languages, ShieldCheck, AlertCircle, HeartPulse
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
      setError(err.response?.data?.detail || 'Clinical ingestion failed. Check terminal connection.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Archive this patient record?')) return;
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
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#44ddc1]" size={40} />
        <p className="text-[#85948f] font-bold uppercase tracking-widest text-xs">Accessing Clinical Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-[#dae2fd] tracking-tighter">Clinical Registry</h1>
          <p className="text-[#85948f] mt-1 font-medium">Global patient identification and lifecycle management.</p>
        </div>
        <button 
          onClick={() => { setEditingPatient(null); setFormData(initialForm); setError(''); setShowModal(true); }}
          className="bg-[#44ddc1] text-[#00382f] px-6 py-3 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(68,221,193,0.3)] hover:shadow-[0_0_30px_rgba(68,221,193,0.5)] transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Register New Patient
        </button>
      </div>

      <div className="bg-[#131b2e] p-4 rounded-2xl border border-[#3c4a46]/10 flex items-center gap-4">
        <Search size={20} className="text-[#85948f] ml-2" />
        <input 
          type="text" 
          placeholder="Search by name, phone, or UUID..." 
          className="bg-transparent border-none outline-none text-[#dae2fd] w-full py-2 placeholder-[#85948f]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-[#131b2e] rounded-2xl border border-[#3c4a46]/10 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#3c4a46]/10 bg-[#171f33]/50">
              <th className="px-8 py-5 text-[11px] font-bold text-[#85948f] uppercase tracking-wider">Patient Identifer</th>
              <th className="px-8 py-5 text-[11px] font-bold text-[#85948f] uppercase tracking-wider">Contact</th>
              <th className="px-8 py-5 text-[11px] font-bold text-[#85948f] uppercase tracking-wider">Clinical Status</th>
              <th className="px-8 py-5 text-[11px] font-bold text-[#85948f] uppercase tracking-wider">Insurance</th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3c4a46]/5">
            {filteredPatients.map((patient) => (
              <tr key={patient._id} className="hover:bg-[#171f33]/40 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0b1326] border border-[#3c4a46]/20 flex items-center justify-center text-xs font-bold text-[#44ddc1]">
                      {patient.full_name?.split(' ').map((n: any) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#dae2fd]">{patient.full_name}</p>
                      <p className="text-[10px] font-mono text-[#85948f] uppercase">UUID: {patient.patient_uuid?.slice(0,8)}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <p className="text-sm font-bold text-[#dae2fd]">{patient.phone_number}</p>
                  <p className="text-[10px] text-[#85948f]">{patient.email || 'No email'}</p>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${patient.is_active ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} uppercase`}>
                      {patient.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {patient.medical_alerts?.length > 0 && (
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 uppercase flex items-center gap-1">
                        <AlertCircle size={10} /> {patient.medical_alerts.length} Alerts
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <p className="text-sm font-medium text-[#dae2fd]">{patient.insurance_provider || 'Self-Pay'}</p>
                  <p className="text-[10px] text-[#85948f]">{patient.insurance_id || '-'}</p>
                </td>
                <td className="px-8 py-5 text-right relative">
                  <button 
                    onClick={() => setActiveMenu(activeMenu === patient._id ? null : patient._id)}
                    className="text-[#85948f] hover:text-[#dae2fd] p-1 transition-colors"
                  >
                    <MoreVertical size={20} />
                  </button>
                  
                  {activeMenu === patient._id && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 bg-[#171f33] border border-[#3c4a46]/20 rounded-xl shadow-2xl z-50 py-2 w-48 animate-in zoom-in-95 duration-200">
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
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-[#dae2fd] hover:bg-[#44ddc1]/10 hover:text-[#44ddc1] transition-colors"
                      >
                        <Edit2 size={16} /> Clinical Update
                      </button>
                      <button 
                        onClick={() => { handleDelete(patient._id); setActiveMenu(null); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={16} /> Archive Record
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
        <div className="fixed inset-0 bg-[#060e20]/90 backdrop-blur-xl flex items-center justify-center z-[100] p-6">
          <div className="bg-[#131b2e] border border-[#3c4a46]/20 rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-[#3c4a46]/10 flex justify-between items-center bg-[#171f33]/50">
              <div>
                <h2 className="text-2xl font-bold text-[#dae2fd] tracking-tight">
                  {editingPatient ? 'Update Clinical Profile' : 'Global Patient Registration'}
                </h2>
                <p className="text-xs text-[#85948f] font-medium mt-1">Fill all required diagnostic and contact fields.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="bg-[#0b1326] p-2 rounded-full text-[#85948f] hover:text-red-400 border border-[#3c4a46]/20">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mx-8 mt-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold uppercase animate-in shake duration-500">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="p-10 grid grid-cols-2 gap-x-10 gap-y-6 overflow-y-auto max-h-[70vh]">
              {/* Primary Identity */}
              <div className="col-span-2 flex items-center gap-2 mb-2">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#3c4a46]/30" />
                <span className="text-[10px] font-bold text-[#44ddc1] uppercase tracking-[0.3em]">Identity & Contact</span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#3c4a46]/30" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">Full Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#85948f]" />
                  <input type="text" required placeholder="e.g. John Alexander Smith" className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] pl-12 pr-4 py-3 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all text-sm" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">International Phone *</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#85948f]" />
                  <input type="text" required placeholder="e.g. +971 50 123 4567" className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] pl-12 pr-4 py-3 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all text-sm" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#85948f]" />
                  <input type="email" placeholder="patient@example.com" className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] pl-12 pr-4 py-3 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">DOB</label>
                  <input type="date" className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] px-4 py-3 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all text-sm [color-scheme:dark]" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">Gender</label>
                  <select className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] px-4 py-3 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all text-sm appearance-none" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">N/A</option>
                  </select>
                </div>
              </div>

              {/* Emergency & Language */}
              <div className="col-span-2 flex items-center gap-2 mt-4 mb-2">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#3c4a46]/30" />
                <span className="text-[10px] font-bold text-[#44ddc1] uppercase tracking-[0.3em]">Care & Emergency</span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#3c4a46]/30" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">Emergency Contact Name</label>
                <input type="text" placeholder="Contact person name" className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] px-4 py-3 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all text-sm" value={formData.emergency_contact_name} onChange={e => setFormData({...formData, emergency_contact_name: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">Emergency Phone</label>
                <input type="text" placeholder="+1..." className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] px-4 py-3 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all text-sm" value={formData.emergency_contact_phone} onChange={e => setFormData({...formData, emergency_contact_phone: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">Preferred Language</label>
                <div className="relative">
                  <Languages size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#85948f]" />
                  <select className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] pl-12 pr-4 py-3 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all text-sm appearance-none" value={formData.preferred_language} onChange={e => setFormData({...formData, preferred_language: e.target.value})}>
                    <option value="ar">Arabic (ar)</option>
                    <option value="en">English (en)</option>
                  </select>
                </div>
              </div>

              {/* Insurance & Alerts */}
              <div className="col-span-2 flex items-center gap-2 mt-4 mb-2">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#3c4a46]/30" />
                <span className="text-[10px] font-bold text-[#44ddc1] uppercase tracking-[0.3em]">Medical & Insurance</span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#3c4a46]/30" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">Insurance Provider</label>
                <div className="relative">
                  <ShieldCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#85948f]" />
                  <input type="text" placeholder="e.g. AXA, Cigna, Bupa" className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] pl-12 pr-4 py-3 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all text-sm" value={formData.insurance_provider} onChange={e => setFormData({...formData, insurance_provider: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">Insurance ID</label>
                <input type="text" placeholder="Policy or member number" className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] px-4 py-3 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all text-sm" value={formData.insurance_id} onChange={e => setFormData({...formData, insurance_id: e.target.value})} />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">Medical Alerts (Allergies, Conditions - comma separated)</label>
                <div className="relative">
                  <HeartPulse size={16} className="absolute left-4 top-4 text-red-400" />
                  <textarea rows={2} placeholder="e.g. Penicillin allergy, Type 2 Diabetes, Hypertension..." className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] pl-12 pr-4 py-3 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all text-sm resize-none" value={formData.medical_alerts} onChange={e => setFormData({...formData, medical_alerts: e.target.value})} />
                </div>
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">Clinical Notes</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-4 top-4 text-[#85948f]" />
                  <textarea rows={3} placeholder="Additional clinical observations, history, or social context..." className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] pl-12 pr-4 py-3 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all text-sm resize-none" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                </div>
              </div>

              <div className="col-span-2 pt-6 flex gap-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-[#171f33] text-[#dae2fd] py-5 rounded-2xl font-bold border border-[#3c4a46]/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all">Discard Changes</button>
                <button type="submit" className="flex-1 bg-[#44ddc1] text-[#00382f] py-5 rounded-2xl font-bold shadow-[0_0_30px_rgba(68,221,193,0.3)] hover:shadow-[0_0_40px_rgba(68,221,193,0.5)] transition-all">Commit Clinical Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

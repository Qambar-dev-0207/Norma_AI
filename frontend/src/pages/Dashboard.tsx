import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Calendar, Users, MessageSquare, Clock, MoreVertical, ChevronRight, Loader2, Plus, X, Stethoscope, Phone, User, MapPin } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
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
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#44ddc1]" size={40} />
        <p className="text-[#85948f] font-bold uppercase tracking-widest text-xs animate-pulse">Syncing with Clinical Data Mesh...</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Today\'s Appointments', value: stats?.today_appointments || 0, icon: Calendar, trend: '+12%', color: '#44ddc1' },
    { label: 'Total Patients', value: stats?.total_patients || 0, icon: Users, trend: '+3%', color: '#9ed1c3' },
    { label: 'AI Interactions', value: stats?.ai_interactions || 0, icon: MessageSquare, trend: '+28%', color: '#44ddc1' },
    { label: 'Clinic Efficiency', value: stats?.efficiency || '94%', icon: Activity, trend: '+5%', color: '#9ed1c3' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-[#dae2fd] tracking-tighter">Clinical Intelligence Overview</h1>
          <p className="text-[#85948f] mt-1 font-medium">Real-time telemetry and AI-driven clinic orchestration.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowPatientModal(true)}
            className="bg-[#171f33] border border-[#3c4a46]/20 px-4 py-2 rounded-lg text-sm font-bold text-[#dae2fd] hover:bg-[#222a3d] transition-all flex items-center gap-2"
          >
            <Plus size={16} className="text-[#44ddc1]" /> Add Patient
          </button>
          <button 
            onClick={() => setShowAptModal(true)}
            className="bg-[#44ddc1] text-[#00382f] px-6 py-2 rounded-lg text-sm font-bold shadow-[0_0_20px_rgba(68,221,193,0.3)] hover:shadow-[0_0_30px_rgba(68,221,193,0.5)] transition-all flex items-center gap-2"
          >
            <Calendar size={16} /> New Appointment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-[#131b2e] p-6 rounded-2xl border border-[#3c4a46]/10 relative overflow-hidden group hover:border-[#44ddc1]/30 transition-all duration-500">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#44ddc1] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-[#0b1326] text-[#44ddc1] border border-[#3c4a46]/20">
                  <Icon size={24} />
                </div>
                <span className="text-[10px] font-bold text-[#44ddc1] bg-[#44ddc1]/10 px-2 py-1 rounded-full">{stat.trend}</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#85948f] uppercase tracking-[0.15em] mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-[#dae2fd] tracking-tight">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-[#131b2e] rounded-2xl border border-[#3c4a46]/10 lg:col-span-2 overflow-hidden">
          <div className="p-6 border-b border-[#3c4a46]/10 flex justify-between items-center bg-[#171f33]/50">
            <h2 className="text-lg font-bold text-[#dae2fd] tracking-tight flex items-center gap-2">
              <Clock size={18} className="text-[#44ddc1]" />
              Upcoming Schedule
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#3c4a46]/5">
                  <th className="px-6 py-4 text-[11px] font-bold text-[#85948f] uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#85948f] uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#85948f] uppercase tracking-wider">Specialty</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#85948f] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3c4a46]/5">
                {appointments.slice(0, 5).map((apt) => (
                  <tr key={apt._id} className="hover:bg-[#171f33]/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0b1326] border border-[#3c4a46]/20 flex items-center justify-center text-[10px] font-bold text-[#44ddc1]">
                          {apt.patient_name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#dae2fd]">{apt.patient_name}</p>
                          <p className="text-[10px] text-[#85948f]">{apt.patient_phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#dae2fd]">
                      {new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-[#85948f] bg-[#171f33] px-2 py-1 rounded-md border border-[#3c4a46]/10 uppercase">
                        {apt.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          apt.status.toLowerCase() === 'completed' ? 'bg-[#44ddc1]' : 'bg-yellow-400'
                        } shadow-[0_0_8px_currentColor]`} />
                        <span className="text-[11px] font-bold text-[#dae2fd] capitalize">{apt.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[#85948f] hover:text-[#dae2fd] p-1">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-[#131b2e] p-6 rounded-2xl border border-[#3c4a46]/10">
          <h2 className="text-lg font-bold text-[#dae2fd] tracking-tight mb-6 flex items-center gap-2">
            <Activity size={18} className="text-[#44ddc1]" />
            AI Sentinel Activity
          </h2>
          <div className="space-y-6">
            {[
              { user: '+1415...8886', action: 'booked via WhatsApp', time: '2m ago', color: '#44ddc1' },
              { user: 'System', action: 'analyzed Patient_List.xlsx', time: '15m ago', color: '#9ed1c3' },
              { user: '+1987...4321', action: 'rescheduled appointment', time: '1h ago', color: '#ffb4a1' },
              { user: 'Dr. Connor', action: 'added medical note', time: '3h ago', color: '#44ddc1' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 relative">
                {i !== 3 && <div className="absolute top-6 left-2.5 w-[1px] h-8 bg-[#3c4a46]/20" />}
                <div className="w-5 h-5 rounded-full border-2 border-[#0b1326] shadow-lg flex-shrink-0 z-10" style={{ backgroundColor: item.color }} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#dae2fd] leading-tight">
                    <span className="text-[#44ddc1]">{item.user}</span> {item.action}
                  </p>
                  <p className="text-[10px] text-[#85948f] mt-1 font-bold uppercase tracking-wider">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Modal */}
      {showPatientModal && (
        <div className="fixed inset-0 bg-[#060e20]/80 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-[#131b2e] border border-[#3c4a46]/20 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-[#3c4a46]/10 flex justify-between items-center bg-[#171f33]/50">
              <h2 className="text-xl font-bold text-[#dae2fd]">New Patient Ingestion</h2>
              <button onClick={() => setShowPatientModal(false)} className="text-[#85948f] hover:text-[#dae2fd]"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddPatient} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#85948f]" />
                    <input type="text" required className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] pl-10 pr-4 py-3 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all text-sm" value={patientForm.full_name} onChange={e => setPatientForm({...patientForm, full_name: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative"><Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#85948f]" />
                    <input type="text" required className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] pl-10 pr-4 py-3 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all text-sm" value={patientForm.phone} onChange={e => setPatientForm({...patientForm, phone: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">Address</label>
                <div className="relative"><MapPin size={16} className="absolute left-3 top-4 text-[#85948f]" />
                  <textarea rows={2} className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] pl-10 pr-4 py-3 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all text-sm resize-none" value={patientForm.address} onChange={e => setPatientForm({...patientForm, address: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#44ddc1] text-[#00382f] py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(68,221,193,0.2)] hover:shadow-[0_0_30px_rgba(68,221,193,0.4)] transition-all">Commit Record</button>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      {showAptModal && (
        <div className="fixed inset-0 bg-[#060e20]/80 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-[#131b2e] border border-[#3c4a46]/20 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-[#3c4a46]/10 flex justify-between items-center bg-[#171f33]/50">
              <h2 className="text-xl font-bold text-[#dae2fd]">Schedule New Encounter</h2>
              <button onClick={() => setShowAptModal(false)} className="text-[#85948f] hover:text-[#dae2fd]"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddApt} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">Select Patient</label>
                <select required className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] px-4 py-3 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all text-sm appearance-none" value={aptForm.patient_id} onChange={e => setAptForm({...aptForm, patient_id: e.target.value})}>
                  <option value="">Choose from registry...</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.full_name} ({p.phone})</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">Date & Time</label>
                <input type="datetime-local" required className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] px-4 py-3 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all text-sm [color-scheme:dark]" value={aptForm.scheduled_at} onChange={e => setAptForm({...aptForm, scheduled_at: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#85948f] uppercase tracking-widest ml-1">Encounter Type</label>
                <input type="text" required className="w-full bg-[#0b1326] border border-[#3c4a46]/20 text-[#dae2fd] px-4 py-3 rounded-xl outline-none focus:border-[#44ddc1]/40 transition-all text-sm" value={aptForm.type} onChange={e => setAptForm({...aptForm, type: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-[#44ddc1] text-[#00382f] py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(68,221,193,0.2)] hover:shadow-[0_0_30px_rgba(68,221,193,0.4)] transition-all">Confirm Appointment</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import axios from 'axios';
import { Upload, FileType, CheckCircle, AlertCircle, FileSpreadsheet, Loader2, ArrowRight, ShieldCheck, DatabaseZap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BulkUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [summary, setSummary] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setSummary(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post('http://localhost:5000/api/uploads/excel', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setSummary(res.data.summary);
      setStatus('success');
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.response?.data?.detail || error.message || 'Data integration failed');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-20 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#dae2fd] tracking-tight uppercase italic">Data Ingestion</h1>
          <p className="text-[#85948f] mt-2 font-medium text-lg italic">High-fidelity clinical record synchronization and reconciliation.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#44ddc1]/5 border border-[#44ddc1]/20">
           <ShieldCheck size={16} className="text-[#44ddc1]" />
           <span className="text-[10px] font-black text-[#44ddc1] uppercase tracking-widest">Secure Ingestion Node</span>
        </div>
      </div>

      <div className="glass-surface p-10 md:p-16 rounded-[3rem] border border-white/5 relative overflow-hidden bg-[#131b2e]/50">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#44ddc1]/5 blur-[100px] -mr-48 -mt-48 -z-10 rounded-full" />
        
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-[#0b1326] flex items-center justify-center text-[#44ddc1] shadow-xl border border-[#44ddc1]/10 mb-6">
              <DatabaseZap size={32} />
            </div>
            <h2 className="text-2xl font-black text-[#dae2fd] tracking-tight uppercase italic">Upload Dataset</h2>
          </div>
          
          <div className="border-4 border-dashed border-[#3c4a46]/20 rounded-[2.5rem] p-12 md:p-20 text-center group hover:border-[#44ddc1]/40 transition-all duration-700 bg-[#0b1326]/30 hover:bg-[#0b1326]/50 relative overflow-hidden">
            <div className="relative z-10">
              <div className="mx-auto h-24 w-24 bg-[#131b2e] rounded-3xl border border-white/5 shadow-2xl flex items-center justify-center text-[#3c4a46] group-hover:text-[#44ddc1] group-hover:scale-110 transition-all duration-700 mb-8">
                <Upload size={40} />
              </div>
              <h3 className="text-2xl font-black text-[#dae2fd] mb-3 uppercase tracking-tight italic">Select Clinical Manifest</h3>
              <p className="text-[#85948f] mb-10 max-w-sm mx-auto font-bold text-sm uppercase tracking-wider leading-relaxed opacity-70">Supports standardized .xlsx and .xls formats only.</p>
              
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept=".xlsx, .xls" 
                onChange={handleFileChange}
              />
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer btn-clinical inline-flex items-center gap-4"
              >
                <FileType size={20} />
                Browse Local Storage
              </label>
              
              {file && (
                <div className="mt-12 flex items-center justify-center gap-5 text-[#dae2fd] bg-[#131b2e] py-5 px-8 rounded-2xl w-fit mx-auto border border-[#44ddc1]/20 shadow-2xl animate-in zoom-in-95">
                  <div className="p-2 bg-[#44ddc1]/10 rounded-xl text-[#44ddc1]">
                    <FileType size={24} />
                  </div>
                  <div className="text-left">
                    <span className="font-black text-sm tracking-tight block truncate max-w-[200px]">{file.name}</span>
                    <span className="text-[10px] font-black text-[#85948f] uppercase tracking-widest mt-0.5">{(file.size / 1024).toFixed(1)} KB • Verified File</span>
                  </div>
                  <button onClick={() => setFile(null)} className="ml-4 text-[#85948f] hover:text-red-400 transition-colors">
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-12 flex flex-col items-center">
            <button
              onClick={handleUpload}
              disabled={!file || status === 'uploading'}
              className={`w-full group relative py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-2xl ${
                !file || status === 'uploading' 
                  ? 'bg-white/5 text-[#3c4a46] cursor-not-allowed border border-white/5' 
                  : 'bg-[#44ddc1] text-[#00382f] hover:shadow-[0_0_40px_rgba(68,221,193,0.3)]'
              }`}
            >
              {status === 'uploading' ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Analyzing Clinical Patterns...
                </>
              ) : (
                <>
                  Authorize Ingestion
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
                </>
              )}
            </button>
            <p className="mt-6 text-[9px] font-black text-[#85948f] uppercase tracking-[0.3em] opacity-40 italic">End-to-end encrypted protocol active</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {status === 'success' && summary && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-[#131b2e] p-12 rounded-[3rem] border border-[#44ddc1]/20 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center gap-6 text-[#dae2fd] mb-12 relative z-10">
              <div className="bg-[#44ddc1]/20 p-5 rounded-3xl text-[#44ddc1] border border-[#44ddc1]/20">
                <CheckCircle size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Ingestion Complete</h2>
                <p className="text-xs text-[#85948f] font-bold uppercase tracking-widest mt-2 italic">Data reconciliation successful</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-12 relative z-10">
              {[
                { label: 'Identified Assets', value: summary.total, color: 'text-[#dae2fd]' },
                { label: 'New Records', value: summary.inserted, color: 'text-[#44ddc1]' },
                { label: 'Reconciled', value: summary.skipped, color: 'text-[#85948f]' },
                { label: 'Anomalies', value: summary.errors.length, color: 'text-red-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-[#0b1326] p-8 rounded-3xl border border-white/5 flex flex-col shadow-inner">
                  <p className="text-[9px] font-black text-[#85948f] uppercase tracking-[0.2em] mb-3">{stat.label}</p>
                  <p className={`text-4xl font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {summary.errors.length > 0 && (
              <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-400" />
                  <h3 className="font-black text-[#dae2fd] uppercase tracking-widest text-xs italic">Anomaly diagnostic report</h3>
                </div>
                <div className="bg-[#0b1326] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
                  <table className="w-full text-left">
                    <thead className="bg-[#171f33] border-b border-white/5">
                      <tr>
                        <th className="px-8 py-6 text-[9px] font-black text-[#85948f] uppercase tracking-widest">Reference Row</th>
                        <th className="px-8 py-6 text-[9px] font-black text-[#85948f] uppercase tracking-widest">AI Diagnostic Output</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[#dae2fd]">
                      {summary.errors.map((err: any, idx: number) => (
                        <tr key={idx} className="hover:bg-[#171f33] transition-colors group">
                          <td className="px-8 py-6">
                            <span className="text-sm font-black group-hover:text-[#44ddc1] transition-colors">Row Vector {err.row}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-sm text-red-400 font-bold tracking-tight opacity-80">{err.reason}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {status === 'error' && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#131b2e] p-10 rounded-[3rem] border border-red-500/20 flex items-start gap-8 shadow-2xl"
          >
            <div className="bg-red-500/10 p-5 rounded-3xl border border-red-500/20 text-red-400 shadow-inner">
              <AlertCircle size={32} />
            </div>
            <div className="flex-1 pt-2">
              <h3 className="text-2xl font-black text-red-400 mb-2 uppercase tracking-tighter italic">Integration Failure</h3>
              <p className="text-[#85948f] font-bold text-lg leading-relaxed italic">The clinical sentinel could not establish a data link: {errorMsg}</p>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-8 bg-[#0b1326] text-[#dae2fd] px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all shadow-2xl border border-white/5"
              >
                Initialize Retry Protocol
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

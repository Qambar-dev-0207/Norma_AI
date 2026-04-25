import { useState } from 'react';
import axios from 'axios';
import { Upload, FileType, CheckCircle, AlertCircle, FileSpreadsheet, Loader2, ArrowRight, ShieldCheck, DatabaseZap } from 'lucide-react';

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
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight uppercase">Data Ingestion</h1>
          <p className="text-gray-500 mt-2 font-medium text-lg italic">High-fidelity clinical record synchronization and reconciliation.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-purple-50 border border-purple-100">
           <ShieldCheck size={16} className="text-purple-600" />
           <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Secure Ingestion Node</span>
        </div>
      </div>

      <div className="bg-white p-10 md:p-16 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-50/50 blur-[100px] -mr-48 -mt-48 -z-10 rounded-full" />
        
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-purple-400">
              <DatabaseZap size={24} />
            </div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">Upload Dataset</h2>
          </div>
          
          <div className="border-4 border-dashed border-gray-100 rounded-[2.5rem] p-12 md:p-20 text-center group hover:border-purple-200 transition-all duration-700 bg-gray-50/30 hover:bg-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="mx-auto h-24 w-24 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 flex items-center justify-center text-gray-300 group-hover:text-purple-600 group-hover:scale-110 transition-all duration-700 mb-8">
                <Upload size={40} />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 mb-3 uppercase tracking-tight">Select Clinical Manifest</h3>
              <p className="text-gray-400 mb-10 max-w-sm mx-auto font-bold text-sm uppercase tracking-wider leading-relaxed">System supports standardized .xlsx and .xls formats only.</p>
              
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept=".xlsx, .xls" 
                onChange={handleFileChange}
              />
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer bg-zinc-900 text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-purple-600 transition-all inline-flex items-center gap-4 shadow-2xl shadow-zinc-900/20 active:scale-95"
              >
                <FileType size={20} className="text-purple-400" />
                Browse Local Storage
              </label>
              
              {file && (
                <div className="mt-12 flex items-center justify-center gap-5 text-zinc-900 bg-white py-5 px-8 rounded-2xl w-fit mx-auto border border-gray-100 shadow-xl shadow-gray-200/30 animate-in zoom-in-95">
                  <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                    <FileType size={24} />
                  </div>
                  <div className="text-left">
                    <span className="font-black text-sm tracking-tight block truncate max-w-[200px]">{file.name}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{(file.size / 1024).toFixed(1)} KB • Verified File</span>
                  </div>
                  <button onClick={() => setFile(null)} className="ml-4 text-gray-300 hover:text-red-500 transition-colors">
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
            {/* Decorative background grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          </div>
          
          <div className="mt-12 flex flex-col items-center">
            <button
              onClick={handleUpload}
              disabled={!file || status === 'uploading'}
              className={`w-full group relative py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-2xl ${
                !file || status === 'uploading' 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                  : 'bg-zinc-900 text-white hover:bg-purple-600 shadow-zinc-900/10'
              }`}
            >
              {status === 'uploading' ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Analyzing Neural Patterns...
                </>
              ) : (
                <>
                  Authorize Ingestion
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
                </>
              )}
            </button>
            <p className="mt-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">End-to-end encrypted session active</p>
          </div>
        </div>
      </div>

      {status === 'success' && summary && (
        <div className="bg-white p-12 rounded-[3rem] border-2 border-purple-100 shadow-2xl shadow-purple-500/5 animate-in slide-in-from-bottom-10 duration-1000 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
             <CheckCircle size={200} className="text-purple-600" />
          </div>
          
          <div className="flex items-center gap-6 text-zinc-900 mb-12 relative z-10">
            <div className="bg-purple-600 p-5 rounded-3xl text-white shadow-xl shadow-purple-500/30">
              <CheckCircle size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">Ingestion Complete</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Data reconciliation cycle successful</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-12 relative z-10">
            {[
              { label: 'Identified Assets', value: summary.total, color: 'text-zinc-900' },
              { label: 'New Records', value: summary.inserted, color: 'text-purple-600' },
              { label: 'Reconciled', value: summary.skipped, color: 'text-gray-400' },
              { label: 'Anomalies', value: summary.errors.length, color: 'text-red-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-50/50 p-8 rounded-3xl border border-gray-100 flex flex-col">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">{stat.label}</p>
                <p className={`text-4xl font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {summary.errors.length > 0 && (
            <div className="space-y-8 relative z-10">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-red-500" />
                <h3 className="font-black text-zinc-900 uppercase tracking-widest text-sm">Anomaly diagnostic report</h3>
              </div>
              <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reference Row</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Diagnostic Output</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {summary.errors.map((err: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <span className="text-sm font-black text-zinc-900 group-hover:text-purple-600 transition-colors">Row Vector {err.row}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-sm text-red-500 font-bold tracking-tight">{err.reason}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="bg-white p-10 rounded-[3rem] border-2 border-red-100 flex items-start gap-8 shadow-2xl shadow-red-500/5 animate-in bounce-in duration-700">
          <div className="bg-red-50 p-5 rounded-3xl border border-red-100 text-red-500 shadow-inner">
            <AlertCircle size={32} />
          </div>
          <div className="flex-1 pt-2">
            <h3 className="text-2xl font-black text-zinc-900 mb-2 uppercase tracking-tighter">Integration Failure</h3>
            <p className="text-gray-500 font-bold text-lg leading-relaxed italic">{errorMsg}</p>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-8 bg-zinc-900 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-500 transition-all shadow-xl shadow-red-500/10"
            >
              Initialize Retry Protocol
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

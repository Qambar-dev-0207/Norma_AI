import { useState } from 'react';
import axios from 'axios';
import { Upload, FileType, CheckCircle, AlertCircle, FileSpreadsheet, Loader2 } from 'lucide-react';

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
      setErrorMsg(error.response?.data?.detail || error.message || 'Upload failed');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-bold text-[#dae2fd] tracking-tighter">Bulk Data Orchestration</h1>
        <p className="text-[#85948f] mt-1 font-medium">Inject large-scale patient records into the NORMA AI network.</p>
      </div>

      <div className="bg-[#131b2e] p-10 rounded-2xl border border-[#3c4a46]/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#44ddc1]/5 blur-[100px] -mr-32 -mt-32" />
        
        <h2 className="text-xl font-bold text-[#dae2fd] mb-8 tracking-tight flex items-center gap-3">
          <FileSpreadsheet className="text-[#44ddc1]" />
          Record Ingestion
        </h2>
        
        <div className="border-2 border-dashed border-[#3c4a46]/20 rounded-2xl p-16 text-center group hover:border-[#44ddc1]/40 transition-all duration-500 bg-[#0b1326]/50">
          <div className="mx-auto h-20 w-20 bg-[#171f33] rounded-2xl border border-[#3c4a46]/20 flex items-center justify-center text-[#85948f] group-hover:text-[#44ddc1] group-hover:border-[#44ddc1]/30 transition-all duration-500 mb-6">
            <Upload size={32} />
          </div>
          <h3 className="text-xl font-bold text-[#dae2fd] mb-2 tracking-tight">Upload Patient Manifest</h3>
          <p className="text-[#85948f] mb-8 max-w-sm mx-auto font-medium">Standardized Excel format (.xlsx, .xls) only. AI will automatically map columns.</p>
          
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            accept=".xlsx, .xls" 
            onChange={handleFileChange}
          />
          <label 
            htmlFor="file-upload" 
            className="cursor-pointer bg-[#171f33] border border-[#3c4a46]/30 px-8 py-4 rounded-xl font-bold text-[#dae2fd] hover:bg-[#222a3d] hover:border-[#44ddc1]/40 transition-all inline-flex items-center gap-3"
          >
            <FileType size={20} className="text-[#44ddc1]" />
            Choose Manifest File
          </label>
          
          {file && (
            <div className="mt-8 flex items-center justify-center gap-4 text-[#44ddc1] bg-[#44ddc1]/5 py-4 px-6 rounded-xl w-fit mx-auto border border-[#44ddc1]/10">
              <FileType size={22} />
              <span className="font-bold tracking-tight truncate max-w-xs">{file.name}</span>
              <span className="text-[10px] font-bold bg-[#44ddc1]/20 px-2 py-0.5 rounded uppercase">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          )}
        </div>
        
        <div className="mt-10 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!file || status === 'uploading'}
            className={`px-10 py-4 rounded-xl font-bold text-[#00382f] transition-all flex items-center gap-3 shadow-xl ${
              !file || status === 'uploading' 
                ? 'bg-[#3c4a46]/20 text-[#85948f] cursor-not-allowed border border-[#3c4a46]/10' 
                : 'bg-[#44ddc1] hover:shadow-[0_0_30px_rgba(68,221,193,0.4)]'
            }`}
          >
            {status === 'uploading' && <Loader2 className="animate-spin" size={20} />}
            {status === 'uploading' ? 'Analyzing & Mapping...' : 'Initiate Ingestion'}
          </button>
        </div>
      </div>

      {status === 'success' && summary && (
        <div className="bg-[#131b2e] p-10 rounded-2xl border border-[#44ddc1]/20 shadow-2xl animate-in slide-in-from-bottom-5 duration-700">
          <div className="flex items-center gap-4 text-[#44ddc1] mb-10">
            <div className="bg-[#44ddc1]/10 p-3 rounded-full border border-[#44ddc1]/20 shadow-[0_0_20px_rgba(68,221,193,0.2)]">
              <CheckCircle size={28} />
            </div>
            <h2 className="text-2xl font-bold text-[#dae2fd] tracking-tighter">Manifest Ingested Successfully</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Total Analyzed', value: summary.total, color: '#dae2fd' },
              { label: 'New Records', value: summary.inserted, color: '#44ddc1' },
              { label: 'Reconciled', value: summary.skipped, color: '#9ed1c3' },
              { label: 'Anomalies', value: summary.errors.length, color: '#ffb4a1' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#0b1326] p-6 rounded-2xl border border-[#3c4a46]/10 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3c4a46]/20 to-transparent" />
                <p className="text-[10px] font-bold text-[#85948f] uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                <p className="text-3xl font-bold tracking-tight" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {summary.errors.length > 0 && (
            <div className="space-y-6">
              <h3 className="font-bold text-[#dae2fd] flex items-center gap-2">
                <AlertCircle size={18} className="text-[#ffb4a1]" />
                Anomaly Detection Report
              </h3>
              <div className="bg-[#0b1326] rounded-2xl overflow-hidden border border-[#3c4a46]/10">
                <table className="w-full text-left">
                  <thead className="bg-[#171f33] border-b border-[#3c4a46]/10">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-bold text-[#85948f] uppercase tracking-wider">Reference Row</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-[#85948f] uppercase tracking-wider">AI Diagnostic</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3c4a46]/5">
                    {summary.errors.map((err: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#171f33]/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-[#dae2fd]">Row {err.row}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#ffb4a1] font-medium">{err.reason}</span>
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
        <div className="bg-[#131b2e] p-8 rounded-2xl border border-red-500/20 flex items-start gap-6 shadow-2xl animate-in bounce-in duration-500">
          <div className="bg-red-500/10 p-3 rounded-full border border-red-500/20">
            <AlertCircle className="text-red-500" size={28} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-400 mb-1 tracking-tight">Ingestion Failure</h3>
            <p className="text-[#85948f] font-medium">{errorMsg}</p>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-4 text-[11px] font-bold text-[#44ddc1] uppercase tracking-widest hover:underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useProcurement } from '../../../context/ProcurementContext';
import { Search, Building2, ShieldCheck, UserCheck, Ban, Sparkles, Loader2, FileCheck, Award } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Modal from '../../../components/common/Modal';
import { Vendor } from '../../../types';
import RBACWrapper from '../../../components/common/RBACWrapper';

const VendorList: React.FC = () => {
  const { vendors } = useProcurement();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [riskReport, setRiskReport] = useState<string>('');

  const filteredVendors = vendors.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const analyzeVendorRisk = async () => {
     if (!selectedVendor) return;
     setIsAnalyzing(true);
     setRiskReport('');
     setIsAiModalOpen(true);
     try {
        if (process.env.API_KEY) {
           const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
           const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: "Analyze vendor risk..." });
           setRiskReport(response.text || "Failed.");
        } else {
           await new Promise(r => setTimeout(r, 1500));
           setRiskReport(`**Risk Level: Low.**\nVendor ${selectedVendor.name} has consistent performance (Rating: ${selectedVendor.performanceRating}). CSMS Score is healthy.`);
        }
     } catch (e) { setRiskReport("Error."); } finally { setIsAnalyzing(false); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in pb-20">
       <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
             <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Penyedia</h1>
             <p className="text-slate-500 text-sm">Database CIVD dan pemantauan kinerja.</p>
          </div>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
             <input type="text" placeholder="Cari penyedia..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:border-indigo-500 w-64" />
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><UserCheck size={20} /></div>
             <div><p className="text-xs text-slate-500 uppercase font-bold">Terverifikasi</p><p className="text-xl font-bold text-slate-900 dark:text-white">{vendors.filter(v => v.status === 'Verified').length}</p></div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
             <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><FileCheck size={20} /></div>
             <div><p className="text-xs text-slate-500 uppercase font-bold">Rata-rata CSMS</p><p className="text-xl font-bold text-slate-900 dark:text-white">82.5</p></div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
             <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><Ban size={20} /></div>
             <div><p className="text-xs text-slate-500 uppercase font-bold">Ditangguhkan</p><p className="text-xl font-bold text-slate-900 dark:text-white">{vendors.filter(v => v.status === 'Suspended').length}</p></div>
          </div>
       </div>

       <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-xs uppercase font-bold">
                <tr><th className="px-6 py-3">Nama Penyedia</th><th className="px-6 py-3">Kategori</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Rating</th><th className="px-6 py-3 text-right">Aksi</th></tr>
             </thead>
             <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredVendors.map(vendor => (
                   <tr key={vendor.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-3 font-bold text-slate-800 dark:text-white">{vendor.name}</td>
                      <td className="px-6 py-3 text-slate-500">{vendor.type}</td>
                      <td className="px-6 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${vendor.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{vendor.status}</span></td>
                      <td className="px-6 py-3"><div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300"><Award size={14} className="text-amber-400" /> {vendor.performanceRating}</div></td>
                      <td className="px-6 py-3 text-right">
                         <RBACWrapper allowedRoles={['scm']}>
                            <button onClick={() => { setSelectedVendor(vendor); analyzeVendorRisk(); }} className="text-indigo-600 font-bold text-xs hover:underline flex items-center justify-end gap-1"><Sparkles size={12} /> Audit Kinerja</button>
                         </RBACWrapper>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>

       <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="Audit Penyedia">
          <div className="p-4">
             {isAnalyzing ? <div className="py-8 text-center"><Loader2 size={32} className="animate-spin mx-auto mb-2 text-slate-400" /><p className="text-sm text-slate-500">Sedang mengaudit...</p></div> : <div className="text-sm whitespace-pre-line leading-relaxed">{riskReport}</div>}
          </div>
       </Modal>
    </div>
  );
};

export default VendorList;

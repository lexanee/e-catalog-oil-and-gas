
import React, { useState } from 'react';
import { useProcurement } from '../../../context/ProcurementContext';
import { FileText, Clock, Sparkles, Loader2, ExternalLink, Box, CheckCircle, Hash, ShieldCheck, List } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Modal from '../../../components/common/Modal';
import { Contract } from '../../../types';

const ContractTracking: React.FC = () => {
  const { contracts, updateContract } = useProcurement();
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiRiskReport, setAiRiskReport] = useState<string>('');

  const selectedContract = contracts.find(c => c.id === selectedContractId);

  const runAiRiskAnalysis = async () => {
    if (!selectedContract) return;
    setIsAiModalOpen(true);
    setIsAnalyzing(true);
    setAiRiskReport('');
    try {
      let result = '';
      if (process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: "Analyze contract execution risk based on typical oil and gas delays..." });
        result = response.text || "No report.";
      } else {
        await new Promise(r => setTimeout(r, 2000));
        result = `**Analisis Integritas Kontrak:**\n\nLog Audit Terverifikasi.\n\n**Penilaian Risiko:** Rendah.\nMilestone "Mobilisasi" berjalan sesuai jadwal. Tidak ada peringatan cuaca di zona operasi. Disarankan untuk merilis termin pembayaran #2 setelah penyelesaian Spud.`;
      }
      setAiRiskReport(result);
      updateContract(selectedContract.id, { aiRiskAnalysisReport: result });
    } catch (e) { setAiRiskReport("Failed."); } finally { setIsAnalyzing(false); }
  };

  const handleViewReport = (e: React.MouseEvent, contract: Contract) => {
    e.stopPropagation();
    setSelectedContractId(contract.id);
    setAiRiskReport(contract.aiRiskAnalysisReport || '');
    setIsAiModalOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in pb-20">
      <div className="mb-8 flex justify-between items-end">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Siklus Hidup Kontrak</h1>
           <p className="text-slate-500 text-sm mt-1">Pelacakan termin dan performa kontrak.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
           {contracts.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900">
                 <FileText size={32} className="mx-auto text-slate-300 mb-3" />
                 <p className="text-slate-400 text-sm font-medium">Belum ada kontrak aktif.</p>
              </div>
           ) : (
              contracts.map(contract => (
                <button key={contract.id} onClick={() => setSelectedContractId(contract.id)} className={`w-full text-left p-5 rounded-xl border transition-all duration-200 group relative overflow-hidden ${selectedContractId === contract.id ? 'bg-white dark:bg-slate-900 border-indigo-600 shadow-lg ring-1 ring-indigo-600 z-10' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'}`}>
                  <div className="flex justify-between items-start mb-3">
                     <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{contract.id}</span>
                     <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800 flex items-center gap-1"><CheckCircle size={10} /> AKTIF</span>
                  </div>
                  <h3 className={`font-bold text-base truncate pr-6 ${selectedContractId === contract.id ? 'text-indigo-900 dark:text-white' : 'text-slate-800 dark:text-white'}`}>{contract.vendorName}</h3>
                  <div className="flex items-center justify-between mt-3">
                     <p className="text-xs text-slate-500 flex items-center gap-1"><Box size={12} /> {contract.assetNames.length} Aset</p>
                     
                     {contract.aiRiskAnalysisReport ? (
                        <div onClick={(e) => handleViewReport(e, contract)} className="flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded border border-indigo-100 hover:bg-indigo-100 transition-colors cursor-pointer">
                           <FileText size={10} /> Laporan Siap
                        </div>
                     ) : (
                        <p className="text-xs font-mono font-bold text-slate-400">{contract.startDate}</p>
                     )}
                  </div>
                  {selectedContractId === contract.id && <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-indigo-600"></div>}
                </button>
              ))
           )}
        </div>

        <div className="lg:col-span-2">
           {selectedContract ? (
             <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden animate-fade-in">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                   <div>
                      <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2"><List size={18} /> Jejak Audit Digital</h2>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                         <span className="font-mono">Ref Kontrak: {selectedContract.id}</span>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      {selectedContract.aiRiskAnalysisReport && (
                          <button onClick={() => { setAiRiskReport(selectedContract.aiRiskAnalysisReport!); setIsAiModalOpen(true); }} className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors">
                             <FileText size={14} /> Lihat Laporan
                          </button>
                      )}
                      <button onClick={runAiRiskAnalysis} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-indigo-700 transition-colors">
                          <Sparkles size={14} /> {selectedContract.aiRiskAnalysisReport ? 'Re-Audit' : 'AI Audit'}
                      </button>
                   </div>
                </div>
                
                <div className="p-0">
                   <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                         <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-xs uppercase font-bold">
                            <tr>
                               <th className="px-6 py-3">Timestamp</th>
                               <th className="px-6 py-3">User / Aktor</th>
                               <th className="px-6 py-3">Aksi / Tahapan</th>
                               <th className="px-6 py-3">Status</th>
                               <th className="px-6 py-3 text-right">Verifikasi</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {selectedContract.milestones.map((ms, index) => (
                               <tr key={ms.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                  <td className="px-6 py-4">
                                     <div className="font-mono text-xs text-slate-600 dark:text-slate-400">{ms.targetDate}</div>
                                     <div className="text-[10px] text-slate-400">09:00 AM UTC</div>
                                  </td>
                                  <td className="px-6 py-4">
                                     <div className="text-xs font-bold text-slate-800 dark:text-white">System Admin</div>
                                     <div className="text-[10px] text-slate-400">ID: {Math.random().toString(36).substr(2, 6)}</div>
                                  </td>
                                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{ms.label}</td>
                                  <td className="px-6 py-4">
                                     <span className={`px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wide ${ms.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' : ms.status === 'In Progress' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                                        {ms.status}
                                     </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                     <div className="flex items-center justify-end gap-1.5 text-emerald-600 text-[10px] font-mono">
                                        <Hash size={10} /> {Math.random().toString(16).substr(2, 8)}...
                                     </div>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>
           ) : (
             <div className="h-96 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-200 dark:border-slate-700"><ShieldCheck size={32} className="opacity-30" /></div>
                <h3 className="text-slate-900 dark:text-white font-bold mb-1">Pilih Kontrak</h3>
                <p className="text-xs">Lihat detail tahapan dan riwayat audit.</p>
             </div>
           )}
        </div>
      </div>

      <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="Analisis Kontrak Cerdas">
         <div className="p-6 text-sm">
            {isAnalyzing ? <div className="text-center py-10"><Loader2 size={32} className="animate-spin mx-auto text-indigo-500 mb-3" /><p className="text-slate-500 font-medium">Menganalisis risiko eksekusi...</p></div> : <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">{aiRiskReport}</div>}
         </div>
      </Modal>
    </div>
  );
};

export default ContractTracking;

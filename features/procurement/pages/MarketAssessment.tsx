
import React, { useState } from 'react';
import { useMarketAssessment } from '../../../hooks/useMarketAssessment';
import { useProcurement } from '../../../context/ProcurementContext';
import { useAuth } from '../../../context/AuthContext';
import { calculateCabotagePriority, getPriorityLabel } from '../../../utils/AssetCompliance';
import { AssetCategory } from '../../../types';
import { Filter, Calendar, Save, RotateCcw, Search, CheckCircle, Lock, Play, FileText, AlertCircle, MapPin, Battery, Anchor, Truck, Ship, Sparkles, Loader2, Copy, Printer } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";

const MarketAssessment: React.FC = () => {
  const { assessment, updateFilters, updateTitle, runAssessment, saveAssessment, resetAssessment, isCalculated } = useMarketAssessment();
  const { vendors } = useProcurement();
  const { user } = useAuth();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  // AI Report State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportContent, setReportContent] = useState('');

  const handleSaveConfirm = () => {
    // Save as FINAL per PDF workflow "Simpan Hasil Asesmen"
    saveAssessment('FINAL');
    setIsConfirmOpen(false);
  };

  const isSaved = assessment.status === 'SAVED';

  const generateBeritaAcara = async () => {
    setIsAiModalOpen(true);
    setIsGenerating(true);
    setReportContent('');

    try {
      const candidatesPayload = assessment.candidates.map(asset => {
         const vendor = vendors.find(v => v.id === asset.ownerVendorId);
         const priority = calculateCabotagePriority(asset);
         return {
            name: asset.name,
            owner: vendor ? vendor.name : (asset.ownerType || 'Unknown'),
            priority: getPriorityLabel(priority),
            specs: asset.capacity
         };
      });

      const inputData = {
         User: user?.name || 'SCM Officer',
         Project: assessment.title,
         Search_Criteria: assessment.filters,
         Found_Candidates: candidatesPayload,
         Timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })
      };

      if (process.env.API_KEY) {
         const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
         const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Input Data JSON:\n${JSON.stringify(inputData, null, 2)}`,
            config: {
               systemInstruction: `You are an expert Procurement Auditor for the Oil & Gas Industry (SKK Migas Standards).
Your task is to generate a formal "Berita Acara Ketersediaan Pasar" based on the provided JSON data.

**Output Requirements:**
1. Use formal Indonesian language.
2. Start with: "BERITA ACARA ASESMEN KETERSEDIAAN PASAR".
3. Header includes Date and User.
4. "Dasar Pencarian" section summarizing criteria.
5. "Hasil Penelusuran" table of candidates.
6. Conclusion: "TERSEDIA" if candidates > 0, else "TIDAK TERSEDIA".
7. Plain text format for easy copying.`
            }
         });
         setReportContent(response.text || "Gagal membuat laporan.");
      } else {
         await new Promise(r => setTimeout(r, 2000));
         setReportContent(`BERITA ACARA ASESMEN KETERSEDIAAN PASAR\n\nTanggal: ${inputData.Timestamp}\nOleh: ${inputData.User}\n\nDASAR PENCARIAN\nProyek: ${inputData.Project}\nKategori: ${inputData.Search_Criteria.category}\nPeriode: ${inputData.Search_Criteria.startDate} s/d ${inputData.Search_Criteria.endDate}\nSyarat: Min Year ${inputData.Search_Criteria.minYear}, Cap ${inputData.Search_Criteria.minCapacity}\n\nHASIL PENELUSURAN\nDitemukan ${candidatesPayload.length} kandidat aset:\n\n${candidatesPayload.map((c,i) => `${i+1}. ${c.name} - ${c.owner} (${c.priority})`).join('\n')}\n\nKESIMPULAN\nBerdasarkan hasil penelusuran sistem e-Catalog, dinyatakan bahwa kebutuhan aset TERSEDIA.`);
      }
    } catch (e) {
       setReportContent("Terjadi kesalahan sistem saat menghubungi AI Auditor.");
    } finally {
       setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
             <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Market Assessment (Ketersediaan Pasar)</h1>
             <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${isSaved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                {isSaved ? 'Tersimpan (Final)' : 'Konsep (Draft)'}
             </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Pengecekan ketersediaan pra-tender dan penyaringan teknis.</p>
        </div>
        
        <div className="flex gap-2">
           {!isSaved && (
              <button onClick={resetAssessment} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                 <RotateCcw size={16} /> Reset
              </button>
           )}
           
           {isSaved ? (
              <div className="flex gap-2">
                 <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    <Printer size={16} /> Cetak (Print)
                 </button>
                 <button disabled className="px-4 py-2 bg-slate-100 text-slate-400 border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 cursor-not-allowed">
                    <Lock size={16} /> Terkunci
                 </button>
              </div>
           ) : (
              <div className="flex gap-2">
                 <button onClick={generateBeritaAcara} disabled={!isCalculated} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Sparkles size={16} /> Berita Acara Ketersediaan
                 </button>
                 <button onClick={() => setIsConfirmOpen(true)} disabled={!isCalculated} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Save size={16} /> Simpan Hasil Asesmen
                 </button>
              </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         
         {/* Sidebar: Filters */}
         <div className="lg:col-span-1 space-y-6">
            <div className={`bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-opacity ${isSaved ? 'opacity-75 pointer-events-none' : ''}`}>
               <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Filter size={16} className="text-indigo-600" /> Kriteria Pencarian
               </h3>
               
               <div className="space-y-4">
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-500 uppercase">Judul Asesmen</label>
                     <input 
                        type="text" 
                        value={assessment.title}
                        onChange={(e) => updateTitle(e.target.value)}
                        disabled={isSaved}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                     />
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-500 uppercase">Kategori Aset</label>
                     <div className="grid grid-cols-3 gap-1">
                        {[
                           { id: 'Onshore Rig', icon: Truck },
                           { id: 'Offshore Rig', icon: Anchor },
                           { id: 'Kapal', icon: Ship }
                        ].map(cat => (
                           <button
                              key={cat.id}
                              onClick={() => updateFilters({ category: cat.id as AssetCategory })}
                              disabled={isSaved}
                              className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all ${assessment.filters.category === cat.id ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'} border disabled:opacity-50 disabled:cursor-not-allowed`}
                           >
                              <cat.icon size={16} />
                              <span className="text-[10px] font-bold whitespace-nowrap">{cat.id.split(' ')[0]}</span>
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-500 uppercase">Periode Kebutuhan</label>
                     <div className="grid grid-cols-2 gap-2">
                        <input type="date" value={assessment.filters.startDate} onChange={(e) => updateFilters({ startDate: e.target.value })} disabled={isSaved} className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs disabled:opacity-50" />
                        <input type="date" value={assessment.filters.endDate} onChange={(e) => updateFilters({ endDate: e.target.value })} disabled={isSaved} className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs disabled:opacity-50" />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Tahun Min.</label>
                        <input type="number" value={assessment.filters.minYear} onChange={(e) => updateFilters({ minYear: parseInt(e.target.value) })} disabled={isSaved} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500 disabled:opacity-50" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Kapasitas (Min)</label>
                        <input type="number" placeholder="HP/BP" value={assessment.filters.minCapacity} onChange={(e) => updateFilters({ minCapacity: parseInt(e.target.value) })} disabled={isSaved} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500 disabled:opacity-50" />
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-500 uppercase">Wilayah (Region)</label>
                     <input placeholder="e.g. Java, Natuna" value={assessment.filters.region || ''} onChange={(e) => updateFilters({ region: e.target.value })} disabled={isSaved} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500 disabled:opacity-50" />
                  </div>

                  <button onClick={runAssessment} disabled={isSaved} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed">
                     <Play size={16} /> Jalankan Analisis
                  </button>
               </div>
            </div>

            {isCalculated && (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                    <h4 className="font-bold text-emerald-800 text-sm mb-1">Analisis Selesai</h4>
                    <p className="text-xs text-emerald-700">{assessment.candidates.length} aset ditemukan sesuai kriteria dan jadwal ketersediaan.</p>
                </div>
            )}
         </div>

         {/* Main Content: Results */}
         <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
               <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider">Kandidat Aset</h3>
                  {assessment.id !== 'NEW' && <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded">Ref: {assessment.id}</span>}
               </div>

               {assessment.candidates.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10">
                     <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Search size={32} className="opacity-50" />
                     </div>
                     <p className="text-sm font-bold text-slate-500">Tidak ada kandidat ditemukan.</p>
                     <p className="text-xs mt-1">Sesuaikan filter dan jalankan analisis untuk melihat aset.</p>
                  </div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-xs uppercase font-bold sticky top-0">
                           <tr>
                              <th className="px-6 py-3">Aset</th>
                              <th className="px-6 py-3">Spesifikasi Teknis</th>
                              <th className="px-6 py-3">Lokasi</th>
                              <th className="px-6 py-3">Status</th>
                              <th className="px-6 py-3 text-right">Estimasi HPS</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                           {assessment.candidates.map(asset => (
                              <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                 <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900 dark:text-white">{asset.name}</div>
                                    <div className="text-xs text-slate-500 font-mono">{asset.number}</div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2"><Battery size={12} /> {asset.capacity}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">Built: {asset.yearBuilt}</div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                       <MapPin size={14} className="text-slate-400" /> {asset.location}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">Tersedia</span>
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">IDR {asset.dailyRate.toLocaleString()}</span>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </div>
         </div>
      </div>

      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Kunci Asesmen">
         <div className="p-6">
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 mb-6">
               <AlertCircle className="text-amber-600 shrink-0" size={24} />
               <div className="text-amber-800 text-sm leading-relaxed">
                  <p className="font-bold mb-1">Apakah anda yakin ingin memproses data ini?</p>
                  <p>Setelah disimpan (Tersimpan), dokumen tidak dapat diubah lagi. Nomor Berita Acara akan digenerate.</p>
               </div>
            </div>
            
            <div className="flex gap-3 justify-end">
               <button onClick={() => setIsConfirmOpen(false)} className="px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-lg">Batal</button>
               <button onClick={handleSaveConfirm} className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-slate-800">Ya, Simpan</button>
            </div>
         </div>
      </Modal>

      <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="Berita Acara Ketersediaan">
         <div className="p-6 min-h-[400px]">
            {isGenerating ? (
               <div className="py-20 text-center">
                  <Loader2 size={40} className="animate-spin text-indigo-600 mx-auto mb-4" />
                  <h3 className="font-bold text-slate-800 dark:text-white">Membuat Berita Acara...</h3>
                  <p className="text-sm text-slate-500 mt-2">Mengkonsultasikan Protokol Auditor & Menganalisis Kandidat</p>
               </div>
            ) : (
               <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                     <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                        <CheckCircle size={16} /> Laporan Siap
                     </div>
                     <button className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-bold"><Copy size={12} /> Salin ke Clipboard</button>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner max-h-[500px] overflow-y-auto">
                     <pre className="font-mono text-xs md:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {reportContent}
                     </pre>
                  </div>
                  <div className="flex justify-end">
                     <button onClick={() => setIsAiModalOpen(false)} className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold">Tutup</button>
                  </div>
               </div>
            )}
         </div>
      </Modal>
    </div>
  );
};

export default MarketAssessment;

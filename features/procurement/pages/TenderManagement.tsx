
import React, { useState } from 'react';
import { useAssets } from '../../../context/AssetContext';
import { useProcurement } from '../../../context/ProcurementContext';
import { sealBid, canOpenBids } from '../../../utils/TenderSecurity';
import { BrainCircuit, Loader2, Trophy, Clock, FileSpreadsheet, ChevronRight, Gavel, Plus, CheckSquare, Square, Wand2, FileText, ArrowRight, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Modal from '../../../components/common/Modal';
import { useNavigate } from 'react-router-dom';
import { Tender } from '../../../types';

const TenderManagement: React.FC = () => {
  const { tenders, requests, addTender, awardTender } = useProcurement();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'All' | 'Draft' | 'Published' | 'Closed'>('All');
  const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiContent, setAiContent] = useState<string>('');
  
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const [tenderTitle, setTenderTitle] = useState('');
  const [tenderDesc, setTenderDesc] = useState('');
  const [bidOpeningDate, setBidOpeningDate] = useState('');

  const [forceUnseal, setForceUnseal] = useState<Record<string, boolean>>({});

  const availableRequests = requests.filter(r => r.status === 'Approved' && !r.tenderId);
  
  const filteredTenders = tenders.filter(t => activeTab === 'All' || t.status === activeTab);
  const selectedTender = tenders.find(t => t.id === selectedTenderId);

  const isTenderSealed = (tender: Tender) => {
     if (tender.status === 'Closed') return false;
     if (forceUnseal[tender.id]) return false;
     if (!tender.bidOpeningDate) return false;
     return !canOpenBids(tender.bidOpeningDate);
  };

  const toggleRequestSelection = (id: string) => {
    setSelectedRequestIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const calculateTotalBudget = () => {
     return selectedRequestIds.reduce((acc, id) => {
        const req = requests.find(r => r.id === id);
        if (!req) return acc;
        const priceNum = parseInt(req.hps.replace(/[^0-9]/g, '')) || 0;
        return acc + priceNum;
     }, 0);
  };

  const generateSOW = async () => {
     if (selectedRequestIds.length === 0) return;
     setIsGenerating(true);
     const selectedAssets = requests.filter(r => selectedRequestIds.includes(r.id)).map(r => `${r.assetName} (${r.category})`);
     
     try {
        const prompt = `Buat deskripsi Lingkup Kerja (Scope of Work) profesional untuk paket tender migas yang mencakup: ${selectedAssets.join(', ')}. Sertakan persyaratan teknis dan kepatuhan K3LL (CSMS). Gunakan Bahasa Indonesia formal sesuai standar PTK-007. Maksimal 100 kata.`;
        
        if (process.env.API_KEY) {
           const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
           const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
           setTenderDesc(response.text || "");
        } else {
           await new Promise(r => setTimeout(r, 1500));
           setTenderDesc(`Penyediaan ${selectedAssets.length} unit aset termasuk ${selectedAssets[0]}. Kontraktor wajib menyediakan unit yang beroperasi penuh dengan kru bersertifikat, memenuhi standar keselamatan SKK Migas PTK-007 Rev.05, dan memiliki sertifikasi BKI yang valid.`);
        }
        setTenderTitle(`Pengadaan ${selectedAssets.length} Unit Aset Penunjang Hulu Migas - ${new Date().getFullYear()}`);
        
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        setBidOpeningDate(nextWeek.toISOString().split('T')[0]);

     } catch (e) {
        setTenderDesc("Gagal menghasilkan deskripsi.");
     } finally {
        setIsGenerating(false);
     }
  };

  const handleCreateTender = () => {
     const newTender: Tender = {
        id: `TDR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        name: tenderTitle,
        description: tenderDesc,
        createdDate: new Date().toISOString(),
        bidOpeningDate: bidOpeningDate,
        status: 'Published',
        items: selectedRequestIds,
        totalValue: calculateTotalBudget(),
        bids: []
     };
     addTender(newTender);
     setIsCreateModalOpen(false);
     setWizardStep(1);
     setSelectedRequestIds([]);
     setTenderTitle('');
     setTenderDesc('');
     setBidOpeningDate('');
  };

  const evaluateBids = async () => {
     if (!selectedTender) return;
     if (isTenderSealed(selectedTender)) return;

     setIsAiModalOpen(true);
     setIsGenerating(true);
     setAiContent('');
     try {
        if (process.env.API_KEY) {
           const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
           const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: "Evaluate bids for tender (Indonesian)..." });
           setAiContent(response.text || "No evaluation.");
        } else {
           await new Promise(r => setTimeout(r, 1500));
           setAiContent(`**Hasil Evaluasi Penawaran:**\n\nRekomendasi Pemenang: **${selectedTender.bids?.[0]?.vendorName || 'Tidak Ada'}**.\n\nDasar Pertimbangan:\n1. Harga penawaran terendah yang memenuhi syarat teknis.\n2. Skor Kepatuhan (CSMS) di atas ambang batas (85).\n3. Ketersediaan unit sesuai jadwal operasional.`);
        }
     } catch (e) { setAiContent("Error."); } finally { setIsGenerating(false); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in pb-24">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
             <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Paket Tender</h1>
             <p className="text-slate-500 text-sm mt-1">Pengelolaan paket lelang dan pembukaan sampul penawaran.</p>
          </div>
          <button onClick={() => setIsCreateModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
             <Plus size={16} /> Buat Paket Tender
          </button>
       </div>

       <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[600px] flex flex-col">
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 flex gap-1">
             <button onClick={() => setActiveTab('All')} className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${activeTab === 'All' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Semua</button>
             <button onClick={() => setActiveTab('Draft')} className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${activeTab === 'Draft' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Konsep (Draft)</button>
             <button onClick={() => setActiveTab('Published')} className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${activeTab === 'Published' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Tayang (Published)</button>
             <button onClick={() => setActiveTab('Closed')} className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${activeTab === 'Closed' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Tutup (Closed)</button>
          </div>
          
          <div className="flex-1 p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
             {filteredTenders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                   <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4"><Gavel size={32} className="opacity-50" /></div>
                   <p className="text-sm font-medium">Tidak ada paket tender ditemukan.</p>
                </div>
             ) : (
                filteredTenders.map(tender => {
                   const sealed = isTenderSealed(tender);
                   return (
                      <div key={tender.id} onClick={() => setSelectedTenderId(tender.id)} className="group bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
                         <div className="flex justify-between items-start relative z-10">
                            <div className="flex gap-4">
                               <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border ${sealed ? 'bg-amber-50 border-amber-100 text-amber-500' : 'bg-slate-50 border-slate-100 text-slate-400 dark:bg-slate-800 dark:border-slate-700'}`}>
                                  {sealed ? <Lock size={24} /> : <FileSpreadsheet size={24} />}
                               </div>
                               <div>
                                  <div className="flex items-center gap-2 mb-1">
                                     <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 transition-colors">{tender.name}</h3>
                                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${tender.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : tender.status === 'Closed' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{tender.status}</span>
                                     {sealed && <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-700 flex items-center gap-1"><Lock size={8} /> TERTUTUP</span>}
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-slate-500">
                                     <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{tender.id}</span>
                                     <span>{tender.items.length} item</span>
                                     <span className="flex items-center gap-1"><Clock size={12} /> Buka: {tender.bidOpeningDate || 'TBD'}</span>
                                  </div>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Nilai HPS (OE)</p>
                               <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">IDR {(tender.totalValue / 1000000).toFixed(0)} M</p>
                            </div>
                         </div>
                         <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600">
                            <ChevronRight size={20} />
                         </div>
                      </div>
                   );
                })
             )}
          </div>
       </div>

       <Modal isOpen={!!selectedTender} onClose={() => setSelectedTenderId(null)} title={selectedTender?.name || ''}>
          {selectedTender && (
             <div className="space-y-8 p-2">
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total HPS (Owner Estimate)</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">IDR {selectedTender.totalValue.toLocaleString()}</p>
                   </div>
                   <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-center">
                      <div className="flex justify-between items-center">
                         <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Penawaran Masuk</span>
                         <span className="text-xl font-bold text-indigo-600">{selectedTender.bids?.length || 0}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2"><div className="bg-indigo-600 h-full rounded-full" style={{width: `${(selectedTender.bids?.length || 0) * 20}%`}}></div></div>
                   </div>
                </div>

                {isTenderSealed(selectedTender) && (
                   <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full text-amber-600"><Lock size={20} /></div>
                         <div>
                            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100">Dokumen Penawaran Tertutup</h4>
                            <p className="text-xs text-amber-700 dark:text-amber-300">Tanggal Buka: {selectedTender.bidOpeningDate}</p>
                         </div>
                      </div>
                      {canOpenBids(selectedTender.bidOpeningDate) ? (
                          <button 
                             onClick={() => setForceUnseal(prev => ({...prev, [selectedTender.id]: true}))} 
                             className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-emerald-200 text-emerald-700 font-bold rounded-lg text-xs hover:bg-emerald-50 transition-colors flex items-center gap-2"
                          >
                             <Unlock size={12} /> Buka Sampul
                          </button>
                      ) : (
                          <button disabled className="px-3 py-1.5 bg-slate-100 text-slate-400 font-bold rounded-lg text-xs flex items-center gap-2 cursor-not-allowed">
                             <Lock size={12} /> Terkunci hingga {selectedTender.bidOpeningDate}
                          </button>
                      )}
                   </div>
                )}

                <div>
                   <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Proposal Penyedia</h4>
                      {selectedTender.bids && selectedTender.bids.length > 0 && !isTenderSealed(selectedTender) && (
                         <button onClick={evaluateBids} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center gap-1 transition-colors"><BrainCircuit size={14} /> AI Evaluasi</button>
                      )}
                   </div>
                   
                   {selectedTender.bids && selectedTender.bids.length > 0 ? (
                      <div className="space-y-3">
                         {selectedTender.bids.map((bid, i) => {
                            const sealed = isTenderSealed(selectedTender);
                            return (
                               <div key={i} className="flex justify-between items-center p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 hover:shadow-sm transition-shadow">
                                  <div>
                                     <p className="font-bold text-sm text-slate-900 dark:text-white">{bid.vendorName}</p>
                                     <div className="flex items-center gap-2 mt-1">
                                        {sealed ? (
                                           <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Nilai Tersembunyi</span>
                                        ) : (
                                           <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${bid.complianceScore && bid.complianceScore > 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>Nilai Teknis: {bid.complianceScore}</span>
                                        )}
                                        <span className="text-xs text-slate-400">{new Date(bid.submittedDate).toLocaleDateString()}</span>
                                     </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                     <p className={`font-mono font-bold text-sm ${sealed ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {sealBid(bid.bidAmount, sealed)}
                                     </p>
                                     {selectedTender.status === 'Published' && !sealed && (
                                        <button onClick={() => { awardTender(selectedTender.id, bid.vendorName, bid.bidAmount, requests); setSelectedTenderId(null); }} className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors tooltip" title="Tunjuk Pemenang">
                                           <Trophy size={16} />
                                        </button>
                                     )}
                                  </div>
                               </div>
                            );
                         })}
                      </div>
                   ) : (
                      <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 dark:bg-slate-900">
                         <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400"><FileSpreadsheet size={24} /></div>
                         <p className="text-sm font-medium text-slate-500">Belum ada penawaran masuk.</p>
                      </div>
                   )}
                </div>
             </div>
          )}
       </Modal>
       
       <Modal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); setWizardStep(1); setSelectedRequestIds([]); }} title="Buat Paket Tender">
          <div className="p-4 min-h-[400px] flex flex-col">
             {/* Progress Steps */}
             <div className="flex gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className={`flex items-center gap-2 text-sm font-bold ${wizardStep === 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${wizardStep === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>1</div>
                   Pilih Lingkup Kerja
                </div>
                <div className={`flex items-center gap-2 text-sm font-bold ${wizardStep === 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${wizardStep === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>2</div>
                   Review & Tayang
                </div>
             </div>

             <div className="flex-1">
                {wizardStep === 1 ? (
                   <div className="space-y-4">
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                         <p className="text-xs text-slate-500 mb-3 font-medium">Permintaan Disetujui (Available)</p>
                         {availableRequests.length === 0 ? (
                            <p className="text-center text-slate-400 text-sm italic py-4">Tidak ada permintaan yang siap untuk tender.</p>
                         ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                               {availableRequests.map(req => (
                                  <div key={req.id} onClick={() => toggleRequestSelection(req.id)} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedRequestIds.includes(req.id) ? 'bg-white border-indigo-500 shadow-sm' : 'bg-white border-transparent hover:bg-slate-100'}`}>
                                     <div className={selectedRequestIds.includes(req.id) ? "text-indigo-600" : "text-slate-300"}>
                                        {selectedRequestIds.includes(req.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                     </div>
                                     <div className="flex-1">
                                        <p className="font-bold text-sm text-slate-800">{req.assetName}</p>
                                        <div className="flex justify-between text-xs text-slate-500 mt-0.5">
                                           <span>{req.id}</span>
                                           <span>{req.hps}</span>
                                        </div>
                                     </div>
                                  </div>
                               ))}
                            </div>
                         )}
                      </div>
                      <div className="flex justify-end">
                         <button disabled={selectedRequestIds.length === 0} onClick={() => { setWizardStep(2); generateSOW(); }} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 flex items-center gap-2">
                            Lanjut <ArrowRight size={14} />
                         </button>
                      </div>
                   </div>
                ) : (
                   <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-slate-500 uppercase">Judul Tender</label>
                         <input value={tenderTitle} onChange={(e) => setTenderTitle(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-indigo-500" placeholder="e.g., Pengadaan Rig Tahunan" />
                      </div>

                      <div className="space-y-2">
                         <label className="text-xs font-bold text-slate-500 uppercase">Tanggal Pembukaan Sampul</label>
                         <input type="date" value={bidOpeningDate} onChange={(e) => setBidOpeningDate(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                         <p className="text-[10px] text-slate-400">Dokumen penawaran akan terenkripsi hingga tanggal ini.</p>
                      </div>
                      
                      <div className="space-y-2 relative">
                         <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                            Lingkup Kerja (SOW) 
                            {isGenerating && <span className="text-indigo-600 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Membuat...</span>}
                         </label>
                         <textarea value={tenderDesc} onChange={(e) => setTenderDesc(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 min-h-[100px]" placeholder="Deskripsi detil pekerjaan..." />
                         <button onClick={generateSOW} className="absolute right-2 top-8 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md" title="Generate ulang dengan AI"><Wand2 size={14} /></button>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                         <span className="text-xs font-bold text-slate-500 uppercase">Estimasi Total HPS</span>
                         <span className="text-xl font-bold text-slate-900 font-mono">IDR {calculateTotalBudget().toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between pt-4">
                         <button onClick={() => setWizardStep(1)} className="px-4 py-2 text-slate-500 font-bold text-sm hover:text-slate-800">Kembali</button>
                         <button onClick={handleCreateTender} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 shadow-sm flex items-center gap-2">
                            <FileText size={16} /> Tayangkan Tender
                         </button>
                      </div>
                   </div>
                )}
             </div>
          </div>
       </Modal>

       <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="Evaluasi Penawaran AI">
          <div className="p-6 text-sm">
             {isGenerating ? <div className="py-12 flex flex-col items-center"><Loader2 size={32} className="animate-spin text-indigo-600 mb-4" /><p className="text-slate-500 font-medium">Menganalisis proposal teknis & komersial...</p></div> : <div className="whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">{aiContent}</div>}
          </div>
       </Modal>
    </div>
  );
};

export default TenderManagement;

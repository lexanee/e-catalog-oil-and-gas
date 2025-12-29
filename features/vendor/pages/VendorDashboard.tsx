
import React, { useState } from 'react';
import { useProcurement } from '../../../context/ProcurementContext';
import { useAuth } from '../../../context/AuthContext';
import { FileText, Briefcase, Box, ArrowRight, Gavel, CheckCircle, BrainCircuit, Loader2, Sparkles, Shield, Upload, Lock, Clock } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import { QuotationRequest, Tender, TenderBid } from '../../../types';
import { GoogleGenAI } from "@google/genai";

const VendorDashboard: React.FC = () => {
  const { requests, updateRequest, tenders, contracts, submitBid } = useProcurement();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'Enquiries' | 'Tenders' | 'Contracts'>('Tenders');
  
  // State for Smart Proposal
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [proposalStep, setProposalStep] = useState<1 | 2>(1);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [proposalText, setProposalText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // State for simple Enquiry Quote
  const [selectedRequest, setSelectedRequest] = useState<QuotationRequest | null>(null);
  const [quotePrice, setQuotePrice] = useState('');

  const vendorRequests = requests.filter(req => req.status === 'Pending' || req.status === 'Review' || req.status === 'Approved');
  const publishedTenders = tenders.filter(t => t.status === 'Published');
  // Mock filter for contracts belonging to this vendor (using user name or ID)
  const myContracts = contracts.filter(c => c.vendorName === (user?.name || 'Global Suppliers Ltd.'));

  const generateProposal = async () => {
     if (!selectedTender) return;
     setIsGenerating(true);
     try {
        const prompt = `Write a competitive tender proposal executive summary for: ${selectedTender.name}. 
        Requirements: ${selectedTender.description || 'Standard Oil & Gas procurement'}.
        Vendor: ${user?.name || 'Contractor'}. 
        Focus on safety record (CSMS) and technical compliance. Max 100 words. Language: Formal Indonesian (Bahasa Indonesia).`;

        if (process.env.API_KEY) {
           const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
           const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
           setProposalText(response.text || "");
        } else {
           await new Promise(r => setTimeout(r, 1500));
           setProposalText(`Kami dengan ini mengajukan proposal teknis dan komersial untuk ${selectedTender.name}. Armada kami memenuhi seluruh spesifikasi teknis yang tercantum dalam Lingkup Kerja (SOW), menjamin kepatuhan penuh terhadap PTK-007. Dengan skor CSMS 92 dan nihil kecelakaan (Zero LTI) dalam 12 bulan terakhir, kami menjamin keunggulan operasional dan keselamatan kerja.`);
        }
     } catch (e) { setProposalText("Gagal membuat proposal."); } finally { setIsGenerating(false); }
  };

  const handleBidSubmit = () => {
     if (!selectedTender || !bidAmount) return;
     const newBid: TenderBid = {
        vendorName: user?.name || 'Global Suppliers Ltd.',
        bidAmount: parseInt(bidAmount.replace(/[^0-9]/g, '')),
        submittedDate: new Date().toISOString(),
        status: 'Submitted',
        complianceScore: 85 + Math.floor(Math.random() * 10) // Mock score
     };
     submitBid(selectedTender.id, newBid);
     setIsSubmitted(true);
     setTimeout(() => {
        setIsSubmitted(false);
        setSelectedTender(null);
        setProposalStep(1);
        setBidAmount('');
        setProposalText('');
     }, 2000);
  };

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    updateRequest(selectedRequest.id, { status: 'Review', hps: `IDR ${Number(quotePrice).toLocaleString('id-ID')}` });
    setSelectedRequest(null);
    setQuotePrice('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in pb-20">
       <div className="mb-8 flex justify-between items-end">
          <div>
             <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Portal Mitra (Partner Portal)</h1>
             <p className="text-slate-500 text-sm mt-1">Dikelola oleh {user?.name}</p>
          </div>
          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-slate-700">
             <Shield size={14} className="text-indigo-600" />
             <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Terverifikasi CIVD</span>
          </div>
       </div>

       <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
          <div className="border-b border-slate-200 dark:border-slate-800 px-4 pt-2 flex gap-1 bg-slate-50 dark:bg-slate-950">
             {['Tender', 'Permintaan', 'Kontrak'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab === 'Tender' ? 'Tenders' : tab === 'Permintaan' ? 'Enquiries' : 'Contracts')} className={`px-6 py-3 rounded-t-lg text-sm font-bold border-t border-x border-b-0 transition-all ${((activeTab === 'Tenders' && tab === 'Tender') || (activeTab === 'Enquiries' && tab === 'Permintaan') || (activeTab === 'Contracts' && tab === 'Kontrak')) ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-white -mb-px' : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                   {tab}
                </button>
             ))}
          </div>

          <div className="p-6 flex-1 bg-white dark:bg-slate-900">
             {activeTab === 'Tenders' && (
                <div className="space-y-4">
                   {publishedTenders.length === 0 ? (
                      <div className="p-12 text-center text-slate-400">
                         <Gavel size={32} className="mx-auto mb-3 opacity-30" />
                         <p>Tidak ada paket tender yang tersedia.</p>
                      </div>
                   ) : (
                      publishedTenders.map(tender => {
                         const hasBidded = tender.bids?.some(b => b.vendorName === (user?.name || 'Global Suppliers Ltd.'));
                         const isSealed = tender.bidOpeningDate && new Date() < new Date(tender.bidOpeningDate);
                         return (
                            <div key={tender.id} className="border border-slate-200 dark:border-slate-700 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-sm transition-shadow">
                               <div>
                                  <div className="flex items-center gap-2 mb-1">
                                     <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-100 uppercase">Tender Terbuka</span>
                                     <span className="text-slate-400 text-xs font-mono">{tender.id}</span>
                                     {isSealed && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-100 bg-amber-50 text-amber-600"><Lock size={10} /> Amplop Tertutup</span>}
                                  </div>
                                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{tender.name}</h3>
                                  <p className="text-sm text-slate-500 mt-1 line-clamp-2 max-w-xl">{tender.description}</p>
                                  {isSealed && <p className="text-xs text-amber-600 mt-2 flex items-center gap-1"><Clock size={12} /> Tanggal Pembukaan: {tender.bidOpeningDate}</p>}
                               </div>
                               {hasBidded ? (
                                  <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-100 flex items-center gap-2">
                                     <CheckCircle size={16} /> Proposal Terkirim
                                  </div>
                               ) : (
                                  <button onClick={() => setSelectedTender(tender)} className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2">
                                     Siapkan Penawaran <ArrowRight size={14} />
                                  </button>
                               )}
                            </div>
                         );
                      })
                   )}
                </div>
             )}

             {activeTab === 'Enquiries' && (
                <div className="space-y-4">
                   {vendorRequests.length === 0 ? (
                      <div className="p-12 text-center text-slate-400">
                         <FileText size={32} className="mx-auto mb-3 opacity-30" />
                         <p>Tidak ada permintaan sewa aset.</p>
                      </div>
                   ) : (
                      vendorRequests.map(req => (
                         <div key={req.id} className="border border-slate-200 dark:border-slate-700 p-5 rounded-xl flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <div>
                               <div className="flex gap-2 mb-1">
                                  <span className="font-bold text-slate-900 dark:text-white">{req.assetName}</span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${req.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>{req.status}</span>
                               </div>
                               <p className="text-xs text-slate-500">Ref: {req.id} • {req.date}</p>
                            </div>
                            {req.status === 'Pending' && (
                               <button onClick={() => setSelectedRequest(req)} className="text-sm font-bold text-indigo-600 hover:underline">Submit Quote</button>
                            )}
                         </div>
                      ))
                   )}
                </div>
             )}

             {activeTab === 'Contracts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {myContracts.length === 0 ? (
                      <div className="col-span-2 p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                         <Briefcase size={32} className="mx-auto mb-3 opacity-30" />
                         <p>Tidak ada kontrak aktif ditemukan.</p>
                      </div>
                   ) : (
                      myContracts.map(contract => (
                         <div key={contract.id} className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-start mb-4">
                               <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{contract.tenderId}</h3>
                               <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase">{contract.status}</span>
                            </div>
                            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300 mb-4">
                               <div className="flex justify-between"><span>Nilai</span><span className="font-mono font-bold">IDR {contract.totalValue.toLocaleString()}</span></div>
                               <div className="flex justify-between"><span>Tanggal Mulai</span><span>{contract.startDate}</span></div>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                               <div className="bg-emerald-500 h-full w-[35%]"></div>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 text-right">35% Progress</p>
                         </div>
                      ))
                   )}
                </div>
             )}
          </div>
       </div>

       {/* Smart Proposal Wizard */}
       <Modal isOpen={!!selectedTender} onClose={() => { setSelectedTender(null); setProposalStep(1); }} title="Pembuat Proposal Cerdas">
          <div className="p-6">
             {isSubmitted ? (
                <div className="py-10 text-center animate-fade-in">
                   <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600"><CheckCircle size={32} /></div>
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white">Proposal Terkirim!</h3>
                   <p className="text-slate-500 mt-2">Penawaran Anda telah dienkripsi dan disegel.</p>
                </div>
             ) : (
                <div className="space-y-6">
                   {proposalStep === 1 ? (
                      <>
                         <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 flex gap-3">
                            <BrainCircuit className="text-indigo-600 shrink-0" size={24} />
                            <div>
                               <h4 className="font-bold text-indigo-900 dark:text-white text-sm">Asisten Tender AI</h4>
                               <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">Saya dapat membuat ringkasan eksekutif berdasarkan profil CIVD dan SOW.</p>
                            </div>
                         </div>
                         <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase">Penawaran Komersial (IDR)</label>
                            <input type="text" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500" placeholder="0" />
                         </div>
                         <div className="flex justify-end">
                            <button onClick={() => { setProposalStep(2); generateProposal(); }} disabled={!bidAmount} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 shadow-sm flex items-center gap-2 disabled:opacity-50">
                               Lanjut <ArrowRight size={16} />
                            </button>
                         </div>
                      </>
                   ) : (
                      <>
                         <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                               Ringkasan Eksekutif 
                               {isGenerating && <span className="text-indigo-600 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Drafting...</span>}
                            </label>
                            <textarea value={proposalText} onChange={(e) => setProposalText(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm leading-relaxed outline-none focus:border-indigo-500 min-h-[150px]" />
                         </div>
                         
                         <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-2">
                               <span className="text-xs font-bold text-slate-500 uppercase">Dokumen Pendukung</span>
                               <button className="text-[10px] font-bold text-indigo-600 flex items-center gap-1"><Upload size={10} /> Upload File</button>
                            </div>
                            <div className="space-y-2">
                               <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"><FileText size={12} className="text-emerald-500" /> Technical_Proposal.pdf</div>
                               <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"><FileText size={12} className="text-emerald-500" /> HSE_Plan_Bridging.pdf</div>
                               <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"><FileText size={12} className="text-emerald-500" /> Commecial_Form.xlsx</div>
                            </div>
                         </div>

                         <div className="flex gap-3 pt-2">
                            <button onClick={() => setProposalStep(1)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-sm text-slate-500">Kembali</button>
                            <button onClick={handleBidSubmit} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 shadow-sm">Kirim Proposal</button>
                         </div>
                      </>
                   )}
                </div>
             )}
          </div>
       </Modal>

       {/* Simple Quote Modal */}
       <Modal isOpen={!!selectedRequest} onClose={() => setSelectedRequest(null)} title={`Quote: ${selectedRequest?.assetName}`}>
          <form onSubmit={handleEnquirySubmit} className="p-6 space-y-4">
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Konfirmasi Ketersediaan</label>
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-sm font-medium flex items-center gap-2"><CheckCircle size={16} /> Aset Tersedia untuk {selectedRequest?.dateFrom} - {selectedRequest?.dateTo}</div>
             </div>
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Harga Harian (IDR)</label>
                <input required type="number" value={quotePrice} onChange={(e) => setQuotePrice(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg font-mono" placeholder="45000000" />
             </div>
             <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700">Kirim Penawaran</button>
          </form>
       </Modal>
    </div>
  );
};

export default VendorDashboard;

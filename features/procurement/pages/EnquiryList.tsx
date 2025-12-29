
import React, { useState } from 'react';
import { useAssets } from '../../../context/AssetContext';
import { useProcurement } from '../../../context/ProcurementContext';
import { useAuth } from '../../../context/AuthContext';
import { Search, Filter, MessageSquare, Send, User, ShieldCheck, XCircle, Wrench, ThumbsDown, FileText, CheckCircle, Clock } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import { QuotationRequest, Comment } from '../../../types';
import { GoogleGenAI } from "@google/genai";
import RBACWrapper from '../../../components/common/RBACWrapper';

const EnquiryList: React.FC = () => {
  const { requests, updateRequest, addTender } = useProcurement();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<QuotationRequest | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [techNotes, setTechNotes] = useState('');

  const filteredRequests = requests.filter(r => {
    return (filterStatus === 'All' || r.status === filterStatus) && 
           (r.id.toLowerCase().includes(searchTerm.toLowerCase()) || r.assetName.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const getStatusDisplay = (status: string, techStatus?: string) => {
     switch(status) {
        case 'Approved': return { label: 'Masuk Daftar Pendek (Shortlisted)', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
        case 'Pending': return { label: 'Menunggu (Pending)', style: 'bg-amber-50 text-amber-700 border-amber-200' };
        case 'Review': 
           if (techStatus === 'Valid') return { label: 'Terverifikasi (Valid)', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
           return { label: 'Evaluasi (Evaluating)', style: 'bg-sky-50 text-sky-700 border-sky-200' };
        case 'Rejected': return { label: 'Ditolak (Rejected)', style: 'bg-slate-100 text-slate-600 border-slate-200' };
        default: return { label: status, style: 'bg-slate-50 text-slate-700 border-slate-200' };
     }
  };

  const handleStatusChange = (status: 'Approved' | 'Rejected' | 'Review') => {
    if (!selectedRequest) return;
    updateRequest(selectedRequest.id, { status });
    setSelectedRequest(prev => prev ? { ...prev, status } : null);
    setToastMessage(`Status updated to ${status}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in pb-24">
      {showToast && <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in"><CheckCircle size={16} /> {toastMessage}</div>}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
         <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Permintaan Penawaran (Market Enquiry)</h1>
            <p className="text-slate-500 text-sm mt-1">Survei ketersediaan aset dan verifikasi teknis.</p>
         </div>
         <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">
            Export Laporan
         </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between bg-white dark:bg-slate-900">
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start">
               {['All', 'Pending', 'Review', 'Approved'].map(tab => (
                  <button key={tab} onClick={() => setFilterStatus(tab)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filterStatus === tab ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>{tab}</button>
               ))}
            </div>
            <div className="relative w-full sm:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
               <input type="text" placeholder="Cari ID atau Aset..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-xs uppercase font-bold sticky top-0">
                  <tr>
                     <th className="px-6 py-3 w-16 text-center">Diskusi</th>
                     <th className="px-6 py-3">No. Referensi</th>
                     <th className="px-6 py-3">Aset yang Diminta</th>
                     <th className="px-6 py-3">HPS (Owner Estimate)</th>
                     <th className="px-6 py-3">Status</th>
                     <th className="px-6 py-3 text-right">Tindakan</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRequests.length === 0 ? (
                     <tr><td colSpan={6} className="p-10 text-center text-slate-400">Tidak ada data ditemukan.</td></tr>
                  ) : filteredRequests.map((req) => (
                     <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group" onClick={() => setSelectedRequest(req)}>
                        <td className="px-6 py-4 text-center">{req.comments?.length ? <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto"><MessageSquare size={12} /></div> : <span className="text-slate-300">-</span>}</td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500 font-medium group-hover:text-indigo-600 transition-colors">{req.id}</td>
                        <td className="px-6 py-4">
                           <div className="font-bold text-slate-800 dark:text-white">{req.assetName}</div>
                           <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Clock size={10} /> {req.date}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300 font-medium">{req.hps}</td>
                        <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wide ${getStatusDisplay(req.status, req.techStatus).style}`}>{getStatusDisplay(req.status, req.techStatus).label}</span></td>
                        <td className="px-6 py-4 text-right"><span className="text-indigo-600 font-bold text-xs hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Lihat Detail</span></td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      <Modal isOpen={!!selectedRequest && !isTechModalOpen} onClose={() => setSelectedRequest(null)} title="Detail Permintaan (Enquiry)">
        {selectedRequest && (
          <div className="space-y-6">
             <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-start">
                <div>
                   <span className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Aset yang Diminta (Subject Asset)</span>
                   <h3 className="font-bold text-xl text-slate-900 dark:text-white">{selectedRequest.assetName}</h3>
                   <p className="text-xs text-slate-500 mt-1 font-mono">ID: {selectedRequest.id}</p>
                </div>
                <div className="text-right">
                   <p className="text-xs font-bold text-slate-400 uppercase mb-1">HPS (Owner Estimate)</p>
                   <p className="text-xl font-bold text-indigo-600 font-mono">{selectedRequest.hps}</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Informasi KKKS</h4>
                   <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><span className="text-slate-500">Nama KKKS</span><span className="font-medium text-slate-800 dark:text-white">{selectedRequest.kkksName || '-'}</span></div>
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><span className="text-slate-500">Kontak Person</span><span className="font-medium text-slate-800 dark:text-white">{selectedRequest.contactName || '-'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Periode Sewa</span><span className="font-medium text-slate-800 dark:text-white">{selectedRequest.dateFrom} - {selectedRequest.dateTo}</span></div>
                   </div>
                </div>
                <div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Validasi Teknis</h4>
                   {selectedRequest.techStatus ? (
                     <div className={`p-3 rounded-lg border flex gap-3 ${selectedRequest.techStatus === 'Valid' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                        {selectedRequest.techStatus === 'Valid' ? <ShieldCheck size={20} className="shrink-0" /> : <XCircle size={20} className="shrink-0" />}
                        <div><h4 className="font-bold text-xs uppercase">{selectedRequest.techStatus}</h4><p className="text-[11px] mt-1 leading-snug">{selectedRequest.techNotes}</p></div>
                     </div>
                   ) : (
                     <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-xs text-center italic">Menunggu Review Teknis</div>
                   )}
                </div>
             </div>

             <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col h-64">
                <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                   <h4 className="text-xs font-bold text-slate-500 uppercase">Riwayat Diskusi</h4>
                </div>
                <div className="p-4 flex-1 overflow-y-auto bg-white dark:bg-slate-900 space-y-3">
                   {selectedRequest.comments?.length ? selectedRequest.comments.map(c => (
                      <div key={c.id} className="flex gap-3">
                         <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">{c.user.substring(0,2)}</div>
                         <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg rounded-tl-none text-xs text-slate-700 dark:text-slate-300">
                            <div className="flex justify-between gap-4 mb-1"><span className="font-bold">{c.user}</span><span className="text-slate-400 text-[10px]">{c.timestamp}</span></div>
                            {c.text}
                         </div>
                      </div>
                   )) : <p className="text-xs text-slate-400 text-center italic mt-10">Belum ada pesan.</p>}
                </div>
                <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex gap-2">
                   <input className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 transition-colors" placeholder="Ketik catatan internal..." />
                   <button className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><Send size={14} /></button>
                </div>
             </div>

             <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                {/* Security Restriction: Only SCM can shortlist */}
                {selectedRequest.status === 'Review' && (
                  <RBACWrapper allowedRoles={['scm']}>
                     <button onClick={() => handleStatusChange('Approved')} disabled={selectedRequest.techStatus !== 'Valid'} className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors shadow-sm">Masukan Daftar Pendek (Shortlist)</button>
                  </RBACWrapper>
                )}
                
                {selectedRequest.status === 'Review' && (
                   <RBACWrapper allowedRoles={['technical', 'scm']}>
                      <button onClick={() => setIsTechModalOpen(true)} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm">Validasi Teknis</button>
                   </RBACWrapper>
                )}
                <button onClick={() => handleStatusChange('Rejected')} className="px-6 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-lg font-bold text-sm hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors">Tolak</button>
             </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isTechModalOpen} onClose={() => setIsTechModalOpen(false)} title="Validasi Teknis">
         <div className="space-y-4 p-2">
            <p className="text-sm text-slate-500">Berikan catatan penilaian untuk tim engineering.</p>
            <textarea className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" rows={4} placeholder="Masukkan detail asesmen teknis..." value={techNotes} onChange={(e) => setTechNotes(e.target.value)}></textarea>
            <div className="flex gap-3">
               <button onClick={() => { updateRequest(selectedRequest!.id, { techStatus: 'Invalid', techNotes }); setIsTechModalOpen(false); }} className="flex-1 py-2.5 border border-rose-200 bg-rose-50 text-rose-700 rounded-lg font-bold text-sm hover:bg-rose-100 transition-colors">Ada Isu (Flag)</button>
               <button onClick={() => { updateRequest(selectedRequest!.id, { techStatus: 'Valid', techNotes }); setIsTechModalOpen(false); }} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm">Setujui Aset (Valid)</button>
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default EnquiryList;

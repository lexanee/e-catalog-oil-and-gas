
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssets } from '../../../context/AssetContext';
import { useProcurement } from '../../../context/ProcurementContext';
import { Upload, CheckCircle, ArrowLeft, MapPin, Briefcase } from 'lucide-react';
import { QuotationRequest } from '../../../types';

const CreateEnquiry: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { assets } = useAssets();
  const { addRequest } = useProcurement();
  const asset = assets.find((a) => a.id === id);
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({ contactName: '', kkksName: '', contactEmail: '', contactNumber: '', projectName: '', additionalInfo: '' });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [estimatedHPS, setEstimatedHPS] = useState(0);

  useEffect(() => {
    if (dateFrom && dateTo && asset) {
      const diffDays = Math.ceil(Math.abs(new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      setEstimatedHPS(diffDays > 0 ? diffDays * asset.dailyRate : 0);
    }
  }, [dateFrom, dateTo, asset]);

  if (!asset) return <div className="p-10 text-center">Asset not found</div>;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFinalSubmit = () => {
    const newRequest: QuotationRequest = {
      id: `ME-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      assetName: asset.name,
      category: asset.category,
      status: 'Pending',
      hps: estimatedHPS > 0 ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(estimatedHPS) : 'Budgetary',
      ...formData, dateFrom, dateTo
    };
    addRequest(newRequest);
    navigate('/request-list');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in pb-20">
      <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800 text-sm font-bold flex items-center gap-2 mb-6"><ArrowLeft size={16} /> Kembali</button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="md:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
               <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{asset.category}</span>
               <h2 className="text-lg font-bold mt-2 text-slate-900 dark:text-white">{asset.name}</h2>
               <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin size={12} /> {asset.location}</p>
               <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400">Tarif Indikatif (Indicative Rate)</p>
                  <p className="font-mono font-bold text-indigo-600">IDR {asset.dailyRate.toLocaleString()}/hari</p>
               </div>
            </div>
         </div>

         <div className="md:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
               <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-3 bg-slate-50 dark:bg-slate-950">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white'}`}>1</div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>2</div>
               </div>
               
               <div className="p-6">
                  {step === 1 ? (
                     <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
                        <h3 className="font-bold text-sm uppercase text-slate-500">Informasi Proyek</h3>
                        <input required name="projectName" value={formData.projectName} onChange={handleInputChange} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" placeholder="Nama Proyek" />
                        <div className="grid grid-cols-2 gap-4">
                           <input required name="kkksName" value={formData.kkksName} onChange={handleInputChange} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" placeholder="Nama KKKS" />
                           <input required name="contactName" value={formData.contactName} onChange={handleInputChange} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" placeholder="Narahubung (PIC)" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-400">Tanggal Mulai</label>
                              <input required type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm outline-none focus:border-indigo-500" />
                           </div>
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-400">Tanggal Selesai</label>
                              <input required type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm outline-none focus:border-indigo-500" />
                           </div>
                        </div>
                        <div className="flex justify-end pt-4"><button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm">Lanjut</button></div>
                     </form>
                  ) : (
                     <div className="space-y-6 text-center py-6">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2"><Briefcase size={32} className="text-slate-400" /></div>
                        <div><h3 className="font-bold text-slate-900 dark:text-white">Draft Permintaan Dibuat</h3><p className="text-sm text-slate-500">Silakan unggah dokumen TOR/SOW.</p></div>
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><Upload className="mx-auto text-slate-400 mb-2" /><span className="text-sm font-bold text-slate-600 dark:text-slate-400">Klik untuk Unggah PDF</span></div>
                        <div className="flex gap-4 justify-center"><button onClick={() => setStep(1)} className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">Kembali</button><button onClick={handleFinalSubmit} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 shadow-sm">Kirim Permintaan</button></div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CreateEnquiry;

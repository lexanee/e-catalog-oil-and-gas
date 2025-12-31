
import React, { useState } from 'react';
import { useAssets } from '../../../context/AssetContext';
import { useLogistics } from '../../../context/LogisticsContext';
import { Warehouse, Fuel, Package, Anchor, Droplets, ArrowRight, Truck, Ship, Clock, CheckCircle, Plus } from 'lucide-react';
import AssetMap from '../../assets/components/AssetMap';
import Modal from '../../../components/common/Modal';
import TransferForm from '../../../components/common/TransferForm';
import { useMaterialTransfer } from '../../../hooks/useMaterialTransfer';

const ShorebaseHub: React.FC = () => {
  const { assets, addNotification } = useAssets();
  const { shorebases, transfers } = useLogistics();
  const { completeTransfer } = useMaterialTransfer();
  const [selectedBaseId, setSelectedBaseId] = useState<string>(shorebases[0].id);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  
  const selectedBase = shorebases.find(b => b.id === selectedBaseId)!;
  const activeTransfers = transfers.filter(t => t.status === 'SHIPPING');

  const handleTransferSuccess = (eta: string) => {
     setIsTransferModalOpen(false);
     addNotification(selectedBaseId, "Logistics Dispatch", `Material dispatched successfully. Estimated Time of Arrival: ${eta}`, "info");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in pb-20">
      <div className="mb-8 flex justify-between items-end">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pusat Logistik (Shorebase)</h1>
           <p className="text-slate-500 text-sm mt-1">Rantai pasok regional & operasional PLB.</p>
        </div>
        <button onClick={() => setIsTransferModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
           <Plus size={16} /> Pengiriman Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Selection */}
        <div className="lg:col-span-1 space-y-4">
           {shorebases.map(base => (
              <button 
                 key={base.id} 
                 onClick={() => setSelectedBaseId(base.id)} 
                 className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${selectedBaseId === base.id ? 'bg-white dark:bg-slate-900 border-indigo-600 shadow-md ring-1 ring-indigo-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'}`}
              >
                 <div className="flex items-center gap-3 relative z-10">
                    <div className={`p-2.5 rounded-lg transition-colors ${selectedBaseId === base.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                       <Warehouse size={20} />
                    </div>
                    <div>
                       <h3 className={`font-bold text-sm ${selectedBaseId === base.id ? 'text-indigo-900 dark:text-white' : 'text-slate-800 dark:text-white'}`}>{base.name}</h3>
                       <p className="text-xs text-slate-500">{base.location}</p>
                    </div>
                 </div>
                 {selectedBaseId === base.id && <div className="absolute right-0 top-0 h-full w-1 bg-indigo-600"></div>}
              </button>
           ))}

           {/* Active Transfers Widget */}
           <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
              <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-2"><Truck size={14} /> Kargo Dalam Perjalanan</h3>
              {activeTransfers.length === 0 ? (
                 <p className="text-xs text-slate-400 italic">Tidak ada pengiriman aktif.</p>
              ) : (
                 <div className="space-y-3">
                    {activeTransfers.map(t => {
                       const targetName = assets.find(a => a.id === t.targetId)?.name || 'Unknown';
                       return (
                          <div key={t.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                             <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold text-indigo-600">{t.item}</span>
                                <span className="text-[10px] font-mono text-slate-400">{t.quantity} {t.unit}</span>
                             </div>
                             <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-2">
                                <ArrowRight size={10} /> Ke: {targetName}
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="flex items-center gap-1 text-[10px] text-slate-400"><Clock size={10} /> ETA: {new Date(t.eta).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                <button onClick={() => completeTransfer(t.id)} className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 hover:bg-emerald-100">Force Arrive</button>
                             </div>
                          </div>
                       );
                    })}
                 </div>
              )}
           </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
           {/* Stats Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group">
                 <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:opacity-20 transition-opacity"><Fuel size={80} /></div>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cadangan BBM</p>
                 <div className="flex items-end justify-between">
                    <div><span className="text-3xl font-bold text-slate-900 dark:text-white">82%</span><span className="text-xs text-slate-400 ml-1">Kapasitas</span></div>
                    <div className="p-2 bg-orange-50 text-orange-500 rounded-lg"><Fuel size={20} /></div>
                 </div>
                 <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden"><div className="bg-orange-500 w-[82%] h-full"></div></div>
              </div>
              
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group">
                 <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:opacity-20 transition-opacity"><Droplets size={80} /></div>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Suplai Air</p>
                 <div className="flex items-end justify-between">
                    <div><span className="text-3xl font-bold text-slate-900 dark:text-white">95%</span><span className="text-xs text-slate-400 ml-1">Kapasitas</span></div>
                    <div className="p-2 bg-sky-50 text-sky-500 rounded-lg"><Droplets size={20} /></div>
                 </div>
                 <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden"><div className="bg-sky-500 w-[95%] h-full"></div></div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group">
                 <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:opacity-20 transition-opacity"><Package size={80} /></div>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Stok Material</p>
                 <div className="flex items-end justify-between">
                    <div><span className="text-3xl font-bold text-slate-900 dark:text-white">Baik</span><span className="text-xs text-emerald-500 font-bold ml-1">Stabil</span></div>
                    <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><Package size={20} /></div>
                 </div>
                 <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden"><div className="bg-emerald-500 w-full h-full"></div></div>
              </div>
           </div>

           {/* Inventory Table */}
           <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <h3 className="font-bold text-sm text-slate-800 dark:text-white">Level Stok Saat Ini</h3>
                 <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">Laporan Lengkap <ArrowRight size={12} /></button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                 {selectedBase.currentStock?.map((item, i) => (
                    <div key={i} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-bold">{i+1}</div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.item}</span>
                       </div>
                       <div className="text-right">
                          <span className="text-lg font-bold text-slate-900 dark:text-white">{item.qty.toLocaleString()}</span>
                          <span className="text-slate-400 font-medium text-xs ml-1.5">{item.unit}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Map Coverage */}
           <div className="h-80 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-sm">
              <div className="absolute top-4 left-4 z-10 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">Area Cakupan Logistik</div>
              <AssetMap assets={assets} shorebases={shorebases} selectedAssetId={null} height="h-full" zoomLevel="region" showLogistics={true} />
           </div>
        </div>
      </div>

      <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title="Pengiriman Logistik">
          <TransferForm onSuccess={handleTransferSuccess} onCancel={() => setIsTransferModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default ShorebaseHub;


import React from 'react';
import { useAssets } from '../../../context/AssetContext';
import { MaintenanceRecord, Asset } from '../../../types';
import { Wrench, CheckCircle, Clock, AlertOctagon, MoreHorizontal } from 'lucide-react';

const MaintenanceColumn = ({ title, status, tickets, onAdvance, color }: any) => (
   <div className="flex-1 min-w-[300px] bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-full">
      <div className={`p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center ${color} bg-opacity-10`}>
         <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wide">{title}</h3>
         <span className="bg-white dark:bg-slate-800 text-slate-500 text-xs font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{tickets.length}</span>
      </div>
      <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
         {tickets.map((t: any) => (
            <div key={t.ticket.id} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${t.ticket.priority === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                     {t.ticket.priority || 'Normal'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{t.ticket.id}</span>
               </div>
               <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{t.ticket.title}</h4>
               <p className="text-xs text-slate-500 mb-3">{t.assetName} • {t.ticket.date}</p>
               
               {t.ticket.status !== 'Completed' && (
                  <button 
                     onClick={() => onAdvance(t.assetId, t.ticket.id, t.ticket.status)}
                     className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 text-xs font-bold rounded-lg transition-colors border border-transparent hover:border-indigo-200"
                  >
                     {t.ticket.status === 'Open' ? 'Mulai Pengerjaan' : 'Selesaikan (Close)'}
                  </button>
               )}
            </div>
         ))}
         {tickets.length === 0 && <p className="text-center text-slate-400 text-xs py-10 italic">Tidak ada tiket.</p>}
      </div>
   </div>
);

const MaintenanceManager: React.FC = () => {
   const { assets, updateAsset } = useAssets();

   // Flatten all maintenance logs into a single list
   const allTickets = assets.flatMap(asset => 
      (asset.maintenanceLog || []).map(ticket => ({
         ticket,
         assetId: asset.id,
         assetName: asset.name
      }))
   );

   const handleAdvance = (assetId: string, ticketId: string, currentStatus: string) => {
      const nextStatus = currentStatus === 'Open' ? 'In Progress' : 'Completed';
      
      const asset = assets.find(a => a.id === assetId);
      if(!asset) return;

      const newLog = asset.maintenanceLog?.map(t => 
         t.id === ticketId ? { ...t, status: nextStatus } : t
      ) as MaintenanceRecord[];

      // If completing, maybe restore asset health/status?
      // For simplicity, we just update the log status here.
      const updates: Partial<Asset> = { maintenanceLog: newLog };
      if (nextStatus === 'Completed' && asset.status === 'Inactive') {
         updates.status = 'Active'; // Auto-restore asset
         updates.health = 100;
      }

      updateAsset(assetId, updates);
   };

   return (
      <div className="p-6 h-[calc(100vh-64px)] flex flex-col animate-fade-in">
         <div className="mb-6 flex justify-between items-center">
            <div>
               <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Pemeliharaan</h1>
               <p className="text-slate-500 text-sm mt-1">Papan kerja Work Order (WO) dan perbaikan aset.</p>
            </div>
            <div className="flex gap-2">
               <div className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-2 border border-rose-200">
                  <AlertOctagon size={14} /> {allTickets.filter(t => t.ticket.status !== 'Completed' && t.ticket.priority === 'Critical').length} Kritis
               </div>
            </div>
         </div>

         <div className="flex-1 overflow-x-auto">
            <div className="flex gap-4 h-full min-w-[1000px]">
               <MaintenanceColumn 
                  title="Tiket Baru (Open)" 
                  status="Open" 
                  tickets={allTickets.filter(t => t.ticket.status === 'Open' || !t.ticket.status)} 
                  onAdvance={handleAdvance}
                  color="bg-slate-500"
               />
               <MaintenanceColumn 
                  title="Sedang Dikerjakan (WIP)" 
                  status="In Progress" 
                  tickets={allTickets.filter(t => t.ticket.status === 'In Progress')} 
                  onAdvance={handleAdvance}
                  color="bg-indigo-500"
               />
               <MaintenanceColumn 
                  title="Selesai (Resolved)" 
                  status="Completed" 
                  tickets={allTickets.filter(t => t.ticket.status === 'Completed')} 
                  onAdvance={handleAdvance}
                  color="bg-emerald-500"
               />
            </div>
         </div>
      </div>
   );
};

export default MaintenanceManager;

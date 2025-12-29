
import React from 'react';
import { useAssets } from '../../../context/AssetContext';
import { useProcurement } from '../../../context/ProcurementContext';
import { useLogistics } from '../../../context/LogisticsContext';
import { useTheme } from '../../../context/ThemeContext';
import { Activity, Moon, Globe, Database, Server } from 'lucide-react';
import RBACWrapper from '../../../components/common/RBACWrapper';

// Feature Flag for Enterprise Production Control
const DEMO_MODE = false;

const Settings: React.FC = () => {
  const { toggleSimulation, isSimulationPaused, injectScenario, resetAssets } = useAssets();
  const { resetProcurement } = useProcurement();
  const { resetLogistics } = useLogistics();
  const { toggleTheme } = useTheme();

  const resetData = () => {
     resetAssets();
     resetProcurement();
     resetLogistics();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in pb-20">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Pengaturan Sistem</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Simulation Control - Visible only if DEMO_MODE is true */}
         <RBACWrapper allowedRoles={['scm', 'technical']}>
            {DEMO_MODE && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-sm uppercase text-slate-400 mb-4">Mesin Simulasi (Demo Mode)</h3>
                    <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Activity size={20} /></div>
                        <div><p className="font-bold text-sm">Feed Telemetri</p><p className="text-xs text-slate-500">{isSimulationPaused ? 'Jeda (Paused)' : 'Berjalan (2000ms)'}</p></div>
                    </div>
                    <button onClick={toggleSimulation} className={`px-4 py-2 rounded-lg text-xs font-bold ${isSimulationPaused ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-600'}`}>{isSimulationPaused ? 'Resume' : 'Pause'}</button>
                    </div>
                    <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Skenario Injeksi</p>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => injectScenario('weather_natuna')} className="p-2 border border-slate-200 rounded-lg text-xs hover:bg-slate-50">Badai</button>
                        <button onClick={() => injectScenario('failure_rig_a')} className="p-2 border border-slate-200 rounded-lg text-xs hover:bg-slate-50">Rig Fail</button>
                        <button onClick={() => injectScenario('cyber_attack')} className="p-2 border border-slate-200 rounded-lg text-xs hover:bg-slate-50">Cyber</button>
                    </div>
                    </div>
                </div>
            )}
         </RBACWrapper>

         {/* Appearance */}
         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-sm uppercase text-slate-400 mb-4">Preferensi</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2"><Moon size={16} className="text-slate-400" /><span className="text-sm font-medium">Mode Gelap (Dark Mode)</span></div>
                  <button onClick={toggleTheme} className="text-indigo-600 text-xs font-bold">Ubah</button>
               </div>
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2"><Globe size={16} className="text-slate-400" /><span className="text-sm font-medium">Mata Uang</span></div>
                  <span className="text-xs bg-slate-100 px-2 py-1 rounded">IDR (Rupiah)</span>
               </div>
            </div>
         </div>

         {/* System Health (Clean) */}
         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-sm uppercase text-slate-400 mb-4">Status Sistem</h3>
            <div className="space-y-3">
               <div className="flex justify-between items-center text-sm"><div className="flex gap-2 items-center"><Database size={16} className="text-slate-400" /> Database</div><span className="text-emerald-600 font-bold text-xs">Terhubung</span></div>
               <div className="flex justify-between items-center text-sm"><div className="flex gap-2 items-center"><Server size={16} className="text-slate-400" /> API Gateway</div><span className="text-emerald-600 font-bold text-xs">Online (24ms)</span></div>
               <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden"><div className="bg-emerald-500 w-[98%] h-full"></div></div>
            </div>
         </div>

         {/* Danger Zone */}
         <RBACWrapper allowedRoles={['scm']}>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-rose-100 dark:border-rose-900 shadow-sm">
                <h3 className="font-bold text-sm uppercase text-rose-400 mb-4">Zona Bahaya</h3>
                <div className="flex justify-between items-center">
                <div className="text-xs text-slate-500">Reset semua data aplikasi ke kondisi awal.</div>
                <button onClick={() => { if(confirm("Apakah Anda yakin ingin mereset seluruh data sistem?")) resetData(); }} className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-100">Reset Sistem</button>
                </div>
            </div>
         </RBACWrapper>
      </div>
    </div>
  );
};

export default Settings;

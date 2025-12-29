
import React, { useState, useMemo } from 'react';
import { useAssets } from '../../../context/AssetContext';
import AssetMap from '../components/AssetMap';
import { Map as MapIcon, Filter, X, ChevronRight, FileText, Anchor, Truck, Navigation, Eye, EyeOff, ShieldAlert, Loader2, Warehouse, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { shorebases } from '../../../mockData';
import Modal from '../../../components/common/Modal';

const OperationsMap: React.FC = () => {
  const { assets } = useAssets();
  const navigate = useNavigate();
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [visibleCategories, setVisibleCategories] = useState<string[]>(['Onshore Rig', 'Offshore Rig', 'Kapal']);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showZones, setShowZones] = useState(true);
  const [showWK, setShowWK] = useState(true);
  const [showLogistics, setShowLogistics] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [isAnalyzingRisk, setIsAnalyzingRisk] = useState(false);
  const [riskReport, setRiskReport] = useState<string | null>(null);

  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const activeCount = assets.filter(a => a.status === 'Active').length;

  const toggleCategory = (cat: string) => setVisibleCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  const handleAssetClick = (id: string) => { setSelectedAssetId(id); if (window.innerWidth < 768) setIsFiltersOpen(false); if (!showLogistics) setShowLogistics(true); };

  const generateRiskReport = async () => {
     setIsAnalyzingRisk(true); setIsRiskModalOpen(true);
     try {
        if (process.env.API_KEY) {
           const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
           const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: "Risk report..." });
           setRiskReport(response.text || "No report.");
        } else {
           await new Promise(r => setTimeout(r, 2000));
           setRiskReport(`**SITREP:** Active monitoring. No critical threats.`);
        }
     } catch (e) { setRiskReport("Error."); } finally { setIsAnalyzingRisk(false); }
  };

  return (
    <div className="relative h-[calc(100vh-64px)] w-full bg-slate-50 dark:bg-slate-950 animate-fade-in overflow-hidden">
      <div className="absolute inset-0 z-0 p-0">
         <AssetMap assets={assets} shorebases={shorebases} height="h-full" selectedAssetId={selectedAssetId} onAssetClick={handleAssetClick} visibleCategories={visibleCategories} showHeatmap={showHeatmap} showZones={showZones} showWK={showWK} showLogistics={showLogistics} />
      </div>

      <div className="absolute top-6 left-6 z-20 md:hidden">
         <button onClick={() => setIsFiltersOpen(!isFiltersOpen)} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg text-slate-700 dark:text-white transition-transform active:scale-95">
            <Filter size={20} />
         </button>
      </div>

      {/* Floating Control Panel - Solid BG */}
      <div className={`absolute top-0 bottom-0 left-0 z-30 transition-all duration-300 md:top-6 md:bottom-auto md:left-6 md:h-auto ${isFiltersOpen ? 'translate-x-0 w-full md:w-[320px]' : '-translate-x-full md:translate-x-0 md:opacity-0 md:pointer-events-none'}`}>
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 md:rounded-2xl shadow-2xl h-full md:h-auto md:max-h-[85vh] overflow-y-auto p-5 custom-scrollbar flex flex-col">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none"><MapIcon size={20} /></div>
                  <div><h1 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">Peta Operasional</h1><p className="text-xs text-slate-500 font-medium">Pemantauan Aset Hulu</p></div>
               </div>
               <button onClick={() => setIsFiltersOpen(false)} className="md:hidden text-slate-400 p-1"><X size={20} /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
               <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Armada</span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{assets.length}</span>
               </div>
               <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-1">Aktif</span>
                  <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{activeCount}</span>
               </div>
            </div>

            <div className="space-y-1 mb-6">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Tipe Aset</p>
               {[
                  { id: 'Onshore Rig', label: 'Land Rig', icon: Truck },
                  { id: 'Offshore Rig', label: 'Offshore', icon: Anchor },
                  { id: 'Kapal', label: 'Vessel', icon: Navigation }
               ].map(cat => (
                  <button key={cat.id} onClick={() => toggleCategory(cat.id)} className={`w-full flex items-center justify-between p-2.5 rounded-xl text-sm font-medium transition-all ${visibleCategories.includes(cat.id) ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                     <div className="flex items-center gap-2.5"><cat.icon size={16} className={visibleCategories.includes(cat.id) ? "text-indigo-600" : "text-slate-400"} /> <span>{cat.label}</span></div>
                     {visibleCategories.includes(cat.id) && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>}
                  </button>
               ))}
            </div>

            <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Kontrol Layer</p>
               {[{label: 'Wilayah Kerja (WK)', state: showWK, toggle: setShowWK}, {label: 'Zona Bahaya', state: showZones, toggle: setShowZones}, {label: 'Rute Logistik', state: showLogistics, toggle: setShowLogistics}].map((opt, i) => (
                  <div key={i} className="flex items-center justify-between text-sm px-1">
                     <span className="text-slate-600 dark:text-slate-300 font-medium">{opt.label}</span>
                     <button onClick={() => opt.toggle(!opt.state)} className={`p-1.5 rounded-lg transition-colors ${opt.state ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        {opt.state ? <Eye size={16} /> : <EyeOff size={16} />}
                     </button>
                  </div>
               ))}
            </div>

            <button onClick={generateRiskReport} className="w-full mt-6 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm shadow-md shadow-rose-200 dark:shadow-none hover:bg-rose-700 transition-all flex justify-center items-center gap-2 active:scale-95">
               <ShieldAlert size={16} /> Analisa Ancaman
            </button>
         </div>
      </div>

      {/* Asset Detail Card - Floating Solid */}
      {selectedAsset && (
         <div className="absolute top-24 right-6 z-30 w-full md:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-slide-in">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50 dark:bg-slate-900">
               <div>
                  <h2 className="font-bold text-base text-slate-900 dark:text-white leading-tight">{selectedAsset.name}</h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedAsset.number}</p>
               </div>
               <button onClick={() => setSelectedAssetId(null)} className="text-slate-400 hover:text-slate-600 p-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700"><X size={14} /></button>
            </div>
            <div className="p-4 space-y-4">
               <div className="flex gap-2">
                  <span className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg border uppercase ${selectedAsset.status === 'Active' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>{selectedAsset.status}</span>
                  <span className="flex-1 py-1.5 text-center text-xs font-bold rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 uppercase">{selectedAsset.category}</span>
               </div>
               <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50"><span className="text-slate-400 block mb-0.5 font-bold uppercase text-[10px]">Lat</span><span className="font-mono font-medium">{selectedAsset.coordinates.lat.toFixed(4)}</span></div>
                  <div className="p-2.5 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50"><span className="text-slate-400 block mb-0.5 font-bold uppercase text-[10px]">Lng</span><span className="font-mono font-medium">{selectedAsset.coordinates.lng.toFixed(4)}</span></div>
               </div>
               <div className="space-y-2 pt-2">
                  <button onClick={() => navigate(`/product/${selectedAsset.id}`)} className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold flex justify-center items-center gap-2 hover:bg-indigo-700 transition-colors">Lihat Detail <ChevronRight size={14} /></button>
                  <button onClick={() => navigate(`/request/${selectedAsset.id}`)} className="w-full py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Ajukan Penawaran</button>
               </div>
            </div>
         </div>
      )}

      <Modal isOpen={isRiskModalOpen} onClose={() => setIsRiskModalOpen(false)} title="Analisa Ancaman AI">
         <div className="p-6">
            {isAnalyzingRisk ? <div className="py-8 text-center"><Loader2 size={32} className="animate-spin mx-auto text-slate-400" /><p className="text-sm mt-2 text-slate-500 font-medium">Scanning data satelit...</p></div> : <div className="text-sm whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-300">{riskReport}</div>}
         </div>
      </Modal>
    </div>
  );
};

export default OperationsMap;

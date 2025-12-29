import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAssets } from '../../../context/AssetContext';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import AssetMap from '../components/AssetMap';
import Modal from '../../../components/common/Modal';
import { checkAndGenerateWorkOrder } from '../../../utils/WorkOrderAutomation';
import { calculateCabotagePriority, validateAssetReadiness, getPriorityLabel } from '../../../utils/AssetCompliance';
import { ArrowLeft, CheckCircle, Activity, Power, Cpu, ShieldCheck, MapPin, Users, AlertTriangle, Sparkles, BrainCircuit, AlertCircle, Edit, Save, Flag, Battery, MoreHorizontal } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { Asset, AssetStatus } from '../../../types';

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { assets, updateAsset, addNotification } = useAssets();
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const asset = assets.find((a) => a.id === id);
  const [activeTab, setActiveTab] = useState<'specs' | 'ref' | 'history' | 'telemetry' | 'inventory' | 'sustainability' | 'safety'>('telemetry');
  
  const [telemetryData, setTelemetryData] = useState<any[]>([]);
  const [isRebooting, setIsRebooting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiAnalysisStage, setAiAnalysisStage] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [aiResultText, setAiResultText] = useState<string>('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Asset>>({});

  // ESG & Safety Intelligence
  const [isAnalyzingHSE, setIsAnalyzingHSE] = useState(false);
  const [hseReport, setHseReport] = useState<string | null>(null);

  // Compliance State
  const [complianceError, setComplianceError] = useState<string | null>(null);

  // AUTOMATION: Listen for Health Criticality
  useEffect(() => {
    if (asset) {
      checkAndGenerateWorkOrder(asset, updateAsset, addNotification);
    }
  }, [asset?.health, asset?.id]); 

  // Init edit form when asset loads or modal opens
  useEffect(() => {
     if (asset) setEditFormData(asset);
  }, [asset]);

  const canEdit = user && (['scm', 'technical'].includes(user.role) || (user.role === 'vendor' && asset?.ownerVendorId === user.id));

  const runHSEAnalysis = async () => {
     if (!asset) return;
     setIsAnalyzingHSE(true);
     setHseReport(null);

     try {
        const prompt = `
           You are a Senior HSE Auditor for SKK Migas. Analyze asset risk:
           Asset: ${asset.name} (${asset.category})
           CSMS Score: ${asset.csmsScore}/100
           Incidents: ${asset.incidentCount}
           Days since last incident: ${asset.daysSinceIncident}
           Maintenance Due: ${asset.nextMaintenanceDate}
           MTBF: ${asset.mtbf} hours
           
           Identify the primary operational risk and suggest one mitigation step. Be concise. Language: Indonesian.
        `;

        if (process.env.API_KEY) {
           const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
           const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
           setHseReport(response.text || "Analysis failed.");
        } else {
           await new Promise(r => setTimeout(r, 1500));
           const level = asset.csmsScore > 80 ? "Rendah" : "Sedang";
           setHseReport(`**Laporan Integritas K3LL:**\n\n**Tingkat Risiko: ${level}.** Tren MTBF stabil. ${asset.incidentCount > 0 ? "Insiden sebelumnya bersifat kegagalan mekanis minor." : "Tidak ada LTI (Lost Time Injury) tercatat."}\n\n**Rekomendasi:** Jadwalkan inspeksi preventif pada secondary blowout preventers sebelum tanggal spud.`);
        }
     } catch (e) { setHseReport("Error."); } finally { setIsAnalyzingHSE(false); }
  };

  const handleUsePart = (partId: string) => {
    if (!asset || !asset.inventory) return;
    const updatedInventory = asset.inventory.map(part => (part.id === partId && part.quantity > 0) ? { ...part, quantity: part.quantity - 1 } : part);
    updateAsset(asset.id, { inventory: updatedInventory });
    const part = updatedInventory.find(p => p.id === partId);
    if (part && part.quantity <= part.minLevel) addNotification(asset.id, 'Peringatan Stok', `Persediaan untuk ${part.name} di bawah batas minimum.`, 'warning');
  };

  const chartStyles = {
    grid: theme === 'dark' ? '#334155' : '#f1f5f9',
    text: theme === 'dark' ? '#94a3b8' : '#94a3b8',
    tooltipBg: theme === 'dark' ? '#1e293b' : '#ffffff',
    tooltipText: theme === 'dark' ? '#f8fafc' : '#1e293b',
  };

  useEffect(() => {
    const initialData = Array.from({ length: 20 }, (_, i) => ({ time: i, temp: 65 + Math.random() * 10, pressure: 80 + Math.random() * 15, fuel: 100 - (i * 0.1) }));
    setTelemetryData(initialData);
  }, []);

  useEffect(() => {
    if (activeTab !== 'telemetry') return;
    const interval = setInterval(() => {
      setTelemetryData(prev => {
        const last = prev[prev.length - 1];
        const newTime = last.time + 1;
        const newTemp = Math.min(100, Math.max(50, last.temp + (Math.random() - 0.5) * 5));
        const newPressure = Math.min(120, Math.max(60, last.pressure + (Math.random() - 0.5) * 8));
        const newFuel = Math.max(0, last.fuel - Math.random() * 0.2);
        return [...prev.slice(1), { time: newTime, temp: newTemp, pressure: newPressure, fuel: newFuel }];
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleCommand = (type: 'reboot' | 'scan' | 'fault') => {
    if (!asset) return;
    if (type === 'reboot') {
      setIsRebooting(true);
      setTimeout(() => { setIsRebooting(false); addNotification(asset.id, 'Reboot Berhasil', `Sistem ${asset.name} berhasil dimulai ulang.`, 'info'); }, 3000);
    }
    if (type === 'scan') {
      setIsScanning(true);
      setTimeout(() => { setIsScanning(false); addNotification(asset.id, 'Diagnostik Selesai', `0 kesalahan (faults) ditemukan.`, 'info'); }, 2000);
    }
    if (type === 'fault') {
      updateAsset(asset.id, { health: 30 });
      addNotification(asset.id, 'TEST', 'Simulasi Penurunan Kesehatan ke 30%', 'critical');
    }
  };

  const handleComplianceCheck = () => {
    if(!asset) return;
    try {
      validateAssetReadiness(asset);
      setComplianceError(null);
      addNotification(asset.id, 'Kepatuhan Terverifikasi', 'Aset memenuhi semua persyaratan teknis dan administratif untuk operasi.', 'info');
    } catch (e: any) {
      setComplianceError(e.message);
      addNotification(asset.id, 'Gagal Validasi Kepatuhan', e.message, 'warning');
    }
  };

  const runAiAnalysis = async () => {
    if (!asset) return;
    setIsAiModalOpen(true);
    setAiAnalysisStage('analyzing');
    setScanProgress(0);
    const progressInterval = setInterval(() => setScanProgress(prev => prev >= 90 ? prev : prev + 10), 300);

    try {
       const prompt = `Health status for ${asset.name}. Score: ${asset.health}%. Predictive analysis. Brief. Language: Indonesian`;
       if (process.env.API_KEY) {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
          setAiResultText(response.text || "Empty result.");
       } else {
          await new Promise(r => setTimeout(r, 1500));
          setAiResultText(`Skor Kesehatan: ${asset.health}%. Seluruh sistem dalam batas normal. Temperatur mesin optimal. Disarankan inspeksi visual pada hidrolik dek.`);
       }
       setAiAnalysisStage('done');
    } catch (e) { setAiResultText("Error."); setAiAnalysisStage('done'); } finally { clearInterval(progressInterval); setScanProgress(100); }
  };

  const handleEditSubmit = () => {
     if (!asset) return;
     try {
        const mergedAsset = { ...asset, ...editFormData } as Asset;
        validateAssetReadiness(mergedAsset);
        updateAsset(asset.id, editFormData);
        setIsEditModalOpen(false);
        addNotification(asset.id, "Aset Diperbarui", "Perubahan data berhasil disimpan dan divalidasi.", "info");
     } catch (e: any) {
        alert(`Validasi Gagal: ${e.message}`);
     }
  };

  if (!asset) return <div className="p-10 text-center">Asset not found</div>;
  
  // Calculate Cabotage on render
  const cabotagePriority = calculateCabotagePriority(asset);
  
  // Mock TKDN Calculation based on Owner Type
  const tkdnValue = asset.ownerType === 'National' ? '75.5%' : asset.ownerType === 'Foreign' ? '15.0%' : '45.2%';

  return (
    <div className="animate-fade-in pb-12">
      
      {/* Header - Clean Solid */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
         <div className="max-w-7xl mx-auto px-6 py-6">
            <Link to="/asset-catalog" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white mb-4 transition-colors">
               <ArrowLeft size={16} className="mr-1" /> Kembali ke Daftar Aset
            </Link>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
               <div>
                  <div className="flex items-center gap-3 mb-1">
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${asset.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{asset.status}</span>
                     <span className="text-slate-400 text-xs font-mono">{asset.number}</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{asset.name}</h1>
               </div>
               <div className="flex gap-3">
                  {canEdit && (
                     <button onClick={() => setIsEditModalOpen(true)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Edit size={16} /> Edit Aset
                     </button>
                  )}
                  <button onClick={runAiAnalysis} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                     <Sparkles size={16} /> AI Analysis
                  </button>
               </div>
            </div>
         </div>
         
         {/* Tabs */}
         <div className="max-w-7xl mx-auto px-6 flex overflow-x-auto gap-6 border-b border-transparent">
            {[
               { id: 'telemetry', label: 'Telemetri' },
               { id: 'safety', label: 'K3LL (Safety)' },
               { id: 'sustainability', label: 'ESG' },
               { id: 'specs', label: 'Spesifikasi' },
               { id: 'inventory', label: 'Inventaris' },
            ].map(tab => (
               <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id as any)} 
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-600 dark:border-white text-indigo-600 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
               >
                  {tab.label}
               </button>
            ))}
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
         {/* Top Grid - Health Status */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
               <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"><Activity size={20} className="text-slate-600 dark:text-slate-400" /></div>
               <div><p className="text-xs text-slate-500 font-bold uppercase">Kesehatan Aset</p><p className={`text-xl font-bold ${asset.health < 40 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>{asset.health}%</p></div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
               <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"><ShieldCheck size={20} className="text-slate-600 dark:text-slate-400" /></div>
               <div><p className="text-xs text-slate-500 font-bold uppercase">Nilai CSMS</p><p className="text-xl font-bold text-slate-900 dark:text-white">{asset.csmsScore}</p></div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
               <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"><MapPin size={20} className="text-slate-600 dark:text-slate-400" /></div>
               <div className="overflow-hidden"><p className="text-xs text-slate-500 font-bold uppercase">Lokasi Aset</p><p className="text-sm font-bold text-slate-900 dark:text-white truncate">{asset.location}</p></div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
               <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"><Users size={20} className="text-slate-600 dark:text-slate-400" /></div>
               <div><p className="text-xs text-slate-500 font-bold uppercase">Kapasitas POB</p><p className="text-xl font-bold text-slate-900 dark:text-white">{asset.crewCount}</p></div>
            </div>
         </div>

         {/* Work Order Active Banner */}
         {asset.maintenanceLog && asset.maintenanceLog.length > 0 && asset.maintenanceLog[0].title.includes('AUTO-WO') && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex items-center justify-between shadow-sm animate-pulse-slow">
               <div className="flex items-center gap-3">
                  <AlertTriangle size={24} />
                  <div>
                     <h3 className="font-bold">Peringatan Pemeliharaan Aktif</h3>
                     <p className="text-xs">{asset.maintenanceLog[0].title} - {asset.maintenanceLog[0].description}</p>
                  </div>
               </div>
               <button className="px-4 py-2 bg-white text-rose-600 text-xs font-bold rounded-lg border border-rose-200 shadow-sm">Lihat Work Order</button>
            </div>
         )}

         {/* Compliance Error Banner */}
         {complianceError && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl flex items-center gap-3 shadow-sm animate-fade-in">
               <AlertCircle size={24} className="shrink-0" />
               <div>
                  <h3 className="font-bold">Validasi Kepatuhan Gagal</h3>
                  <p className="text-xs">{complianceError}</p>
               </div>
            </div>
         )}

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               {activeTab === 'telemetry' && (
                 <div className="space-y-6 animate-fade-in">
                   {/* Map Preview */}
                   <div className="h-64 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative">
                      <div className="absolute top-4 left-4 z-10 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg text-xs font-bold shadow-sm border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300">Posisi Real-time</div>
                      <AssetMap singleAsset={asset} height="h-full" zoomLevel="local" showHeatmap={false} />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                         <div className="flex justify-between mb-4">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Temperatur Mesin</h4>
                            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">Stabil</span>
                         </div>
                         <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                               <AreaChart data={telemetryData}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartStyles.grid} />
                                  <XAxis dataKey="time" hide />
                                  <YAxis domain={[50, 100]} tick={{fontSize: 10, fill: chartStyles.text}} axisLine={false} tickLine={false} />
                                  <Tooltip contentStyle={{backgroundColor: chartStyles.tooltipBg, border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} itemStyle={{color: chartStyles.tooltipText}} />
                                  <Area type="monotone" dataKey="temp" stroke="#f97316" fillOpacity={0.1} fill="#f97316" strokeWidth={2} />
                               </AreaChart>
                            </ResponsiveContainer>
                         </div>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                         <div className="flex justify-between mb-4">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Tekanan Hidrolik</h4>
                            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">Optimal</span>
                         </div>
                         <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                               <AreaChart data={telemetryData}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartStyles.grid} />
                                  <XAxis dataKey="time" hide />
                                  <YAxis domain={[60, 120]} tick={{fontSize: 10, fill: chartStyles.text}} axisLine={false} tickLine={false} />
                                  <Tooltip contentStyle={{backgroundColor: chartStyles.tooltipBg, border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} itemStyle={{color: chartStyles.tooltipText}} />
                                  <Area type="monotone" dataKey="pressure" stroke="#84cc16" fillOpacity={0.1} fill="#84cc16" strokeWidth={2} />
                               </AreaChart>
                            </ResponsiveContainer>
                         </div>
                      </div>
                   </div>
                 </div>
               )}

               {activeTab === 'safety' && (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 animate-fade-in shadow-sm">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Laporan K3LL (HSE)</h3>
                        <button onClick={runHSEAnalysis} className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"><BrainCircuit size={14} /> AI Audit</button>
                     </div>
                     {hseReport && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line mb-6 border border-slate-100 dark:border-slate-700 leading-relaxed">
                           {hseReport}
                        </div>
                     )}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-lg">
                           <p className="text-xs text-slate-500 font-bold uppercase mb-1">Nihil Kecelakaan (Zero LTI)</p>
                           <p className="text-3xl font-bold text-emerald-600">{asset.daysSinceIncident} <span className="text-sm font-medium text-slate-400">Hari</span></p>
                        </div>
                        <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-lg">
                           <p className="text-xs text-slate-500 font-bold uppercase mb-1">Pemeliharaan Berikutnya</p>
                           <p className="text-xl font-bold text-slate-800 dark:text-white">{asset.nextMaintenanceDate}</p>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'inventory' && (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 animate-fade-in">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Suku Cadang (Spare Parts)</h3>
                        <button className="text-xs font-bold text-indigo-600">Requisition History</button>
                     </div>
                     <div className="space-y-4">
                        {asset.inventory?.map(part => (
                           <div key={part.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <div>
                                 <p className="font-bold text-sm text-slate-800 dark:text-white">{part.name}</p>
                                 <p className="text-xs text-slate-400">SKU: {part.sku}</p>
                              </div>
                              <div className="text-right">
                                 <p className={`font-bold text-sm ${part.quantity <= part.minLevel ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>{part.quantity} {part.unit}</p>
                                 <button onClick={() => handleUsePart(part.id)} className="text-[10px] text-indigo-600 font-bold hover:underline">Gunakan Item</button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </div>

            {/* Sidebar Details */}
            <div className="lg:col-span-1 space-y-6">
               
               {/* Cabotage & Compliance Card */}
               <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                   <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Flag size={14} /> Status Cabotage</h3>
                   <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg mb-4 text-center border border-slate-100 dark:border-slate-700">
                       <p className="text-xs text-slate-500 uppercase font-bold mb-1">Prioritas</p>
                       <p className={`text-lg font-bold ${cabotagePriority === 'PRIORITY_1' ? 'text-emerald-600' : cabotagePriority === 'PRIORITY_2' ? 'text-indigo-600' : 'text-amber-600'}`}>
                           {getPriorityLabel(cabotagePriority)}
                       </p>
                   </div>
                   <button onClick={handleComplianceCheck} className="w-full py-2.5 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
                      <CheckCircle size={14} /> Validasi Kesiapan
                   </button>
               </div>

               <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Tindakan Cepat</h3>
                  <div className="space-y-3">
                     <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Reboot Sistem</span>
                        <button onClick={() => handleCommand('reboot')} disabled={isRebooting} className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md hover:text-indigo-600 dark:hover:text-white transition-colors">
                           {isRebooting ? <Loader2 size={16} className="animate-spin" /> : <Power size={16} />}
                        </button>
                     </div>
                     <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Jalankan Diagnostik</span>
                        <button onClick={() => handleCommand('scan')} disabled={isScanning} className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md hover:text-indigo-600 dark:hover:text-white transition-colors">
                           {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Cpu size={16} />}
                        </button>
                     </div>
                     <button onClick={() => handleCommand('fault')} className="w-full flex justify-between items-center p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-100 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors">
                        <span className="text-sm font-bold text-rose-700 dark:text-rose-400">Simulasi Kerusakan</span>
                        <ShieldAlert size={16} className="text-rose-600 dark:text-rose-400" />
                     </button>
                  </div>
               </div>

               <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Spesifikasi Teknis (Specification)</h3>
                  <div className="space-y-3 text-sm">
                     <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-slate-500">Tahun Pembuatan</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{asset.yearBuilt}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-slate-500">Pabrikan</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{asset.manufacturer}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-slate-500">Kapasitas</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{asset.capacity}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-slate-500">TKDN (Local Content)</span>
                        <span className={`font-bold ${parseFloat(tkdnValue) > 60 ? 'text-emerald-600' : 'text-amber-600'}`}>{tkdnValue}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-slate-500">Sertifikasi</span>
                        <span className="font-medium text-right text-slate-800 dark:text-slate-200">{asset.certification}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="Analisis Prediktif">
           <div className="p-6 text-center">
              {aiAnalysisStage === 'analyzing' ? (
                 <div className="py-8"><div className="w-16 h-16 mx-auto border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin flex items-center justify-center text-xs font-bold text-indigo-600">{scanProgress}%</div><h3 className="text-lg font-bold mt-6 text-slate-800">Menganalisis Telemetri...</h3></div>
              ) : (
                 <div className="text-left">
                    <div className="bg-slate-50 p-5 rounded-xl flex items-start gap-4 mb-4 border border-slate-100">
                       <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><BrainCircuit size={24} /></div>
                       <div><h3 className="font-bold text-slate-800">Hasil Diagnostik</h3><p className="text-sm text-slate-600 mt-2 leading-relaxed">{aiResultText}</p></div>
                    </div>
                 </div>
              )}
           </div>
         </Modal>

         <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Detail Aset">
            <div className="p-6 space-y-4">
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Nama Aset</label>
                  <input 
                     value={editFormData.name || ''} 
                     onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                     className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50"
                  />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Lokasi</label>
                  <input 
                     value={editFormData.location || ''} 
                     onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                     className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50"
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase">Kesehatan (%)</label>
                     <input 
                        type="number"
                        value={editFormData.health || 0} 
                        onChange={(e) => setEditFormData({...editFormData, health: parseInt(e.target.value)})}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50"
                     />
                  </div>
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                     <select 
                        value={editFormData.status || 'Active'} 
                        onChange={(e) => setEditFormData({...editFormData, status: e.target.value as AssetStatus})}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50"
                     >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Maintenance">Maintenance</option>
                     </select>
                  </div>
               </div>
               <div className="flex justify-end gap-2 pt-4">
                  <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Batal</button>
                  <button onClick={handleEditSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center gap-2"><Save size={14} /> Simpan Perubahan</button>
               </div>
            </div>
         </Modal>
      </div>
    </div>
  );
};

export default AssetDetail;
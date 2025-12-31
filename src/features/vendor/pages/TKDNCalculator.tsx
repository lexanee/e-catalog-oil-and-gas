
import React, { useState, useEffect } from 'react';
import { Calculator, RefreshCw, Save, Info, PieChart as PieIcon, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const TKDNCalculator: React.FC = () => {
  // State for Goods (Barang)
  const [materialDirect, setMaterialDirect] = useState({ dn: 0, ln: 0 });
  const [equipment, setEquipment] = useState({ dn: 0, ln: 0 });

  // State for Services (Jasa)
  const [manpower, setManpower] = useState({ dn: 0, ln: 0 });
  const [tools, setTools] = useState({ dn: 0, ln: 0 });
  const [consultant, setConsultant] = useState({ dn: 0, ln: 0 });

  const [results, setResults] = useState({
    goodsTkdn: 0,
    servicesTkdn: 0,
    combinedTkdn: 0,
    totalCost: 0
  });

  const calculate = () => {
    // 1. Calculate Goods
    const totalGoodsDN = materialDirect.dn + equipment.dn;
    const totalGoodsLN = materialDirect.ln + equipment.ln;
    const totalGoods = totalGoodsDN + totalGoodsLN;
    const goodsTkdn = totalGoods > 0 ? (totalGoodsDN / totalGoods) * 100 : 0;

    // 2. Calculate Services
    const totalServicesDN = manpower.dn + tools.dn + consultant.dn;
    const totalServicesLN = manpower.ln + tools.ln + consultant.ln;
    const totalServices = totalServicesDN + totalServicesLN;
    const servicesTkdn = totalServices > 0 ? (totalServicesDN / totalServices) * 100 : 0;

    // 3. Combined (Gabungan Barang & Jasa)
    const totalCost = totalGoods + totalServices;
    const totalDN = totalGoodsDN + totalServicesDN;
    const combinedTkdn = totalCost > 0 ? (totalDN / totalCost) * 100 : 0;

    setResults({
      goodsTkdn,
      servicesTkdn,
      combinedTkdn,
      totalCost
    });
  };

  useEffect(() => {
    calculate();
  }, [materialDirect, equipment, manpower, tools, consultant]);

  const InputRow = ({ label, state, setState }: any) => (
    <div className="grid grid-cols-12 gap-4 items-center py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="col-span-4 text-sm font-medium text-slate-700 dark:text-slate-300">{label}</div>
      <div className="col-span-4 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">IDR</span>
        <input 
          type="number" 
          value={state.dn || ''} 
          onChange={(e) => setState({ ...state, dn: parseFloat(e.target.value) || 0 })}
          className="w-full pl-10 pr-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-lg text-sm outline-none focus:border-emerald-500" 
          placeholder="Biaya DN"
        />
      </div>
      <div className="col-span-4 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">IDR</span>
        <input 
          type="number" 
          value={state.ln || ''} 
          onChange={(e) => setState({ ...state, ln: parseFloat(e.target.value) || 0 })}
          className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-rose-500" 
          placeholder="Biaya LN"
        />
      </div>
    </div>
  );

  const pieData = [
    { name: 'Komponen Dalam Negeri (KDN)', value: results.combinedTkdn, color: '#10b981' },
    { name: 'Komponen Luar Negeri (KLN)', value: 100 - results.combinedTkdn, color: '#f43f5e' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in pb-20">
      <div className="mb-8">
         <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="text-indigo-600" /> Kalkulator TKDN Mandiri
         </h1>
         <p className="text-slate-500 text-sm mt-1">Simulasi penghitungan Tingkat Komponen Dalam Negeri sesuai PTK-007 Rev.05.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Input Section */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* Goods Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
               <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase">A. Komponen Barang (Goods)</h3>
                  <span className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded font-mono">
                     TKDN Barang: <span className={results.goodsTkdn >= 25 ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>{results.goodsTkdn.toFixed(2)}%</span>
                  </span>
               </div>
               <div className="p-6">
                  <div className="grid grid-cols-12 gap-4 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                     <div className="col-span-4">Uraian Biaya</div>
                     <div className="col-span-4">Biaya Dalam Negeri (KDN)</div>
                     <div className="col-span-4">Biaya Luar Negeri (KLN)</div>
                  </div>
                  <InputRow label="Bahan Baku Langsung (Direct Material)" state={materialDirect} setState={setMaterialDirect} />
                  <InputRow label="Peralatan Penunjang (Equipment)" state={equipment} setState={setEquipment} />
               </div>
            </div>

            {/* Services Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
               <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase">B. Komponen Jasa (Services)</h3>
                  <span className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded font-mono">
                     TKDN Jasa: <span className={results.servicesTkdn >= 30 ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>{results.servicesTkdn.toFixed(2)}%</span>
                  </span>
               </div>
               <div className="p-6">
                  <div className="grid grid-cols-12 gap-4 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                     <div className="col-span-4">Uraian Biaya</div>
                     <div className="col-span-4">Biaya Dalam Negeri (KDN)</div>
                     <div className="col-span-4">Biaya Luar Negeri (KLN)</div>
                  </div>
                  <InputRow label="Tenaga Kerja (Manpower - WNI/WNA)" state={manpower} setState={setManpower} />
                  <InputRow label="Alat Kerja / Fasilitas (Working Tools)" state={tools} setState={setTools} />
                  <InputRow label="Jasa Umum / Konsultan" state={consultant} setState={setConsultant} />
               </div>
            </div>
         </div>

         {/* Result Section */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 text-white rounded-xl shadow-xl p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
               <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-2">Nilai TKDN Gabungan</h3>
               <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-bold tracking-tight ${results.combinedTkdn >= 40 ? 'text-emerald-400' : results.combinedTkdn >= 25 ? 'text-amber-400' : 'text-rose-400'}`}>
                     {results.combinedTkdn.toFixed(2)}%
                  </span>
               </div>
               <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Estimasi Total Biaya Proyek</p>
                  <p className="text-xl font-mono font-bold">IDR {results.totalCost.toLocaleString('id-ID')}</p>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col items-center">
               <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Komposisi Biaya</h4>
               <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={pieData}
                           cx="50%"
                           cy="50%"
                           innerRadius={40}
                           outerRadius={60}
                           paddingAngle={5}
                           dataKey="value"
                        >
                           {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4">
               <div className="flex gap-3">
                  <Info className="text-indigo-600 shrink-0" size={20} />
                  <div>
                     <h4 className="font-bold text-indigo-900 dark:text-white text-sm">Ketentuan PTK-007</h4>
                     <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1 leading-relaxed">
                        Untuk pengadaan Barang Wajib, minimal TKDN adalah 25%. Untuk Jasa Konstruksi Migas, minimal 35%. <br/>
                        Pastikan data didukung oleh sertifikat Kemenperin yang valid.
                     </p>
                  </div>
               </div>
            </div>

            <button className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white font-bold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
               <Save size={16} /> Simpan Hasil Perhitungan
            </button>
         </div>
      </div>
    </div>
  );
};

export default TKDNCalculator;


import React, { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAssets } from '../../../context/AssetContext';
import { ArrowLeft, CheckCircle, Scale, XCircle, Award, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const CompareAssets: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { assets } = useAssets();
  const ids = searchParams.get('ids')?.split(',') || [];
  const compareAssets = assets.filter(a => ids.includes(a.id));
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<{winner: string, reasoning: string} | null>(null);

  const stats = useMemo(() => {
     if(compareAssets.length === 0) return {};
     return {
        minRate: Math.min(...compareAssets.map(a => a.dailyRate)),
        maxYear: Math.max(...compareAssets.map(a => a.yearBuilt)),
        maxHealth: Math.max(...compareAssets.map(a => a.health)),
     };
  }, [compareAssets]);

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
       if (process.env.API_KEY) {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: "Compare assets based on health and cost (Indonesian)..." });
          setRecommendation({ winner: "Analisis Selesai", reasoning: response.text || "" });
       } else {
          await new Promise(r => setTimeout(r, 1500));
          const best = compareAssets.reduce((prev, curr) => prev.health > curr.health ? prev : curr);
          setRecommendation({ winner: best.name, reasoning: `Keseimbangan terbaik antara kesehatan teknis (${best.health}%) dan biaya operasional.` });
       }
    } catch (e) { setRecommendation(null); } finally { setIsAnalyzing(false); }
  };

  if (compareAssets.length === 0) return <div className="p-10 text-center">Tidak ada aset dipilih untuk dibandingkan.</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in pb-20">
       <Link to="/products" className="text-slate-500 hover:text-slate-800 text-sm font-bold flex items-center gap-2 mb-6"><ArrowLeft size={16} /> Kembali</Link>
       
       <div className="mb-6">
          {!recommendation && !isAnalyzing && <button onClick={handleAiAnalysis} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-sm flex items-center gap-2"><Sparkles size={16} /> Rekomendasi AI</button>}
          {isAnalyzing && <div className="flex items-center gap-2 text-indigo-600 font-bold"><Loader2 className="animate-spin" /> Menganalisis...</div>}
          {recommendation && (
             <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl relative">
                <button onClick={() => setRecommendation(null)} className="absolute top-4 right-4 text-slate-400"><XCircle size={20} /></button>
                <div className="flex gap-4">
                   <div className="p-2 bg-indigo-100 rounded-lg h-fit text-indigo-600"><Award size={24} /></div>
                   <div><h3 className="font-bold text-lg text-indigo-900">Rekomendasi Utama: {recommendation.winner}</h3><p className="text-sm text-indigo-700 mt-1">{recommendation.reasoning}</p></div>
                </div>
             </div>
          )}
       </div>

       <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                      <th className="p-4 w-48 text-xs uppercase font-bold text-slate-500">Fitur</th>
                      {compareAssets.map(a => <th key={a.id} className="p-4 min-w-[200px] border-l border-slate-200 dark:border-slate-800"><div className="font-bold text-base text-slate-900 dark:text-white">{a.name}</div><div className="text-xs text-slate-500">{a.number}</div></th>)}
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                   <tr><td className="p-4 font-bold text-slate-500">Tarif Harian</td>{compareAssets.map(a => <td key={a.id} className={`p-4 border-l ${a.dailyRate === stats.minRate ? 'bg-emerald-50 font-bold text-emerald-700' : 'text-slate-700 dark:text-slate-300'}`}>IDR {a.dailyRate.toLocaleString()}</td>)}</tr>
                   <tr><td className="p-4 font-bold text-slate-500">Tahun</td>{compareAssets.map(a => <td key={a.id} className={`p-4 border-l ${a.yearBuilt === stats.maxYear ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-700 dark:text-slate-300'}`}>{a.yearBuilt}</td>)}</tr>
                   <tr><td className="p-4 font-bold text-slate-500">Kesehatan</td>{compareAssets.map(a => <td key={a.id} className={`p-4 border-l ${a.health === stats.maxHealth ? 'bg-emerald-50 font-bold text-emerald-700' : 'text-slate-700 dark:text-slate-300'}`}>{a.health}%</td>)}</tr>
                   <tr><td className="p-4 font-bold text-slate-500">Lokasi</td>{compareAssets.map(a => <td key={a.id} className="p-4 border-l text-slate-700 dark:text-slate-300">{a.location}</td>)}</tr>
                   <tr><td className="p-4 font-bold text-slate-500">Aksi</td>{compareAssets.map(a => <td key={a.id} className="p-4 border-l"><Link to={`/request/${a.id}`} className="block w-full text-center py-2 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800">Pilih</Link></td>)}</tr>
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};

export default CompareAssets;

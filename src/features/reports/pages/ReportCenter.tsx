
import React from 'react';
import { FileText, Download, Printer, Filter, Calendar } from 'lucide-react';

const ReportCenter: React.FC = () => {
  const reports = [
    { id: 'RPT-001', title: 'Rekapitulasi Paket Tender & Kontrak', category: 'Procurement', date: 'Bulanan', desc: 'Ringkasan tender aktif, pemenang, dan nilai kontrak terintegrasi.' },
    { id: 'RPT-002', title: 'Laporan Status Katalog Aset', category: 'Technical', date: 'Real-time', desc: 'Daftar aset berdasarkan status siklus hidup (Konsep, Verifikasi, Aktif).' },
    { id: 'RPT-003', title: 'Laporan Realisasi TKDN & Kepatuhan Vendor', category: 'Compliance', date: 'Triwulan', desc: 'Analisis capaian TKDN Barang/Jasa dan skor CSMS mitra.' },
    { id: 'RPT-004', title: 'Berita Acara Asesmen Ketersediaan (Market Enquiry)', category: 'Market', date: 'Ad-hoc', desc: 'Hasil survei pasar dan ketersediaan aset untuk perencanaan pengadaan.' },
    { id: 'RPT-005', title: 'Pergerakan Material Logistik (Shorebase)', category: 'Logistics', date: 'Harian', desc: 'Laporan stok dan pengiriman material dari Pusat Logistik Berikat (PLB).' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in pb-20">
      <div className="mb-8">
         <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pusat Laporan (Report Center)</h1>
         <p className="text-slate-500 text-sm mt-1">Unduh laporan resmi operasional dan keuangan untuk audit.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
            <div className="flex gap-2">
               <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-50">
                  <Filter size={14} /> Filter Kategori
               </button>
               <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-50">
                  <Calendar size={14} /> Periode: 2024
               </button>
            </div>
         </div>
         
         <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {reports.map((report) => (
               <div key={report.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <div className="flex gap-4 items-start">
                     <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
                        <FileText size={24} />
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <h3 className="font-bold text-slate-900 dark:text-white text-base">{report.title}</h3>
                           <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase">{report.category}</span>
                        </div>
                        <p className="text-sm text-slate-500 max-w-xl">{report.desc}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                           <span>ID: {report.id}</span>
                           <span>Frekuensi: {report.date}</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex gap-3">
                     <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2">
                        <Printer size={16} /> Preview
                     </button>
                     <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 flex items-center gap-2">
                        <Download size={16} /> Download PDF
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default ReportCenter;

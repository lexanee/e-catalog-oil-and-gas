
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
      <div className="w-20 h-20 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle size={40} className="text-indigo-600 dark:text-indigo-400" />
      </div>
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Halaman Tidak Ditemukan</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
        Halaman yang Anda cari mungkin telah dipindahkan, diganti namanya, atau sedang tidak tersedia untuk sementara waktu.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
      >
        <Home size={16} /> Kembali ke Beranda
      </Link>
    </div>
  );
};

export default NotFound;

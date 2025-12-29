
import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Check, BookOpen, UserCircle, AlertOctagon, HelpCircle, Activity, ChevronRight, Search, Command } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAssets } from '../../context/AssetContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';

interface NavbarProps {
   toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const location = useLocation();
  const { unreadCount, notifications, markAllAsRead, markAsRead } = useAssets();
  const { user } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // War Room Detection
  const activeCrisis = notifications.find(n => n.type === 'critical' || (n.type === 'warning' && n.title.includes('WEATHER')));
  const isWarRoomActive = !!activeCrisis;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  if (location.pathname === '/login') return null;

  const getPageTitle = () => {
     if(location.pathname === '/') return 'Ringkasan';
     if(location.pathname.includes('live-map')) return 'Geospasial';
     if(location.pathname.includes('vendor')) return 'Portal Mitra';
     if(location.pathname.includes('settings')) return 'Pengaturan';
     const parts = location.pathname.split('/');
     const main = parts[1];
     return main.charAt(0).toUpperCase() + main.slice(1).replace('-', ' ');
  }

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((new Date().getTime() - new Date(date).getTime()) / 60000);
    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes}m lalu`;
    return `${Math.floor(minutes / 60)}j lalu`;
  };

  return (
    <>
      {/* War Room Banner - Refined Ticker Style */}
      {isWarRoomActive && (
         <div className="bg-rose-50 border-b border-rose-100 text-rose-700 px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-2 sticky top-0 z-[60] shadow-sm animate-fade-in">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
            <AlertOctagon size={14} /> 
            <span className="tracking-wide">PROTOKOL AKTIF: {activeCrisis?.title.toUpperCase()}</span>
         </div>
      )}

      {/* Navbar - Solid, Thin Border */}
      <header className={`h-16 px-6 flex items-center justify-between z-30 transition-all bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800`}>
         
         <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
               <Menu size={20} />
            </button>
            
            {/* Breadcrumb */}
            <div className="hidden md:flex items-center text-sm text-slate-500 dark:text-slate-400">
               <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors">SKK Migas</span>
               <ChevronRight size={14} className="mx-2 text-slate-300" />
               <span className="font-semibold text-slate-800 dark:text-white">{getPageTitle()}</span>
            </div>
         </div>

         {/* Center Search - Minimalist Input */}
         <div className="hidden lg:flex items-center relative group">
            <Search size={14} className="absolute left-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
               type="text" 
               placeholder="Cari aset, tender..." 
               className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-10 py-2 text-sm w-80 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm" 
            />
            <div className="absolute right-3 flex items-center gap-1 pointer-events-none">
               <Command size={10} className="text-slate-400" />
               <span className="text-[10px] text-slate-400 font-mono">K</span>
            </div>
         </div>

         <div className="flex items-center gap-2">
            <button onClick={() => setIsHelpOpen(true)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors hidden md:block">
               <HelpCircle size={18} />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
               <button 
                 onClick={() => setIsNotifOpen(!isNotifOpen)}
                 className={`p-2 rounded-lg transition-colors relative ${isNotifOpen ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}
               >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                     <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-950"></span>
                  )}
               </button>

               {/* Dropdown - Soft Shadow */}
               {isNotifOpen && (
                 <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in origin-top-right z-50">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                       <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wide">Notifikasi</h3>
                       {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                             Tandai dibaca
                          </button>
                       )}
                    </div>
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                       {notifications.length === 0 ? (
                          <div className="p-10 text-center text-slate-400">
                             <Bell size={24} className="mx-auto mb-3 opacity-20" />
                             <p className="text-xs font-medium">Belum ada notifikasi</p>
                          </div>
                       ) : (
                          <div className="divide-y divide-slate-100 dark:divide-slate-800">
                             {notifications.map(notif => (
                                <div key={notif.id} onClick={() => markAsRead(notif.id)} className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex gap-3 transition-colors ${!notif.read ? 'bg-slate-50 dark:bg-slate-800' : ''}`}>
                                   <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.type === 'critical' ? 'bg-rose-500 shadow-sm shadow-rose-200' : notif.type === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
                                   <div className="flex-1">
                                      <div className="flex justify-between items-start mb-1">
                                         <p className={`text-sm ${!notif.read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>{notif.title}</p>
                                         <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{getTimeAgo(notif.timestamp)}</span>
                                      </div>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{notif.message}</p>
                                   </div>
                                </div>
                             ))}
                          </div>
                       )}
                    </div>
                 </div>
               )}
            </div>
         </div>

         {/* Help Modal */}
         <Modal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="Panduan Sistem">
            <div className="p-4 space-y-4">
               <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2"><Activity size={16} /> Simulasi War Room</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">Pergi ke <strong>Pengaturan</strong> untuk memicu skenario krisis (Cuaca, Serangan Siber) dan amati reaksi sistem secara real-time.</p>
               </div>
            </div>
         </Modal>
      </header>
    </>
  );
};

export default Navbar;


import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Database, Settings, LogOut, FileSpreadsheet, ShieldCheck, Warehouse, Briefcase, ChevronDown, Activity, Hexagon, Search, Map, ClipboardList } from 'lucide-react';

const Sidebar: React.FC<{ isOpen: boolean, setIsOpen: (val: boolean) => void }> = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isAssetMenuOpen, setIsAssetMenuOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem = ({ to, icon: Icon, label, end = false, children }: any) => {
     return (
        <NavLink 
           to={to} 
           end={end}
           className={({ isActive }) => 
              `group flex items-center justify-between px-3 py-2 mx-3 rounded-lg text-sm font-medium transition-all duration-200 border border-transparent ${
                 isActive 
                 ? 'bg-slate-50 dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 border-slate-100 dark:border-slate-800' 
                 : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
              }`
           }
        >
           {({ isActive }) => (
              <>
                 <div className="flex items-center gap-3">
                    <Icon size={18} className={`transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600"}`} />
                    <span className="truncate">{label}</span>
                 </div>
                 {children}
              </>
           )}
        </NavLink>
     );
  }

  const role = user?.role;
  const catalogPath = role === 'technical' ? '/master-data' : '/asset-catalog';

  return (
    <>
      <div 
         className={`fixed inset-0 z-40 bg-slate-950/90 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
         onClick={() => setIsOpen(false)}
      />

      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 transform transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative flex flex-col shadow-xl md:shadow-none`}>
         
         <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm shadow-indigo-200 dark:shadow-none">
                <Hexagon size={18} className="text-white fill-current" />
            </div>
            <div>
               <h1 className="font-bold text-slate-900 dark:text-white text-sm leading-tight tracking-tight">SKK Migas</h1>
               <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                  {role === 'scm' ? 'SCM / Pengadaan' : role === 'technical' ? 'User Teknis' : 'Portal Penyedia'}
               </p>
            </div>
         </div>

         <nav className="flex-1 overflow-y-auto py-6 space-y-8 custom-scrollbar">
            
            {/* --- SCM & TECHNICAL SHARED VIEWS --- */}
            {(role === 'scm' || role === 'technical') && (
               <>
                  <div className="space-y-1">
                     <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Pemantauan (Monitoring)</p>
                     <NavItem to="/" icon={LayoutDashboard} label="Ringkasan Eksekutif" end />
                     <NavItem to="/live-map" icon={Map} label="Peta Operasional">
                        <span className="flex h-2 w-2 relative">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                     </NavItem>
                  </div>

                  <div className="space-y-1">
                     <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                        {role === 'technical' ? 'Master Data Aset' : 'Katalog Aset'}
                     </p>
                     
                     <div className="mx-3">
                        <button 
                           onClick={() => setIsAssetMenuOpen(!isAssetMenuOpen)}
                           className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-transparent ${location.pathname.includes('asset-catalog') || location.pathname.includes('master-data') ? 'bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900'}`}
                        >
                           <div className="flex items-center gap-3"><Database size={18} className={(location.pathname.includes('asset-catalog') || location.pathname.includes('master-data')) ? "text-indigo-600" : "text-slate-400"} /> <span>{role === 'technical' ? 'Master Data' : 'Katalog'}</span></div>
                           <ChevronDown size={14} className={`transition-transform duration-200 text-slate-400 ${isAssetMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isAssetMenuOpen ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                           <div className="pl-4 space-y-1 border-l border-slate-100 dark:border-slate-800 ml-4 my-1">
                              <NavLink to={`${catalogPath}?category=Kapal`} className="block pl-4 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Kapal (Vessels)</NavLink>
                              <NavLink to={`${catalogPath}?category=Offshore%20Rig`} className="block pl-4 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Offshore Rigs</NavLink>
                              <NavLink to={`${catalogPath}?category=Onshore%20Rig`} className="block pl-4 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Onshore Rigs</NavLink>
                           </div>
                        </div>
                     </div>
                  </div>
               </>
            )}

            {/* --- SCM SPECIFIC --- */}
            {role === 'scm' && (
               <div className="space-y-1">
                  <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Pengadaan (Procurement)</p>
                  <NavItem to="/market-assessment" icon={Search} label="Asesmen Pasar" />
                  <NavItem to="/request-list" icon={ClipboardList} label="Permintaan (Enquiry)" />
                  <NavItem to="/tenders" icon={FileSpreadsheet} label="Manajemen Tender" />
                  <NavItem to="/contracts" icon={ShieldCheck} label="Monitoring Kontrak" />
                  <NavItem to="/vendors" icon={Briefcase} label="Database Penyedia" />
               </div>
            )}

            {/* --- TECHNICAL SPECIFIC --- */}
            {role === 'technical' && (
               <div className="space-y-1">
                  <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Operasional Teknis</p>
                  <NavItem to="/request-list" icon={ClipboardList} label="Verifikasi Teknis" />
                  <NavItem to="/logistics" icon={Warehouse} label="Pangkalan Logistik" />
               </div>
            )}

            {/* --- SCM LOGISTICS --- */}
            {role === 'scm' && (
                <div className="space-y-1">
                    <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Logistik</p>
                    <NavItem to="/logistics" icon={Warehouse} label="Pangkalan Logistik" />
                </div>
            )}

            {/* --- VENDOR SPECIFIC --- */}
            {role === 'vendor' && (
               <div className="space-y-1">
                  <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Portal Mitra</p>
                  <NavItem to="/vendor" icon={LayoutDashboard} label="Dashboard Mitra" />
                  <NavItem to="/asset-catalog" icon={Database} label="Aset Terdaftar" />
                  <NavItem to="/settings" icon={Settings} label="Profil Perusahaan" />
               </div>
            )}
         </nav>

         <div className="p-4 border-t border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center gap-3 mb-3">
               <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-sm">
                  {user?.avatar || 'US'}
               </div>
               <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 truncate capitalize">{user?.company || role}</p>
               </div>
               {role !== 'vendor' && (
                  <NavLink to="/settings" className="text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors">
                     <Settings size={16} />
                  </NavLink>
               )}
            </div>
            <button 
               onClick={handleLogout}
               className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-lg transition-all"
            >
               <LogOut size={14} /> Keluar (Sign Out)
            </button>
         </div>
      </div>
    </>
  );
};

export default Sidebar;

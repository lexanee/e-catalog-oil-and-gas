
import React, { useState, useEffect, useMemo } from 'react';
import { useAssets } from '../../../context/AssetContext';
import { useAuth } from '../../../context/AuthContext';
import { AssetCategory, AssetStatus } from '../../../types';
import { Search, LayoutGrid, Plus, MapPin, List as ListIcon, Ship, Anchor, Truck, ChevronDown, ChevronUp, SlidersHorizontal, Battery, Shield, MoreHorizontal, FileText, CheckSquare, Square } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Modal from '../../../components/common/Modal';
import CreateAssetWizard from '../components/CreateAssetWizard';

const AssetRegistry: React.FC = () => {
  const { assets } = useAssets();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') as AssetCategory) || 'Kapal';
  
  const [activeTab, setActiveTab] = useState<AssetCategory>(initialCategory);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AssetStatus>('All');
  const [minYear, setMinYear] = useState<string>('');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('All');

  const navigate = useNavigate();

  useEffect(() => {
     const cat = searchParams.get('category') as AssetCategory;
     if (cat && ['Kapal', 'Offshore Rig', 'Onshore Rig'].includes(cat)) {
        setActiveTab(cat);
     }
  }, [searchParams]);

  const handleTabChange = (tab: AssetCategory) => {
     setActiveTab(tab);
     setSearchParams({ category: tab });
     setSelectedManufacturer('All'); 
     setSelectedForCompare([]);
  };

  const toggleCompare = (id: string) => {
    setSelectedForCompare(prev => {
       if (prev.includes(id)) return prev.filter(item => item !== id);
       if (prev.length >= 3) { alert("Max 3 assets."); return prev; }
       return [...prev, id];
    });
  };

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // Role-based Data Visibility
      if (user?.role === 'vendor' && asset.ownerVendorId !== user.id) {
         return false;
      }

      if (asset.category !== activeTab) return false;
      const searchLower = searchTerm.toLowerCase();
      if (!asset.name.toLowerCase().includes(searchLower) && !asset.number.toLowerCase().includes(searchLower)) return false;
      if (statusFilter !== 'All' && asset.status !== statusFilter) return false;
      if (minYear && asset.yearBuilt < parseInt(minYear)) return false;
      if (selectedManufacturer !== 'All' && asset.manufacturer !== selectedManufacturer) return false;
      return true;
    });
  }, [assets, activeTab, searchTerm, statusFilter, minYear, selectedManufacturer, user]);

  const manufacturers = useMemo(() => ['All', ...Array.from(new Set(assets.filter(a => a.category === activeTab).map(a => a.manufacturer || ''))).filter(Boolean)], [assets, activeTab]);

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in pb-28">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
             {user?.role === 'vendor' ? 'Katalog Aset Saya' : 'Master Data Aset'}
          </h1>
          <p className="text-slate-500 text-sm">
             {user?.role === 'vendor' ? 'Kelola armada dan peralatan yang terdaftar.' : 'Katalog aset terpusat dan spesifikasi teknis.'}
          </p>
        </div>
        <div className="flex gap-2">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 flex">
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-white' : 'text-slate-400'}`}><ListIcon size={16} /></button>
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-white' : 'text-slate-400'}`}><LayoutGrid size={16} /></button>
           </div>
           {/* Vendors can add assets */}
           {(user?.role === 'vendor' || user?.role === 'technical') && (
              <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
                <Plus size={16} /> Registrasi Aset Baru
              </button>
           )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Clean Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800 px-2 flex gap-1 pt-2 bg-slate-50 dark:bg-slate-950">
           {(['Kapal', 'Offshore Rig', 'Onshore Rig'] as AssetCategory[]).map((tab) => (
             <button
               key={tab}
               onClick={() => handleTabChange(tab)}
               className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-bold transition-all border-t border-x border-b-0 ${activeTab === tab ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white -mb-px' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
             >
               {tab === 'Kapal' ? <Ship size={14} /> : tab === 'Offshore Rig' ? <Anchor size={14} /> : <Truck size={14} />}
               {tab}
             </button>
           ))}
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row gap-4 justify-between bg-white dark:bg-slate-900">
           <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Cari nama atau nomor aset..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500 transition-all" />
           </div>
           <div className="flex gap-2">
              <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${isFilterOpen ? 'bg-slate-100 border-slate-300 text-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                 <SlidersHorizontal size={14} /> Filter {isFilterOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
           </div>
        </div>

        {isFilterOpen && (
           <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-in">
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Status</label>
                 <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="w-full p-2 text-sm border rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 outline-none"><option value="All">Semua Status</option><option value="Active">Active</option><option value="Inactive">Inactive</option></select>
              </div>
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Pabrikan</label>
                 <select value={selectedManufacturer} onChange={(e) => setSelectedManufacturer(e.target.value)} className="w-full p-2 text-sm border rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 outline-none">{manufacturers.map(m => <option key={m} value={m}>{m}</option>)}</select>
              </div>
           </div>
        )}

        <div className="bg-slate-50 dark:bg-slate-950 min-h-[400px]">
           {viewMode === 'list' ? (
              <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                    <thead>
                       <tr className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-xs uppercase font-bold sticky top-0">
                          <th className="px-6 py-3 w-12"></th>
                          <th className="px-6 py-3">Nama Aset</th>
                          <th className="px-6 py-3">Spesifikasi</th>
                          <th className="px-6 py-3">Lokasi</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3 text-right">Aksi</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                       {filteredAssets.length === 0 ? (
                          <tr><td colSpan={6} className="p-10 text-center text-slate-400 italic">Tidak ada aset ditemukan.</td></tr>
                       ) : filteredAssets.map(asset => {
                          const isSelected = selectedForCompare.includes(asset.id);
                          return (
                            <tr key={asset.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900' : ''}`}>
                               <td className="px-6 py-3 text-center">
                                  <button onClick={() => toggleCompare(asset.id)} className={`text-slate-400 hover:text-indigo-600 ${isSelected ? 'text-indigo-600' : ''}`}>{isSelected ? <CheckSquare size={16} /> : <Square size={16} />}</button>
                               </td>
                               <td className="px-6 py-3">
                                  <div className="font-bold text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600" onClick={() => navigate(`/product/${asset.id}`)}>{asset.name}</div>
                                  <div className="text-xs text-slate-500 font-mono">{asset.number}</div>
                               </td>
                               <td className="px-6 py-3">
                                  <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2"><Battery size={12} /> {asset.capacity}</div>
                                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5"><Shield size={12} /> {asset.certification}</div>
                               </td>
                               <td className="px-6 py-3 text-slate-600 dark:text-slate-300 flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> {asset.location}</td>
                               <td className="px-6 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${asset.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{asset.status}</span></td>
                               <td className="px-6 py-3 text-right">
                                  <button onClick={() => navigate(`/product/${asset.id}`)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><MoreHorizontal size={16} /></button>
                               </td>
                            </tr>
                          );
                       })}
                    </tbody>
                 </table>
              </div>
           ) : (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 {filteredAssets.length === 0 ? <p className="col-span-4 text-center text-slate-400 py-10 italic">Tidak ada aset ditemukan.</p> : filteredAssets.map(asset => {
                    const isSelected = selectedForCompare.includes(asset.id);
                    return (
                      <div key={asset.id} onClick={() => navigate(`/product/${asset.id}`)} className={`bg-white dark:bg-slate-900 border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all relative group ${isSelected ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-800'}`}>
                         <button onClick={(e) => { e.stopPropagation(); toggleCompare(asset.id); }} className="absolute top-3 right-3 text-slate-300 hover:text-indigo-600 z-10">{isSelected ? <CheckSquare size={18} className="text-indigo-600" /> : <Square size={18} />}</button>
                         <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg w-fit text-slate-500">{asset.category === 'Kapal' ? <Ship size={20} /> : <Anchor size={20} />}</div>
                         <h3 className="font-bold text-slate-900 dark:text-white truncate pr-6">{asset.name}</h3>
                         <p className="text-xs text-slate-500 mb-4">{asset.location}</p>
                         <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-center">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{asset.capacity}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${asset.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{asset.status}</span>
                         </div>
                      </div>
                    );
                 })}
              </div>
           )}
        </div>
      </div>

      {selectedForCompare.length > 0 && (
         <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-xl shadow-xl p-3 flex items-center gap-4 border border-slate-700">
            <span className="text-sm font-bold pl-2">{selectedForCompare.length} Dipilih</span>
            <div className="h-6 w-px bg-slate-700"></div>
            <button onClick={() => setSelectedForCompare([])} className="text-xs text-slate-400 hover:text-white">Batal</button>
            <button onClick={() => selectedForCompare.length > 1 && navigate(`/compare?ids=${selectedForCompare.join(',')}`)} disabled={selectedForCompare.length < 2} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${selectedForCompare.length > 1 ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-500'}`}>Bandingkan</button>
         </div>
      )}

      {/* Enhanced Asset Registration Wizard */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrasi Aset Baru">
         <CreateAssetWizard onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default AssetRegistry;

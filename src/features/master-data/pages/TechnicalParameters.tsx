
import React, { useState } from 'react';
import { AssetCategory } from '../../../types';
import { useMasterData, TechnicalParameter } from '../../../context/MasterDataContext';
import { Save, Plus, Trash2, Settings, Ship, Anchor, Truck, Check, AlertCircle, Layers } from 'lucide-react';

const TechnicalParameters: React.FC = () => {
  const { configurations, updateConfiguration, availableLibrary } = useMasterData();
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>('Kapal');
  const [isToastVisible, setIsToastVisible] = useState(false);

  // Local state for editing before saving
  const [activeParams, setActiveParams] = useState<TechnicalParameter[]>(
    configurations[selectedCategory]
  );

  const handleCategoryChange = (cat: AssetCategory) => {
    setSelectedCategory(cat);
    setActiveParams(configurations[cat]);
  };

  const addParameter = (paramId: string) => {
    const paramToAdd = availableLibrary.find(p => p.id === paramId);
    if (paramToAdd && !activeParams.some(p => p.id === paramId)) {
      setActiveParams([...activeParams, paramToAdd]);
    }
  };

  const removeParameter = (paramId: string) => {
    setActiveParams(activeParams.filter(p => p.id !== paramId));
  };

  const handleSave = () => {
    updateConfiguration(selectedCategory, activeParams);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 3000);
  };

  const availableToAdd = availableLibrary.filter(
    p => !activeParams.some(active => active.id === p.id)
  );

  // Sorting params by group for better visibility
  const sortedParams = [...activeParams].sort((a,b) => (a.group || 'Umum').localeCompare(b.group || 'Umum'));

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in pb-24">
      {isToastVisible && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-slide-in">
          <Check size={18} className="text-emerald-400" />
          <span className="text-sm font-bold">Konfigurasi Berhasil Disimpan!</span>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="text-indigo-600" /> Master Data: Parameter Teknis
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Konfigurasi atribut teknis wajib untuk proses asesmen dan katalogisasi aset.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Category Selection */}
        <div className="lg:col-span-1 space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase px-1">Pilih Komoditas</label>
          {(['Kapal', 'Offshore Rig', 'Onshore Rig'] as AssetCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                selectedCategory === cat
                  ? 'bg-white dark:bg-slate-900 border-indigo-600 shadow-md ring-1 ring-indigo-600'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
              }`}
            >
              <div className={`p-2 rounded-lg ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {cat === 'Kapal' ? <Ship size={20} /> : cat === 'Offshore Rig' ? <Anchor size={20} /> : <Truck size={20} />}
              </div>
              <span className={`font-bold text-sm ${selectedCategory === cat ? 'text-indigo-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                {cat}
              </span>
            </button>
          ))}
        </div>

        {/* Main Content: Parameter Config */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Konfigurasi: {selectedCategory}</h3>
                <p className="text-xs text-slate-500">Tentukan field spesifikasi yang aktif untuk kategori ini.</p>
              </div>
              <button 
                onClick={handleSave}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-sm active:scale-95 transition-all"
              >
                <Save size={16} /> Simpan Perubahan
              </button>
            </div>

            {/* Add Parameter Section */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tambah Parameter Baru</label>
              <div className="flex gap-2">
                <select 
                  className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500"
                  onChange={(e) => {
                    if (e.target.value) {
                      addParameter(e.target.value);
                      e.target.value = "";
                    }
                  }}
                >
                  <option value="">-- Pilih dari Pustaka Parameter --</option>
                  {availableToAdd.map(p => (
                    <option key={p.id} value={p.id}>{p.label} ({p.unit || 'No Unit'}) - {p.group}</option>
                  ))}
                </select>
                <div className="w-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Plus size={20} className="text-slate-400" />
                </div>
              </div>
            </div>

            {/* Active Parameters List */}
            <div className="flex-1 p-6 bg-slate-50 dark:bg-slate-950">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Parameter Aktif ({activeParams.length})</h4>
              </div>
              
              {activeParams.length === 0 ? (
                <div className="p-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center">
                  <AlertCircle size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">Belum ada parameter dikonfigurasi.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedParams.map((param, index) => (
                    <div key={param.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm group hover:border-indigo-300 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">{index + 1}</span>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                             <p className="font-bold text-sm text-slate-800 dark:text-white">{param.label}</p>
                             {param.group && <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-500 flex items-center gap-1"><Layers size={10} /> {param.group}</span>}
                          </div>
                          <div className="flex gap-2 text-xs text-slate-500">
                            <span className="font-mono bg-slate-50 px-1.5 rounded border border-slate-100 dark:border-slate-700">{param.field}</span>
                            <span>•</span>
                            <span>{param.type === 'number' ? 'Numerik' : 'Teks'}</span>
                            {param.unit && <span>• {param.unit}</span>}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeParameter(param.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                        title="Hapus Parameter"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalParameters;

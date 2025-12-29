
import React, { useState } from 'react';
import { Asset, AssetCategory, AssetStatus } from '../../../types';
import { useAssets } from '../../../context/AssetContext';
import { validateAssetReadiness } from '../../../utils/AssetCompliance';
import { Check, ChevronRight, ChevronLeft, Upload, MapPin, Anchor, Truck, Ship, AlertCircle, Info, Save } from 'lucide-react';

interface CreateAssetWizardProps {
  onClose: () => void;
}

const InputField = ({ label, field, type = 'text', placeholder, required = true, value, onChange, error }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
      {label} {required && <span className="text-rose-500">*</span>}
      {error && <span className="text-rose-500 normal-case flex items-center gap-1"><AlertCircle size={10} /> {error}</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      className={`w-full p-3 bg-white dark:bg-slate-900 border rounded-lg text-sm outline-none transition-all ${error ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'}`}
      placeholder={placeholder}
    />
  </div>
);

const CreateAssetWizard: React.FC<CreateAssetWizardProps> = ({ onClose }) => {
  const { addAsset } = useAssets();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<{
    name: string;
    category: AssetCategory;
    owner: string;
    image: string;
    manufacturer: string;
    yearBuilt: number;
    drillingDepth?: string;
    horsePower?: string;
    dwt?: string;
    bollardPull?: string;
    lat: string;
    lng: string;
    status: AssetStatus;
    locationName: string;
  }>({
    name: '',
    category: 'Onshore Rig',
    owner: '',
    image: '',
    manufacturer: '',
    yearBuilt: new Date().getFullYear(),
    drillingDepth: '',
    horsePower: '',
    dwt: '',
    bollardPull: '',
    lat: '-6.2000',
    lng: '106.8166',
    status: 'Active',
    locationName: ''
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if(errors[field]) setErrors(prev => ({...prev, [field]: ''}));
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.name) newErrors.name = "Nama Aset harus diisi";
      if (!formData.owner) newErrors.owner = "Pemilik/Vendor harus diisi";
    }

    if (currentStep === 2) {
      if (!formData.manufacturer) newErrors.manufacturer = "Pabrikan harus diisi";
      if (formData.category.includes('Rig')) {
         if (!formData.horsePower) newErrors.horsePower = "Horsepower wajib diisi";
      } else {
         if (!formData.bollardPull) newErrors.bollardPull = "Bollard Pull/DWT wajib diisi";
      }
    }

    if (currentStep === 3) {
      if (!formData.lat || isNaN(parseFloat(formData.lat))) newErrors.lat = "Latitude tidak valid";
      if (!formData.lng || isNaN(parseFloat(formData.lng))) newErrors.lng = "Longitude tidak valid";
      if (!formData.locationName) newErrors.locationName = "Nama Lokasi wajib diisi";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) isValid = false;
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (!validateStep(3)) return;

    let capacityString = '';
    if (formData.category.includes('Rig')) {
        capacityString = `${formData.horsePower} HP / ${formData.drillingDepth || 'N/A'} ft`;
    } else {
        capacityString = `${formData.bollardPull} Ton BP / ${formData.dwt || 'N/A'} DWT`;
    }

    const newAsset: Asset = {
      id: Date.now().toString(),
      number: `${new Date().getFullYear()}/${formData.category === 'Kapal' ? 'VS' : 'RG'}/${Math.floor(Math.random() * 10000)}`,
      name: formData.name,
      category: formData.category,
      status: formData.status,
      location: formData.locationName,
      coordinates: { lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) },
      history: [],
      dailyRate: 0, 
      health: 100,
      csmsScore: 100, // REFACTORED
      incidentCount: 0,
      daysSinceIncident: 0,
      yearBuilt: formData.yearBuilt,
      manufacturer: formData.manufacturer,
      capacity: capacityString,
      certification: 'BKI Class (Pending)', 
      co2Emissions: 0,
      totalEmissions: 0,
      sustainabilityScore: 100,
      maintenanceLog: [],
      inventory: [],
      nextMaintenanceDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      mtbf: 5000 
    };

    try {
      validateAssetReadiness(newAsset);
      addAsset(newAsset);
      onClose();
    } catch (e: any) {
      alert(`Asset Validation Failed:\n${e.message}`);
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-0"></div>
          
          {[1, 2, 3].map((s) => (
            <div key={s} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step >= s ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                {step > s ? <Check size={14} /> : s}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= s ? 'text-indigo-600 dark:text-white' : 'text-slate-400'}`}>
                {s === 1 ? 'Umum' : s === 2 ? 'Spesifikasi' : 'Lokasi'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white dark:bg-slate-900">
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
               <InputField label="Nama Aset" field="name" value={formData.name} onChange={handleChange} error={errors.name} placeholder="e.g. Deepwater Horizon II" />
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Kategori</label>
                  <div className="grid grid-cols-3 gap-2">
                     {[
                        { id: 'Onshore Rig', icon: Truck, label: 'Land Rig' },
                        { id: 'Offshore Rig', icon: Anchor, label: 'Offshore' },
                        { id: 'Kapal', icon: Ship, label: 'Vessel' }
                     ].map((cat) => (
                        <button
                           key={cat.id}
                           onClick={() => setFormData({...formData, category: cat.id as AssetCategory})}
                           className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${formData.category === cat.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'}`}
                        >
                           <cat.icon size={20} className="mb-1" />
                           <span className="text-[10px] font-bold">{cat.label}</span>
                        </button>
                     ))}
                  </div>
               </div>
            </div>
            <InputField label="Pemilik / Vendor (KKKS)" field="owner" value={formData.owner} onChange={handleChange} error={errors.owner} placeholder="e.g. Pertamina Hulu Energi" />
            <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
               <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-2 group-hover:scale-110 transition-transform"><Upload size={20} /></div>
               <span className="text-xs font-bold">Upload Foto Aset</span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
             <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs mb-2">
                <Info size={16} /><span>Konfigurasi spesifikasi untuk <strong>{formData.category}</strong></span>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <InputField label="Pabrikan (Manufacturer)" field="manufacturer" value={formData.manufacturer} onChange={handleChange} error={errors.manufacturer} placeholder="e.g. Keppel FELS" />
                <InputField label="Tahun Pembuatan" field="yearBuilt" type="number" value={formData.yearBuilt} onChange={handleChange} error={errors.yearBuilt} />
             </div>
             {formData.category.includes('Rig') ? (
                <div className="grid grid-cols-2 gap-4">
                   <InputField label="Horsepower (HP)" field="horsePower" value={formData.horsePower} onChange={handleChange} error={errors.horsePower} placeholder="e.g. 2000" />
                   <InputField label="Drilling Depth (ft)" field="drillingDepth" value={formData.drillingDepth} onChange={handleChange} error={errors.drillingDepth} placeholder="e.g. 30,000" required={false} />
                </div>
             ) : (
                <div className="grid grid-cols-2 gap-4">
                   <InputField label="Bollard Pull (Ton)" field="bollardPull" value={formData.bollardPull} onChange={handleChange} error={errors.bollardPull} placeholder="e.g. 80" />
                   <InputField label="Deadweight (DWT)" field="dwt" value={formData.dwt} onChange={handleChange} error={errors.dwt} placeholder="e.g. 4500" required={false} />
                </div>
             )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
             <div className="bg-slate-100 dark:bg-slate-800 h-32 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700 mb-4 relative overflow-hidden">
                <MapPin size={32} /><span className="ml-2 text-xs font-bold">Pin lokasi pada peta</span>
             </div>
             <InputField label="Nama Lokasi (Blok/Area)" field="locationName" value={formData.locationName} onChange={handleChange} error={errors.locationName} placeholder="e.g. Natuna Sea Block A" />
             <div className="grid grid-cols-2 gap-4">
                <InputField label="Latitude" field="lat" value={formData.lat} onChange={handleChange} error={errors.lat} placeholder="-6.2000" />
                <InputField label="Longitude" field="lng" value={formData.lng} onChange={handleChange} error={errors.lng} placeholder="106.8166" />
             </div>
             <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Status Awal</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as AssetStatus})} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500">
                   <option value="Active">Active (Operational)</option>
                   <option value="Inactive">Inactive (Warm Stacked)</option>
                </select>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between bg-slate-50 dark:bg-slate-950">
         {step > 1 ? (
            <button onClick={handleBack} className="px-6 py-2.5 rounded-lg font-bold text-sm text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"><ChevronLeft size={16} /> Kembali</button>
         ) : <button onClick={onClose} className="px-6 py-2.5 rounded-lg font-bold text-sm text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">Batal</button>}
         {step < 3 ? (
            <button onClick={handleNext} className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold text-sm shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2">Lanjut <ChevronRight size={16} /></button>
         ) : (
            <button onClick={handleSubmit} className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-sm shadow-sm hover:bg-emerald-700 transition-opacity flex items-center gap-2"><Save size={16} /> Simpan Aset</button>
         )}
      </div>
    </div>
  );
};

export default CreateAssetWizard;

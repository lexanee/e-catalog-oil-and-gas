import React, { useState, useMemo } from "react";
import { Asset, AssetCategory, AssetStatus } from "../../../types";
import { useAssets } from "../../../context/AssetContext";
import { useAuth } from "../../../context/AuthContext";
import { useMasterData } from "../../../context/MasterDataContext";
import { validateAssetReadiness } from "../../../utils/AssetCompliance";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  MapPin,
  Anchor,
  Truck,
  Ship,
  AlertCircle,
  Info,
  Save,
} from "lucide-react";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

interface CreateAssetWizardProps {
  onClose: () => void;
}

const InputField = ({
  label,
  field,
  type = "text",
  placeholder,
  required = true,
  value,
  onChange,
  error,
}: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
      {label} {required && <span className="text-rose-500">*</span>}
      {error && (
        <span className="text-rose-500 normal-case flex items-center gap-1">
          <AlertCircle size={10} /> {error}
        </span>
      )}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      className={`w-full p-3 bg-white dark:bg-slate-900 border rounded-lg text-sm outline-none transition-all ${
        error
          ? "border-rose-400 focus:border-rose-500"
          : "border-slate-200 dark:border-slate-700 focus:border-indigo-500"
      }`}
      placeholder={placeholder}
    />
  </div>
);

const CreateAssetWizard: React.FC<CreateAssetWizardProps> = ({ onClose }) => {
  const { addAsset } = useAssets();
  const { user } = useAuth();
  const { configurations } = useMasterData();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<{
    name: string;
    category: AssetCategory;
    owner: string;
    image: string;
    manufacturer: string;
    yearBuilt: number;
    lat: string;
    lng: string;
    status: AssetStatus;
    locationName: string;
  }>({
    name: "",
    category: "Onshore Rig",
    owner: user?.company || "",
    image: "",
    manufacturer: "",
    yearBuilt: new Date().getFullYear(),
    lat: "-6.2000",
    lng: "106.8166",
    status: "Registered",
    locationName: "",
  });

  const [dynamicSpecs, setDynamicSpecs] = useState<Record<string, any>>({});

  // Group Dynamic Fields
  const groupedParameters = useMemo(() => {
    const params = configurations[formData.category] || [];
    const groups: Record<string, typeof params> = {};
    params.forEach((param) => {
      const groupName = param.group || "Umum";
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(param);
    });
    return groups;
  }, [formData.category, configurations]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.name) newErrors.name = "Nama Aset harus diisi";
      if (!formData.owner) newErrors.owner = "Pemilik/Vendor harus diisi";
    }

    // Step 2 is now mostly optional dynamic fields, but we ensure at least manufacturer
    if (currentStep === 2) {
      if (!formData.manufacturer)
        newErrors.manufacturer = "Pabrikan harus diisi";
    }

    if (currentStep === 3) {
      if (!formData.lat || isNaN(parseFloat(formData.lat)))
        newErrors.lat = "Latitude tidak valid";
      if (!formData.lng || isNaN(parseFloat(formData.lng)))
        newErrors.lng = "Longitude tidak valid";
      if (!formData.locationName)
        newErrors.locationName = "Nama Lokasi wajib diisi";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) isValid = false;
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: "",
  });

  const handleSubmit = () => {
    if (!validateStep(3)) return;

    let capacityString = "Pending Specs";
    if (formData.category === "Kapal") {
      if (dynamicSpecs.bollardPull)
        capacityString = `${dynamicSpecs.bollardPull} Ton BP`;
      else if (dynamicSpecs.dwt) capacityString = `${dynamicSpecs.dwt} DWT`;
    } else {
      if (dynamicSpecs.ratedHP) capacityString = `${dynamicSpecs.ratedHP} HP`;
      if (dynamicSpecs.drillingDepth)
        capacityString += ` / ${dynamicSpecs.drillingDepth} ft`;
    }

    const newAsset: Asset = {
      id: Date.now().toString(),
      number: `${new Date().getFullYear()}/${
        formData.category === "Kapal" ? "VS" : "RG"
      }/${Math.floor(Math.random() * 10000)}`,
      name: formData.name,
      category: formData.category,
      status: "Registered",
      location: formData.locationName,
      coordinates: {
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
      },
      history: [],
      dailyRate: 0,
      health: 100,
      csmsScore: 100,
      incidentCount: 0,
      daysSinceIncident: 0,
      yearBuilt: formData.yearBuilt,
      manufacturer: formData.manufacturer,
      capacityString: capacityString,
      specs: dynamicSpecs,
      certification: "BKI Class (Pending)",
      co2Emissions: 0,
      totalEmissions: 0,
      sustainabilityScore: 100,
      maintenanceLog: [],
      inventory: [],
      nextMaintenanceDate: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      )
        .toISOString()
        .split("T")[0],
      mtbf: 5000,
      ownerType: user?.role === "vendor" ? "Foreign" : "National",
      ownerVendorId: user?.id,
    };

    try {
      validateAssetReadiness(newAsset);
      addAsset(newAsset);
      onClose();
    } catch (e: any) {
      setErrorModal({ isOpen: true, message: e.message });
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-0"></div>

          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="relative z-10 flex flex-col items-center gap-2"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step >= s
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                    : "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400"
                }`}
              >
                {step > s ? <Check size={14} /> : s}
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  step >= s
                    ? "text-indigo-600 dark:text-white"
                    : "text-slate-400"
                }`}
              >
                {s === 1 ? "Umum" : s === 2 ? "Spesifikasi" : "Lokasi"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white dark:bg-slate-900">
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Nama Aset"
                field="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="e.g. Deepwater Horizon II"
              />
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Kategori
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "Onshore Rig", icon: Truck, label: "Land Rig" },
                    { id: "Offshore Rig", icon: Anchor, label: "Offshore" },
                    { id: "Kapal", icon: Ship, label: "Vessel" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          category: cat.id as AssetCategory,
                        });
                        setDynamicSpecs({}); // Reset specs on category change
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        formData.category === cat.id
                          ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 text-indigo-700 dark:text-indigo-300"
                          : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500"
                      }`}
                    >
                      <cat.icon size={20} className="mb-1" />
                      <span className="text-[10px] font-bold">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <InputField
              label="Pemilik / Vendor (KKKS)"
              field="owner"
              value={formData.owner}
              onChange={handleChange}
              error={errors.owner}
              placeholder="e.g. Pertamina Hulu Energi"
            />
            <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-2 group-hover:scale-110 transition-transform">
                <Upload size={20} />
              </div>
              <span className="text-xs font-bold">Upload Foto Aset</span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs mb-2">
              <Info size={16} />
              <span>
                Konfigurasi spesifikasi untuk{" "}
                <strong>{formData.category}</strong>
              </span>
            </div>

            {/* Static Basic Specs */}
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Pabrikan (Manufacturer)"
                field="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                error={errors.manufacturer}
                placeholder="e.g. Keppel FELS"
              />
              <InputField
                label="Tahun Pembuatan"
                field="yearBuilt"
                type="number"
                value={formData.yearBuilt}
                onChange={handleChange}
                error={errors.yearBuilt}
              />
            </div>

            {/* Dynamic Grouped Specs */}
            {Object.keys(groupedParameters).length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">
                Belum ada parameter teknis wajib yang dikonfigurasi.
              </p>
            ) : (
              Object.keys(groupedParameters).map((groupName) => (
                <div
                  key={groupName}
                  className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 pb-1 border-b border-slate-200 dark:border-slate-700">
                    {groupName}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {groupedParameters[groupName].map((param) => (
                      <div key={param.id} className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {param.label}{" "}
                          <span className="text-[10px] text-slate-400">
                            ({param.unit || "-"})
                          </span>
                        </label>
                        <input
                          type={param.type === "number" ? "number" : "text"}
                          value={dynamicSpecs[param.field] || ""}
                          onChange={(e) =>
                            setDynamicSpecs({
                              ...dynamicSpecs,
                              [param.field]: e.target.value,
                            })
                          }
                          className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 outline-none focus:border-indigo-500 transition-colors"
                          placeholder="..."
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-slate-100 dark:bg-slate-800 h-32 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700 mb-4 relative overflow-hidden">
              <MapPin size={32} />
              <span className="ml-2 text-xs font-bold">
                Pin lokasi pada peta
              </span>
            </div>
            <InputField
              label="Nama Lokasi (Blok/Area)"
              field="locationName"
              value={formData.locationName}
              onChange={handleChange}
              error={errors.locationName}
              placeholder="e.g. Natuna Sea Block A"
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Latitude"
                field="lat"
                value={formData.lat}
                onChange={handleChange}
                error={errors.lat}
                placeholder="-6.2000"
              />
              <InputField
                label="Longitude"
                field="lng"
                value={formData.lng}
                onChange={handleChange}
                error={errors.lng}
                placeholder="106.8166"
              />
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg flex items-center gap-3">
              <Info size={20} className="text-amber-600" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Aset akan didaftarkan dengan status{" "}
                <strong>Konsep (Draft)</strong> dan memerlukan verifikasi.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between bg-slate-50 dark:bg-slate-950">
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="px-6 py-2.5 rounded-lg font-bold text-sm text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <ChevronLeft size={16} /> Kembali
          </button>
        ) : (
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg font-bold text-sm text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
          >
            Batal
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold text-sm shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Lanjut <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-sm shadow-sm hover:bg-emerald-700 transition-opacity flex items-center gap-2"
          >
            <Save size={16} /> Submit Aset
          </button>
        )}
      </div>
      <ConfirmationModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title="Validasi Gagal"
        message={errorModal.message}
        type="danger"
        singleButton={true}
        confirmText="OK"
      />
    </div>
  );
};

export default CreateAssetWizard;

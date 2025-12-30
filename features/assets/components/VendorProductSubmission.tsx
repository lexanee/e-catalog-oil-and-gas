import React, { useState, useMemo } from "react";
import { Asset, AssetCategory, DataOwner } from "../../../types";
import { useAssets } from "../../../context/AssetContext";
import { useAuth } from "../../../context/AuthContext";
import { useMasterData } from "../../../context/MasterDataContext";
import {
  Search,
  Upload,
  CheckCircle,
  Ship,
  Anchor,
  Truck,
  ChevronRight,
  ChevronLeft,
  Save,
  SlidersHorizontal,
  AlertCircle,
  Building2,
  Calendar,
  FileText,
  Globe,
  Shield,
  Activity,
  Navigation,
  Droplets,
} from "lucide-react";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

interface VendorProductSubmissionProps {
  onClose: () => void;
}

// Mock BKI Data for simulation
const MOCK_BKI_DB: Record<string, any> = {
  "9737668": {
    name: "TRITON 501",
    type: "Anchor Handling Tug Supply (AHTS)",
    grossTonnage: 1558,
    dwt: 2000,
    yearBuilt: 2015,
    manufacturer: "Batam Shipyard",
    flag: "Indonesia",
    class: "BKI Class A1",
    loa: 70,
    breadth: 16,
  },
};

const STEPS = [
  { id: 1, title: "Identitas & Klasifikasi", icon: Ship },
  { id: 2, title: "Kepemilikan", icon: Building2 },
  { id: 3, title: "Spesifikasi Teknis", icon: SlidersHorizontal },
  { id: 4, title: "Dokumen", icon: FileText },
  { id: 5, title: "Review", icon: CheckCircle },
];

const VendorProductSubmission: React.FC<VendorProductSubmissionProps> = ({
  onClose,
}) => {
  const { addAsset } = useAssets();
  const { user } = useAuth();
  const { configurations } = useMasterData();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "info" | "warning" | "danger" | "success";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // Form State
  const [category, setCategory] = useState<AssetCategory>("Kapal");
  const [isBKI, setIsBKI] = useState(true);
  const [imoNumber, setImoNumber] = useState("");
  const [bkiDataFound, setBkiDataFound] = useState<any>(null);

  // Ownership State
  const [ownershipType, setOwnershipType] = useState<"Owner" | "Operator">(
    "Owner"
  );
  const [priorityType, setPriorityType] = useState<"1" | "2" | "3">("1");
  const [dataOwner, setDataOwner] = useState<DataOwner>({
    name: user?.company || "",
    email: user?.email || "",
    phone: "",
    address: "",
    type: "Owner",
    appointmentEndDate: "",
    appointmentDoc: "",
    proofOfOwnershipDoc: "",
  });

  // Asset Info
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState("");

  // Specs State
  const [activeSpecTab, setActiveSpecTab] = useState("umum");
  const [dynamicSpecs, setDynamicSpecs] = useState<Record<string, any>>({});

  // Docs State
  const [docs, setDocs] = useState({
    ownershipProof: false,
    operatorAppointment: false,
    shareOwnership: false,
    flagCommitment: false,
    leasingAgreement: false,
  });

  // Mock Validation
  const validateStep = (currentStep: number) => {
    if (currentStep === 1) return assetName.length > 0;
    if (currentStep === 2)
      return dataOwner.name.length > 0 && dataOwner.address.length > 0;
    return true;
  };

  const handleBKISearch = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const data = MOCK_BKI_DB[imoNumber];
      if (data) {
        setBkiDataFound(data);
        setAssetName(data.name);
        setAssetType(data.type);
        setDynamicSpecs((prev) => ({
          ...prev,
          yearBuilt: data.yearBuilt,
          dwt: data.dwt,
          flagCountry: data.flag,
        }));
      } else {
        setAlertState({
          isOpen: true,
          title: "Data Tidak Ditemukan",
          message:
            "Data BKI tidak ditemukan untuk IMO Number tersebut. (Coba: 9737668)",
          type: "warning",
        });
      }
    }, 1000);
  };

  const handleSubmit = () => {
    // Generate capacity string based on key metrics
    let capacityString = "Pending Specs";
    if (category === "Kapal") {
      if (dynamicSpecs.bollardPull)
        capacityString = `${dynamicSpecs.bollardPull} Ton BP`;
      else if (dynamicSpecs.dwt) capacityString = `${dynamicSpecs.dwt} DWT`;
    } else {
      if (dynamicSpecs.ratedHP) capacityString = `${dynamicSpecs.ratedHP} HP`;
    }

    const newAsset: Asset = {
      id: Date.now().toString(),
      number: `PENDING-${Math.floor(Math.random() * 10000)}`,
      name: assetName,
      category: category,
      status: "Registered",
      location: "TBD",
      coordinates: { lat: -6.0, lng: 106.0 },
      history: [],
      dailyRate: 0,
      health: 100,
      csmsScore: 0,
      incidentCount: 0,
      daysSinceIncident: 0,
      yearBuilt: parseInt(dynamicSpecs.yearBuilt) || new Date().getFullYear(),
      manufacturer: "Unknown",
      flagCountry: priorityType === "1" ? "Indonesia" : "Foreign",
      ownerType: priorityType === "1" ? "National" : "Foreign",
      ownerVendorId: user?.id,
      dataOwner: { ...dataOwner, type: ownershipType }, // Detailed Owner Info
      certification: isBKI ? "BKI Class" : "Non-BKI",
      capacityString: capacityString,
      specs: dynamicSpecs,
      co2Emissions: 0,
      totalEmissions: 0,
      nextMaintenanceDate: "",
      mtbf: 0,
      imoNumber: imoNumber,
      subType: assetType,

      // Detailed Spec Objects (from new Types)
      // Note: In a real app we would map dynamicSpecs fields to these objects
    };

    addAsset(newAsset);
    onClose();
  };

  return (
    <div className="flex flex-col h-[750px] w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar Stepper */}
      <div className="flex h-full">
        <div className="w-64 bg-slate-900 dark:bg-black p-6 flex flex-col hidden md:flex shrink-0">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Post Asset
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Sistem Pendukung Keputusan MIGAS
            </p>
          </div>
          <div className="space-y-6 relative">
            {/* Vertical Line */}
            <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-slate-800 -z-0"></div>

            {STEPS.map((s) => (
              <div key={s.id} className="flex items-center gap-3 relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step >= s.id
                      ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                      : "bg-slate-800 text-slate-500 border border-slate-700"
                  }`}
                >
                  {step > s.id ? <CheckCircle size={14} /> : s.id}
                </div>
                <div>
                  <span
                    className={`text-sm font-bold block transition-colors ${
                      step === s.id
                        ? "text-white"
                        : step > s.id
                        ? "text-indigo-400"
                        : "text-slate-500"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-slate-800">
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <h4 className="text-white text-xs font-bold mb-1">
                Butuh Bantuan?
              </h4>
              <p className="text-slate-400 text-[10px]">
                Hubungi Helpdesk e-Catalog di 021-555-000
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
          {/* Mobile Header */}
          <div className="md:hidden p-4 bg-slate-900 text-white flex justify-between items-center">
            <span className="font-bold">Langkah {step} dari 5</span>
            <span className="text-xs text-slate-400">
              {STEPS[step - 1].title}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
            {/* STEP 1: IDENTITAS */}
            {step === 1 && (
              <div className="space-y-8 animate-fade-in max-w-3xl">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Identitas & Klasifikasi
                  </h2>
                  <p className="text-slate-500">
                    Tentukan jenis aset dan status klasifikasi.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {["Kapal", "Offshore Rig", "Onshore Rig"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat as AssetCategory);
                        setDynamicSpecs({});
                      }}
                      className={`group relative p-4 rounded-xl border-2 text-left transition-all ${
                        category === cat
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                          : "border-slate-100 dark:border-slate-800 hover:border-indigo-200"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${
                          category === cat
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900"
                        }`}
                      >
                        {cat === "Kapal" ? (
                          <Ship size={20} />
                        ) : cat.includes("Offshore") ? (
                          <Anchor size={20} />
                        ) : (
                          <Truck size={20} />
                        )}
                      </div>
                      <span
                        className={`font-bold block ${
                          category === cat
                            ? "text-indigo-900 dark:text-indigo-300"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {cat}
                      </span>
                      {category === cat && (
                        <div className="absolute top-3 right-3 text-indigo-600">
                          <CheckCircle size={18} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* BKI Section */}
                {category === "Kapal" && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex gap-6 mb-6">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isBKI ? "border-indigo-600" : "border-slate-300"
                          }`}
                        >
                          {isBKI && (
                            <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
                          )}
                        </div>
                        <input
                          type="radio"
                          checked={isBKI}
                          onChange={() => setIsBKI(true)}
                          className="hidden"
                        />
                        <div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                            Klasifikasi BKI
                          </span>
                          <p className="text-xs text-slate-500">
                            Terdaftar di Biro Klasifikasi Indonesia
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            !isBKI ? "border-indigo-600" : "border-slate-300"
                          }`}
                        >
                          {!isBKI && (
                            <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
                          )}
                        </div>
                        <input
                          type="radio"
                          checked={!isBKI}
                          onChange={() => setIsBKI(false)}
                          className="hidden"
                        />
                        <div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                            Non-BKI / Asing
                          </span>
                          <p className="text-xs text-slate-500">
                            IACS Member / Bendera Asing
                          </p>
                        </div>
                      </label>
                    </div>

                    {isBKI && (
                      <div className="flex gap-2 relative">
                        <input
                          type="text"
                          value={imoNumber}
                          onChange={(e) => setImoNumber(e.target.value)}
                          className="flex-1 p-3 pl-10 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:border-indigo-500 outline-none"
                          placeholder="Masukkan IMO Number untuk auto-fill..."
                        />
                        <Search
                          className="absolute left-3 top-3.5 text-slate-400"
                          size={16}
                        />
                        <button
                          onClick={handleBKISearch}
                          disabled={isLoading}
                          className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                        >
                          {isLoading ? "Mencari..." : "Cari Data"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Nama Aset <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:border-indigo-500 outline-none"
                      placeholder={`Nama ${category}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Tipe / Sub-Kategori
                    </label>
                    <input
                      type="text"
                      value={assetType}
                      onChange={(e) => setAssetType(e.target.value)}
                      className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:border-indigo-500 outline-none"
                      placeholder="e.g. AHTS / Jack-up"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: KEPEMILIKAN */}
            {step === 2 && (
              <div className="space-y-8 animate-fade-in max-w-3xl">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Detail Kepemilikan
                  </h2>
                  <p className="text-slate-500">
                    Lengkapi data pemilik atau operator aset.
                  </p>
                </div>

                <div className="p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-6">
                  <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg w-fit">
                    <button
                      onClick={() => {
                        setOwnershipType("Owner");
                        setDataOwner({ ...dataOwner, type: "Owner" });
                      }}
                      className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                        ownershipType === "Owner"
                          ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      Owner (Milik Sendiri)
                    </button>
                    <button
                      onClick={() => {
                        setOwnershipType("Operator");
                        setDataOwner({ ...dataOwner, type: "Operator" });
                      }}
                      className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                        ownershipType === "Operator"
                          ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      Operator (Sewa/Agen)
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        Nama Entitas <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={dataOwner.name}
                        onChange={(e) =>
                          setDataOwner({ ...dataOwner, name: e.target.value })
                        }
                        className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        Surat Elektronik (Email)
                      </label>
                      <input
                        type="email"
                        value={dataOwner.email}
                        onChange={(e) =>
                          setDataOwner({ ...dataOwner, email: e.target.value })
                        }
                        className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 outline-none"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        Alamat Lengkap <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        value={dataOwner.address}
                        onChange={(e) =>
                          setDataOwner({
                            ...dataOwner,
                            address: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 outline-none h-24 resize-none"
                      />
                    </div>

                    {ownershipType === "Operator" && (
                      <div className="col-span-2 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-sm">
                          <AlertCircle size={16} /> Data Penunjukan Operator
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs text-amber-900/70 dark:text-amber-400/70 font-bold">
                              Berlaku Hingga
                            </label>
                            <input
                              type="date"
                              className="w-full p-2 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-amber-900/70 dark:text-amber-400/70 font-bold">
                              Dokumen Penunjukan
                            </label>
                            <button className="w-full p-2 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-left flex items-center justify-between text-slate-500">
                              <span>Upload PDF...</span> <Upload size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: TEKNIS */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      Spesifikasi Teknis
                    </h2>
                    <p className="text-slate-500">
                      Detail teknis sesuai Master Parameter MIGAS.
                    </p>
                  </div>
                  <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    <Activity size={14} /> Auto-Fill dari History
                  </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 dark:border-slate-800 flex gap-6">
                  {[
                    "Umum",
                    "Kapasitas",
                    "Mesin",
                    "Navigasi",
                    "Keselamatan",
                  ].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveSpecTab(tab.toLowerCase())}
                      className={`pb-3 text-sm font-bold transition-all relative ${
                        activeSpecTab === tab.toLowerCase()
                          ? "text-indigo-600"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {tab}
                      {activeSpecTab === tab.toLowerCase() && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4">
                  {/* General Specs (Always Visible) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Tahun Pembuatan
                    </label>
                    <input
                      type="number"
                      value={dynamicSpecs.yearBuilt || ""}
                      onChange={(e) =>
                        setDynamicSpecs({
                          ...dynamicSpecs,
                          yearBuilt: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Pabrikan (Manufacturer)
                    </label>
                    <input
                      type="text"
                      value={dynamicSpecs.manufacturer || ""}
                      onChange={(e) =>
                        setDynamicSpecs({
                          ...dynamicSpecs,
                          manufacturer: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>

                  {/* Tab Specific Simulation */}
                  {activeSpecTab === "umum" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">
                          LOA (Length Overall)
                        </label>
                        <input
                          type="number"
                          placeholder="m"
                          className="w-full p-3 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">
                          Breadth
                        </label>
                        <input
                          type="number"
                          placeholder="m"
                          className="w-full p-3 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                    </>
                  )}

                  {activeSpecTab === "kapasitas" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">
                          Fuel Oil Capacity
                        </label>
                        <input
                          type="number"
                          placeholder="m3"
                          className="w-full p-3 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">
                          Fresh Water
                        </label>
                        <input
                          type="number"
                          placeholder="m3"
                          className="w-full p-3 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: DOCS */}
            {step === 4 && (
              <div className="space-y-8 animate-fade-in max-w-3xl">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <FileText size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Dokumen Pendukung
                  </h2>
                  <p className="text-slate-500">
                    Unggah dokumen wajib dalam format PDF (Max 5MB).
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-indigo-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-lg shadow-sm text-indigo-600">
                        <Shield size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">
                          Bukti Kepemilikan (Gross Akta){" "}
                          <span className="text-rose-500">*</span>
                        </h4>
                        <p className="text-xs text-slate-500">
                          Wajib untuk verifikasi aset.
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-white text-indigo-600 text-xs font-bold rounded-lg shadow-sm border border-indigo-100 group-hover:border-indigo-300">
                      Upload
                    </button>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-slate-50 opacity-60">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-100 rounded-lg text-slate-500">
                        <Navigation size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">
                          Sertifikat Klasifikasi
                        </h4>
                        <p className="text-xs text-slate-500">
                          Class Certificate (Hull & Machinery)
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg">
                      Optional
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW */}
            {step === 5 && (
              <div className="space-y-8 animate-fade-in max-w-2xl mx-auto text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <CheckCircle size={40} />
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Siap untuk Submit?
                  </h2>
                  <p className="text-slate-500">
                    Pastikan seluruh data yang Anda masukkan sudah benar.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-left space-y-4">
                  <div className="flex justify-between border-b border-slate-200 pb-3">
                    <span className="text-sm text-slate-500 font-medium">
                      Nama Aset
                    </span>
                    <span className="text-sm text-slate-900 font-bold">
                      {assetName}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-3">
                    <span className="text-sm text-slate-500 font-medium">
                      Kategori
                    </span>
                    <span className="text-sm text-slate-900 font-bold">
                      {category} ({isBKI ? "BKI" : "Non-BKI"})
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-3">
                    <span className="text-sm text-slate-500 font-medium">
                      Pemilik
                    </span>
                    <span className="text-sm text-slate-900 font-bold">
                      {dataOwner.name} ({ownershipType})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500 font-medium">
                      Dokumen
                    </span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">
                      Lengkap
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700">
                  Dengan menekan tombol Submit, Anda menyatakan bahwa data yang
                  diisi adalah benar dan dapat dipertanggungjawabkan sesuai
                  peraturan MIGAS.
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between bg-white dark:bg-slate-900">
            {step === 1 ? (
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
            ) : (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-colors flex items-center gap-2"
              >
                <ChevronLeft size={18} /> Kembali
              </button>
            )}

            {step < 5 ? (
              <button
                onClick={() => validateStep(step) && setStep(step + 1)}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2"
              >
                Lanjut <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 dark:shadow-none transition-all flex items-center gap-2"
              >
                <Save size={18} /> Submit Aset
              </button>
            )}
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        singleButton={true}
        confirmText="OK"
      />
    </div>
  );
};

export default VendorProductSubmission;

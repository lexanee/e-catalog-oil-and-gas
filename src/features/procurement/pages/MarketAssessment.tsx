import React, { useState, useEffect, useMemo } from "react";
import { useMarketAssessment } from "../../../hooks/useMarketAssessment";
import { useProcurement } from "../../../context/ProcurementContext";
import { useAssets } from "../../../context/AssetContext";
import { useAuth } from "../../../context/AuthContext";
import { useMasterData } from "../../../context/MasterDataContext"; // Use Dynamic Data
import { AssetCategory, Asset, TechnicalSpecs } from "../../../types";
import {
  Filter,
  Save,
  RotateCcw,
  Search,
  CheckCircle,
  Plus,
  Printer,
  ListFilter,
  Battery,
  MapPin,
  Ship,
  Anchor,
  Truck,
  ArrowLeft,
  ArrowRight,
  Trash2,
  CheckSquare,
  Square,
  Settings2,
} from "lucide-react";
import Modal from "../../../components/common/Modal";
import ConfirmationModal, {
  ConfirmationType,
} from "../../../components/common/ConfirmationModal";
import { GoogleGenAI } from "@google/genai";

// Types
type FilterCondition = "greater_than" | "less_than" | "equal" | "contains";
type LogicOperator = "AND" | "OR";
type ViewState = "LIST" | "CREATE_STEP_1" | "CREATE_STEP_2" | "DETAIL";

interface AssessmentParameter {
  id: string;
  label: string;
  field: string; // keyof Asset or TechnicalSpecs
  type: "number" | "string" | "date";
  condition: FilterCondition;
  value: string;
  isActive: boolean;
}

const SUB_TYPES: Record<AssetCategory, string[]> = {
  Kapal: ["AHTS", "PSV", "Crewboat", "Tugboat", "LCT", "Barge"],
  "Offshore Rig": ["Jack-up", "Semi Submersible", "Drill Ship", "Submersible"],
  "Onshore Rig": ["Land Rig"],
};

const MarketAssessment: React.FC = () => {
  const {
    assessment,
    updateTitle,
    saveAssessment,
    resetAssessment,
    updateFilters,
  } = useMarketAssessment();
  const { vendors, contracts, requests, assessments } = useProcurement();
  const { assets } = useAssets();
  const { user } = useAuth();
  const { configurations } = useMasterData(); // Retrieve configured parameters

  const [viewState, setViewState] = useState<ViewState>("LIST");
  const [logicOperator, setLogicOperator] = useState<LogicOperator>("AND");

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: ConfirmationType;
    onConfirm?: () => void;
    singleButton?: boolean;
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    singleButton: true,
  });

  const [selectedCategory, setSelectedCategory] =
    useState<AssetCategory>("Kapal");
  const [selectedSubType, setSelectedSubType] = useState<string>("");

  const [parameters, setParameters] = useState<AssessmentParameter[]>([]);
  const [availableFields, setAvailableFields] = useState<any[]>([]);

  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 30))
      .toISOString()
      .split("T")[0]
  );

  // Setup Available Fields based on Category from Master Data Context
  useEffect(() => {
    setAvailableFields(configurations[selectedCategory] || []);
  }, [selectedCategory, configurations]);

  // Group available fields for the dropdown
  const fieldGroups = useMemo(() => {
    const groups: Record<string, any[]> = {};
    availableFields.forEach((field) => {
      const groupName = field.group || "Umum";
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(field);
    });
    return groups;
  }, [availableFields]);

  const handleStartNew = () => {
    resetAssessment();
    setViewState("CREATE_STEP_1");
    setSelectedSubType("");
    setParameters([]);
  };

  const handleCommoditySelect = (cat: AssetCategory) => {
    setSelectedCategory(cat);
    setSelectedSubType("");
  };

  const handleSubTypeSelect = (sub: string) => {
    setSelectedSubType(sub);
    updateFilters({ category: selectedCategory, subType: sub });

    // Initialize default params from Master Data (First 2 as default)
    const defaultParams = configurations[selectedCategory]
      .slice(0, 2)
      .map((p, idx) => ({
        id: `def-${idx}`,
        label: p.label,
        field: p.field,
        type: p.type,
        condition: p.type === "number" ? "greater_than" : "contains",
        value: "",
        isActive: true,
      }));
    setParameters(defaultParams as AssessmentParameter[]);
    setViewState("CREATE_STEP_2");
  };

  const handleBackToList = () => setViewState("LIST");

  const addParameter = (fieldObj: any) => {
    const newParam: AssessmentParameter = {
      id: `p-${Date.now()}`,
      label: fieldObj.label,
      field: fieldObj.field,
      type: fieldObj.type,
      condition: fieldObj.type === "number" ? "greater_than" : "contains",
      value: "",
      isActive: true,
    };
    setParameters((prev) => [...prev, newParam]);
  };

  const removeParameter = (id: string) => {
    setParameters((prev) => prev.filter((p) => p.id !== id));
  };

  const handleParamChange = (
    id: string,
    field: keyof AssessmentParameter,
    val: any
  ) => {
    setParameters((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const checkAvailability = (asset: Asset) => {
    const sDate = new Date(startDate).getTime();
    const eDate = new Date(endDate).getTime();

    const bookedInContract = contracts.some((c) => {
      if (c.status !== "Active") return false;
      if (!c.assetNames.includes(asset.name)) return false;
      const cs = new Date(c.startDate).getTime();
      const ce = new Date(c.endDate).getTime();
      return sDate <= ce && eDate >= cs;
    });
    if (bookedInContract) return false;

    const bookedInRequest = requests.some((r) => {
      if (!["Approved", "Pending"].includes(r.status)) return false;
      if (r.assetName !== asset.name) return false;
      if (!r.dateFrom || !r.dateTo) return false;
      const rs = new Date(r.dateFrom).getTime();
      const re = new Date(r.dateTo).getTime();
      return sDate <= re && eDate >= rs;
    });
    if (bookedInRequest) return false;

    return true;
  };

  const runCalculatedAssessment = () => {
    let candidates = assets.filter(
      (a) => a.category === selectedCategory && a.status === "Active"
    );

    if (selectedSubType) {
      candidates = candidates.filter((a) => a.subType === selectedSubType);
    }

    candidates = candidates.filter(checkAvailability);

    candidates = candidates.filter((asset) => {
      const activeParams = parameters.filter((p) => p.isActive);
      if (activeParams.length === 0) return true;

      const results = activeParams.map((param) => {
        // LOOKUP IN ASSET ROOT OR SPECS
        let assetVal: any = (asset as any)[param.field];
        if (assetVal === undefined && asset.specs) {
          assetVal = (asset.specs as any)[param.field];
        }

        // Handle missing values gracefully
        if (assetVal === undefined || assetVal === null) return false;

        const compareVal =
          param.type === "number"
            ? parseFloat(param.value)
            : param.value.toLowerCase();
        const actualVal =
          param.type === "number"
            ? Number(assetVal)
            : String(assetVal).toLowerCase();

        switch (param.condition) {
          case "greater_than":
            return actualVal >= compareVal;
          case "less_than":
            return actualVal <= compareVal;
          case "equal":
            return actualVal == compareVal;
          case "contains":
            return String(actualVal).includes(String(compareVal));
          default:
            return false;
        }
      });

      if (logicOperator === "AND") return results.every((r) => r === true);
      else return results.some((r) => r === true);
    });

    assessment.candidates = candidates;
    setViewState("DETAIL");
  };

  const executeSave = () => {
    try {
      saveAssessment("FINAL");
      setViewState("LIST");
    } catch (e: any) {
      setTimeout(() => {
        setModalConfig({
          isOpen: true,
          title: "Gagal Menyimpan",
          message: e.message,
          type: "danger",
          singleButton: true,
        });
      }, 100);
    }
  };

  const handleSaveClick = () => {
    setModalConfig({
      isOpen: true,
      title: "Simpan Permanen",
      message:
        "Apakah Anda yakin ingin menyimpan hasil asesmen ini? Dokumen akan disimpan dengan status Tersimpan dan tidak dapat diubah.",
      type: "info", // or warning
      singleButton: false,
      confirmText: "Ya, Simpan",
      cancelText: "Batal",
      onConfirm: executeSave,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in pb-20 print:p-0 print:max-w-none">
      {/* Header - Hidden on Print */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Asesmen Ketersediaan (Market Enquiry)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Penyaringan aset berdasarkan parameter teknis dan ketersediaan
            waktu.
          </p>
        </div>
        {viewState === "LIST" && (
          <button
            onClick={handleStartNew}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 flex items-center gap-2"
          >
            <Plus size={16} /> Buat Asesmen Baru
          </button>
        )}
      </div>

      {/* VIEW: LIST (History) */}
      {viewState === "LIST" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari Asesmen..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Judul Asesmen</th>
                <th className="px-6 py-4">Tanggal Pencarian</th>
                <th className="px-6 py-4">Komoditas</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {assessments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">
                    Belum ada riwayat asesmen.
                  </td>
                </tr>
              ) : (
                assessments.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {doc.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-medium">
                        {doc.filters.category}{" "}
                        {doc.filters.subType ? `(${doc.filters.subType})` : ""}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          doc.status === "Tersimpan"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-600 font-bold text-xs hover:underline">
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW: CREATE STEP 1 (Select Commodity & SubType) */}
      {viewState === "CREATE_STEP_1" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in p-6">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleBackToList}
              className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Pilih Komoditas & Jenis Aset
              </h2>
              <p className="text-slate-500 text-sm">
                Tentukan kategori utama dan sub-jenis aset yang dibutuhkan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {(["Kapal", "Offshore Rig", "Onshore Rig"] as AssetCategory[]).map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => handleCommoditySelect(cat)}
                  className={`p-6 border-2 rounded-xl transition-all group flex items-center gap-4 text-left ${
                    selectedCategory === cat
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-slate-100 dark:border-slate-800 hover:border-indigo-300"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      selectedCategory === cat
                        ? "bg-white text-indigo-600"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    {cat === "Kapal" ? (
                      <Ship size={24} />
                    ) : cat === "Offshore Rig" ? (
                      <Anchor size={24} />
                    ) : (
                      <Truck size={24} />
                    )}
                  </div>
                  <div>
                    <span
                      className={`font-bold block text-lg ${
                        selectedCategory === cat
                          ? "text-indigo-700 dark:text-white"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {cat}
                    </span>
                    <span className="text-xs text-slate-500 group-hover:text-indigo-500/80 transition-colors">
                      Klik untuk memilih
                    </span>
                  </div>
                </button>
              )
            )}
          </div>

          <div className="animate-slide-in">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 block">
              Pilih Jenis {selectedCategory}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {SUB_TYPES[selectedCategory].map((sub) => (
                <button
                  key={sub}
                  onClick={() => handleSubTypeSelect(sub)}
                  className="px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 text-slate-600 dark:text-slate-300 transition-colors text-center"
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: CREATE STEP 2 (Parameters) */}
      {viewState === "CREATE_STEP_2" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-slide-in">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewState("CREATE_STEP_1")}
                className="text-slate-400 hover:text-slate-600"
              >
                <ArrowLeft size={18} />
              </button>
              <h3 className="font-bold text-slate-900 dark:text-white">
                Konfigurasi: {selectedCategory} ({selectedSubType})
              </h3>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Judul Asesmen
                  </label>
                  <input
                    value={assessment.title}
                    onChange={(e) => updateTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Periode Kebutuhan
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Logika Parameter
                  </label>
                  <div className="flex gap-4 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="logic"
                        checked={logicOperator === "AND"}
                        onChange={() => setLogicOperator("AND")}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        AND (Wajib Semua)
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="logic"
                        checked={logicOperator === "OR"}
                        onChange={() => setLogicOperator("OR")}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        OR (Salah Satu)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Tambah Parameter Teknis
                  </label>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          const fieldObj = availableFields.find(
                            (f) => f.field === val
                          );
                          if (fieldObj) addParameter(fieldObj);
                          e.target.value = "";
                        }
                      }}
                    >
                      <option value="">
                        -- Pilih Spesifikasi (By Group) --
                      </option>
                      {Object.keys(fieldGroups).map((groupName) => (
                        <optgroup key={groupName} label={groupName}>
                          {fieldGroups[groupName].map((f) => (
                            <option
                              key={f.field}
                              value={f.field}
                              disabled={parameters.some(
                                (p) => p.field === f.field
                              )}
                            >
                              {f.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-6">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-4 py-3 w-10">Use</th>
                    <th className="px-4 py-3">Parameter</th>
                    <th className="px-4 py-3">Kondisi (Condition)</th>
                    <th className="px-4 py-3">Nilai (Value)</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {parameters.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-4 text-center text-slate-400 italic"
                      >
                        Belum ada parameter dipilih. Tambahkan diatas.
                      </td>
                    </tr>
                  )}
                  {parameters.map((param) => (
                    <tr key={param.id}>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() =>
                            handleParamChange(
                              param.id,
                              "isActive",
                              !param.isActive
                            )
                          }
                          className={`text-slate-400 ${
                            param.isActive ? "text-indigo-600" : ""
                          }`}
                        >
                          {param.isActive ? (
                            <CheckSquare size={18} />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                        {param.label}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={param.condition}
                          onChange={(e) =>
                            handleParamChange(
                              param.id,
                              "condition",
                              e.target.value
                            )
                          }
                          disabled={!param.isActive}
                          className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 outline-none w-full"
                        >
                          <option value="greater_than">
                            Lebih Besar Dari ({">="})
                          </option>
                          <option value="less_than">
                            Lebih Kecil Dari ({"<="})
                          </option>
                          <option value="equal">Sama Dengan (=)</option>
                          <option value="contains">Mengandung Kata</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type={param.type === "number" ? "number" : "text"}
                          value={param.value}
                          onChange={(e) =>
                            handleParamChange(param.id, "value", e.target.value)
                          }
                          disabled={!param.isActive}
                          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500"
                          placeholder={param.type === "number" ? "0" : "..."}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => removeParameter(param.id)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={runCalculatedAssessment}
                disabled={parameters.length === 0}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-transform active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search size={18} /> Cari Aset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: DETAIL / RESULTS */}
      {viewState === "DETAIL" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-slide-in">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center print:hidden">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewState("CREATE_STEP_2")}
                className="text-slate-400 hover:text-slate-600"
              >
                <ArrowLeft size={18} />
              </button>
              <h3 className="font-bold text-slate-900 dark:text-white">
                Hasil Pencarian
              </h3>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded">
                {assessment.candidates.length} Ditemukan
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-slate-100"
              >
                <Printer size={14} /> Cetak
              </button>
              <button
                onClick={handleSaveClick}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-800"
              >
                <Save size={14} /> Simpan Hasil
              </button>
            </div>
          </div>

          {/* Print Header */}
          <div className="hidden print:block p-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
              <div className="text-left">
                <h1 className="text-xl font-bold uppercase tracking-wide">
                  Berita Acara Asesmen Pasar
                </h1>
                <p className="text-xs uppercase mt-1">
                  Divisi Pengelolaan Rantai Suplai - MIGAS
                </p>
              </div>
              <div className="text-right text-xs">
                <p>
                  <strong>Nomor Dokumen:</strong> BA-
                  {Date.now().toString().slice(-6)}/SCM/
                  {new Date().getFullYear()}
                </p>
                <p>
                  <strong>Tanggal Cetak:</strong>{" "}
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 text-sm gap-y-2 gap-x-8 mb-8">
              <div>
                <span className="block font-bold text-xs uppercase text-gray-500">
                  Judul Kegiatan
                </span>
                <span className="block border-b border-gray-300 pb-1">
                  {assessment.title}
                </span>
              </div>
              <div>
                <span className="block font-bold text-xs uppercase text-gray-500">
                  Tanggal Kebutuhan
                </span>
                <span className="block border-b border-gray-300 pb-1">
                  {startDate} s.d {endDate}
                </span>
              </div>
              <div>
                <span className="block font-bold text-xs uppercase text-gray-500">
                  Kategori Aset
                </span>
                <span className="block border-b border-gray-300 pb-1">
                  {selectedCategory} ({selectedSubType})
                </span>
              </div>
              <div>
                <span className="block font-bold text-xs uppercase text-gray-500">
                  Parameter Kunci
                </span>
                <span className="block border-b border-gray-300 pb-1">
                  {parameters
                    .map(
                      (p) =>
                        `${p.label} ${
                          p.condition === "greater_than" ? ">=" : "="
                        } ${p.value}`
                    )
                    .join(", ")}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto px-6 pb-6 print:px-6 print:pb-0">
            <table className="w-full text-left text-sm print:text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs uppercase font-bold sticky top-0 print:static print:bg-gray-100 print:text-black">
                <tr>
                  <th className="px-6 py-4 print:px-2 print:py-2 print:border print:border-gray-300">
                    Nama Aset
                  </th>
                  <th className="px-6 py-4 print:px-2 print:py-2 print:border print:border-gray-300">
                    Spesifikasi Utama
                  </th>
                  <th className="px-6 py-4 print:px-2 print:py-2 print:border print:border-gray-300">
                    Lokasi
                  </th>
                  <th className="px-6 py-4 print:px-2 print:py-2 print:border print:border-gray-300">
                    Pemilik
                  </th>
                  <th className="px-6 py-4 text-right print:hidden">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-gray-300">
                {assessment.candidates.map((asset) => (
                  <tr
                    key={asset.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <td className="px-6 py-4 print:px-2 print:py-2 print:border print:border-gray-300">
                      <div className="font-bold text-slate-900 dark:text-white print:text-black">
                        {asset.name}
                      </div>
                      <div className="text-xs text-slate-500 print:text-gray-600">
                        {asset.number}
                      </div>
                    </td>
                    <td className="px-6 py-4 print:px-2 print:py-2 print:border print:border-gray-300">
                      <div className="text-xs space-y-1">
                        {asset.specs.ratedHP && (
                          <div>
                            <span className="text-slate-400 print:text-gray-500">
                              Power:
                            </span>{" "}
                            <b>{asset.specs.ratedHP} HP</b>
                          </div>
                        )}
                        {asset.specs.bollardPull && (
                          <div>
                            <span className="text-slate-400 print:text-gray-500">
                              BP:
                            </span>{" "}
                            <b>{asset.specs.bollardPull} Ton</b>
                          </div>
                        )}
                        {asset.specs.deckArea && (
                          <div>
                            <span className="text-slate-400 print:text-gray-500">
                              Deck:
                            </span>{" "}
                            {asset.specs.deckArea} m2
                          </div>
                        )}
                        <div className="text-slate-500 print:text-gray-600">
                          Year: {asset.yearBuilt}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 print:text-black print:px-2 print:py-2 print:border print:border-gray-300">
                      <div className="flex items-center gap-1 print:block">
                        {asset.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 print:px-2 print:py-2 print:border print:border-gray-300">
                      <div className="font-medium print:text-black">
                        {
                          vendors.find((v) => v.id === asset.ownerVendorId)
                            ?.name
                        }
                      </div>
                      <div className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded w-fit print:bg-transparent print:border print:border-gray-300 print:mt-1">
                        {asset.ownerType}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right print:hidden">
                      <span className="text-emerald-600 font-bold text-xs uppercase flex items-center justify-end gap-1">
                        <CheckCircle size={12} /> Tersedia
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Print Footer - Signature Block */}
          <div className="hidden print:block p-6 mt-8">
            <div className="grid grid-cols-3 gap-8 text-center mt-12">
              <div>
                <p className="mb-20 text-xs font-bold uppercase">
                  Dibuat Oleh,
                  <br />
                  Staff Pengadaan
                </p>
                <p className="border-t border-black mx-8 pt-1 font-bold">
                  ( ........................................ )
                </p>
              </div>
              <div>
                <p className="mb-20 text-xs font-bold uppercase">
                  Diperiksa Oleh,
                  <br />
                  Kepala Divisi SCM
                </p>
                <p className="border-t border-black mx-8 pt-1 font-bold">
                  ( ........................................ )
                </p>
              </div>
              <div>
                <p className="mb-20 text-xs font-bold uppercase">
                  Disetujui Oleh,
                  <br />
                  Kepala Deputi Dukungan Bisnis
                </p>
                <p className="border-t border-black mx-8 pt-1 font-bold">
                  ( ........................................ )
                </p>
              </div>
            </div>

            <div className="mt-12 pt-2 border-t border-gray-300 text-[10px] text-gray-500 italic flex justify-between">
              <span>
                Dokumen ini dihasilkan secara elektronik oleh sistem e-Catalog
                MIGAS.
              </span>
              <span>ISO 27001:2013 Certified System</span>
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        singleButton={modalConfig.singleButton}
        confirmText={modalConfig.confirmText || "OK"}
        cancelText={modalConfig.cancelText || "Batal"}
      />
    </div>
  );
};

export default MarketAssessment;

import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAssets } from "../../../context/AssetContext";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import { useProcurement } from "../../../context/ProcurementContext";
import { useMasterData } from "../../../context/MasterDataContext"; // Use Master Data
import AssetMap from "../components/AssetMap";
import Modal from "../../../components/common/Modal";
import { checkAndGenerateWorkOrder } from "../../../utils/WorkOrderAutomation";
import {
  calculateCabotagePriority,
  validateAssetReadiness,
  getPriorityLabel,
} from "../../../utils/AssetCompliance";
import {
  ArrowLeft,
  CheckCircle,
  Activity,
  Power,
  Cpu,
  ShieldCheck,
  MapPin,
  Users,
  AlertTriangle,
  Sparkles,
  BrainCircuit,
  AlertCircle,
  Edit,
  Save,
  Flag,
  Battery,
  MoreHorizontal,
  FileCheck,
  XCircle,
  Loader2,
  ShieldAlert,
  Phone,
  Mail,
  Building,
  ClipboardCheck,
  X,
  FileText,
  Anchor,
  ChevronRight,
  Check,
  SlidersHorizontal,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { GoogleGenAI } from "@google/genai";
import { Asset, AssetStatus } from "../../../types";
import RBACWrapper from "../../../components/common/RBACWrapper";
import TypewriterEffect from "../../../components/common/TypewriterEffect";
import ConfirmationModal, {
  ConfirmationType,
} from "../../../components/common/ConfirmationModal";

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { assets, updateAsset, addNotification } = useAssets();
  const { vendors } = useProcurement();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { configurations } = useMasterData(); // Fetch config

  const asset = assets.find((a) => a.id === id);
  const vendor = vendors.find((v) => v.id === asset?.ownerVendorId);

  const [activeTab, setActiveTab] = useState<
    | "specs"
    | "ref"
    | "history"
    | "telemetry"
    | "inventory"
    | "sustainability"
    | "safety"
  >("specs");

  const [telemetryData, setTelemetryData] = useState<any[]>([]);
  const [isRebooting, setIsRebooting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiAnalysisStage, setAiAnalysisStage] = useState<
    "idle" | "analyzing" | "done"
  >("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [aiResultText, setAiResultText] = useState<string>("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Asset>>({});
  const [editSpecs, setEditSpecs] = useState<any>({});

  const [isAnalyzingHSE, setIsAnalyzingHSE] = useState(false);
  const [hseReport, setHseReport] = useState<string | null>(null);

  const [complianceError, setComplianceError] = useState<string | null>(null);

  const [verificationChecks, setVerificationChecks] = useState({
    doc_skpp: false,
    doc_bki: false,
    doc_insurance: false,
    photo_visual: false,
    spec_match: false,
  });

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: ConfirmationType;
    onConfirm?: () => void;
    singleButton?: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    singleButton: true,
  });

  useEffect(() => {
    if (asset) {
      checkAndGenerateWorkOrder(asset, updateAsset, addNotification);
    }
  }, [asset?.health, asset?.id]);

  useEffect(() => {
    if (asset) {
      setEditFormData(asset);
      // Merge root specs and dynamic specs object
      setEditSpecs({ ...asset.specs, ...asset });
    }
  }, [asset]);

  const canEdit =
    user &&
    user.role === "vendor" &&
    asset?.ownerVendorId === user.id &&
    ["Registered", "Catalog_Filling"].includes(asset?.status || "");
  const isVerifier = user?.role === "technical";

  const runHSEAnalysis = async () => {
    if (!asset) return;
    setIsAnalyzingHSE(true);
    setHseReport(null);

    try {
      const prompt = `HSE Analysis for ${asset.name}. CSMS: ${asset.csmsScore}. Indonesian.`;
      if (process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
        });
        setHseReport(response.text || "Analysis failed.");
      } else {
        await new Promise((r) => setTimeout(r, 1500));
        const level = asset.csmsScore > 80 ? "Rendah" : "Sedang";
        setHseReport(
          `**Laporan Integritas K3LL:**\n\n**Tingkat Risiko: ${level}.** Tren MTBF stabil. ${
            asset.incidentCount > 0
              ? "Insiden sebelumnya bersifat kegagalan mekanis minor."
              : "Tidak ada LTI (Lost Time Injury) tercatat."
          }\n\n**Rekomendasi:** Jadwalkan inspeksi preventif.`
        );
      }
    } catch (e) {
      setHseReport("Error.");
    } finally {
      setIsAnalyzingHSE(false);
    }
  };

  const handleUsePart = (partId: string) => {
    if (!asset || !asset.inventory) return;
    const updatedInventory = asset.inventory.map((part) =>
      part.id === partId && part.quantity > 0
        ? { ...part, quantity: part.quantity - 1 }
        : part
    );
    updateAsset(asset.id, { inventory: updatedInventory });
  };

  const chartStyles = {
    grid: theme === "dark" ? "#334155" : "#f1f5f9",
    text: theme === "dark" ? "#94a3b8" : "#94a3b8",
    tooltipBg: theme === "dark" ? "#1e293b" : "#ffffff",
    tooltipText: theme === "dark" ? "#f8fafc" : "#1e293b",
  };

  useEffect(() => {
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: i,
      temp: 65 + Math.random() * 10,
      pressure: 80 + Math.random() * 15,
      fuel: 100 - i * 0.1,
    }));
    setTelemetryData(initialData);
  }, []);

  useEffect(() => {
    if (activeTab !== "telemetry") return;
    const interval = setInterval(() => {
      setTelemetryData((prev) => {
        const last = prev[prev.length - 1];
        const newTime = last.time + 1;
        const newTemp = Math.min(
          100,
          Math.max(50, last.temp + (Math.random() - 0.5) * 5)
        );
        const newPressure = Math.min(
          120,
          Math.max(60, last.pressure + (Math.random() - 0.5) * 8)
        );
        const newFuel = Math.max(0, last.fuel - Math.random() * 0.2);
        return [
          ...prev.slice(1),
          {
            time: newTime,
            temp: newTemp,
            pressure: newPressure,
            fuel: newFuel,
          },
        ];
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleCommand = (type: "reboot" | "scan" | "fault") => {
    if (!asset) return;
    if (type === "reboot") {
      setIsRebooting(true);
      setTimeout(() => {
        setIsRebooting(false);
        addNotification(
          asset.id,
          "Reboot Berhasil",
          `Sistem ${asset.name} berhasil dimulai ulang.`,
          "info"
        );
      }, 3000);
    }
    if (type === "scan") {
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        addNotification(
          asset.id,
          "Diagnostik Selesai",
          `0 kesalahan (faults) ditemukan.`,
          "info"
        );
      }, 2000);
    }
    if (type === "fault") {
      updateAsset(asset.id, { health: 30 });
      addNotification(
        asset.id,
        "TEST",
        "Simulasi Penurunan Kesehatan ke 30%",
        "critical"
      );
    }
  };

  const handleComplianceCheck = () => {
    if (!asset) return;
    try {
      validateAssetReadiness(asset);
      setComplianceError(null);
      addNotification(
        asset.id,
        "Kepatuhan Terverifikasi",
        "Aset memenuhi semua persyaratan teknis dan administratif untuk operasi.",
        "info"
      );
    } catch (e: any) {
      setComplianceError(e.message);
      addNotification(
        asset.id,
        "Gagal Validasi Kepatuhan",
        e.message,
        "warning"
      );
    }
  };

  const runAiAnalysis = async () => {
    if (!asset) return;
    setIsAiModalOpen(true);
    setAiAnalysisStage("analyzing");
    setScanProgress(0);
    const progressInterval = setInterval(
      () => setScanProgress((prev) => (prev >= 90 ? prev : prev + 10)),
      300
    );

    try {
      const prompt = `Health status for ${asset.name}. Score: ${asset.health}%. Predictive analysis. Brief. Language: Indonesian`;
      if (process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
        });
        setAiResultText(response.text || "Empty result.");
      } else {
        await new Promise((r) => setTimeout(r, 1500));
        setAiResultText(
          `Skor Kesehatan: ${asset.health}%. Seluruh sistem dalam batas normal. Temperatur mesin optimal. Disarankan inspeksi visual pada hidrolik dek.`
        );
      }
      setAiAnalysisStage("done");
    } catch (e) {
      setAiResultText("Error.");
      setAiAnalysisStage("done");
    } finally {
      clearInterval(progressInterval);
      setScanProgress(100);
    }
  };

  // ... inside the Modal content ...

  {
    aiAnalysisStage === "done" && (
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 animate-fade-in relative">
        <div className="absolute top-2 right-2 flex gap-1">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse delay-75"></div>
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse delay-150"></div>
        </div>
        <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-600" /> Hasil Analisis AI
        </h4>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          <TypewriterEffect text={aiResultText} speed={20} />
        </p>
      </div>
    );
  }

  const handleEditSubmit = () => {
    if (!asset) return;

    // Guard: Enforce strict edit permissions
    if (
      user?.role !== "vendor" ||
      asset.ownerVendorId !== user.id ||
      !["Registered", "Catalog_Filling"].includes(asset.status)
    ) {
      setModalConfig({
        isOpen: true,
        title: "Akses Ditolak",
        message:
          "Akses Ditolak: Data hanya dapat diedit oleh Vendor pemilik saat status Draft atau Revisi.",
        type: "danger",
        singleButton: true,
      });
      return;
    }

    try {
      // Simple validation logic
      const updates = {
        ...editFormData,
        specs: { ...asset.specs, ...editSpecs }, // Save dynamic specs
      };

      // If Vendor edits a Registered asset, move it to Catalog_Filling automatically
      if (user?.role === "vendor" && asset.status === "Registered") {
        updates.status = "Catalog_Filling";
      }

      updateAsset(asset.id, updates);
      setIsEditModalOpen(false);
      addNotification(
        asset.id,
        "Aset Diperbarui",
        "Perubahan data berhasil disimpan.",
        "info"
      );
    } catch (e: any) {
      setModalConfig({
        isOpen: true,
        title: "Validasi Gagal",
        message: `Validasi Gagal: ${e.message}`,
        type: "danger",
        singleButton: true,
      });
    }
  };

  // Vendor Action: Submit to Verification
  const handleSubmitForVerification = () => {
    if (!asset) return;
    try {
      validateAssetReadiness(asset);
      updateAsset(asset.id, { status: "Verification" });
      addNotification(
        asset.id,
        "Pengajuan Verifikasi",
        "Aset telah dikirim ke Tim Teknis untuk verifikasi.",
        "info"
      );
    } catch (e: any) {
      setModalConfig({
        isOpen: true,
        title: "Belum Siap Verifikasi",
        message: `Belum Siap Verifikasi: ${e.message}`,
        type: "warning",
        singleButton: true,
      });
    }
  };

  const handleAuditAction = (action: "approve" | "reject") => {
    if (!asset) return;
    if (action === "approve") {
      const allChecked = Object.values(verificationChecks).every((v) => v);
      if (!allChecked) {
        setModalConfig({
          isOpen: true,
          title: "Verifikasi Belum Lengkap",
          message: "Harap centang semua dokumen verifikasi terlebih dahulu.",
          type: "warning",
          singleButton: true,
        });
        return;
      }
      updateAsset(asset.id, { status: "Active" });
      addNotification(
        asset.id,
        "Aset Disetujui",
        `Status aset ${asset.name} telah diubah menjadi AKTIF.`,
        "info"
      );
      navigate("/governance");
    } else {
      // Return to Catalog_Filling for revision, not Registered
      updateAsset(asset.id, { status: "Catalog_Filling" });
      addNotification(
        asset.id,
        "Aset Dikembalikan",
        "Aset dikembalikan ke status Pengisian Katalog untuk revisi vendor.",
        "warning"
      );
      navigate("/governance");
    }
  };

  const toggleCheck = (key: keyof typeof verificationChecks) => {
    setVerificationChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!asset) return <div className="p-10 text-center">Asset not found</div>;

  const cabotagePriority = calculateCabotagePriority(asset);
  const tkdnValue =
    asset.ownerType === "National"
      ? "75.5%"
      : asset.ownerType === "Foreign"
      ? "15.0%"
      : "45.2%";
  const showVerificationPanel = isVerifier && asset.status === "Verification";

  // Lifecycle Steps for Visualization
  const lifecycleSteps = [
    { id: "Registered", label: "Registrasi" },
    { id: "Catalog_Filling", label: "Pengisian Katalog" },
    { id: "Verification", label: "Verifikasi Teknis" },
    { id: "Active", label: "Aktif / Tayang" },
  ];

  const currentStepIndex = lifecycleSteps.findIndex(
    (s) => s.id === asset.status
  );

  // Dynamic Specs for the asset category
  const activeSpecs = configurations[asset.category] || [];

  // Group Specs by 'group' field
  const groupedSpecs: Record<string, any[]> = {};
  activeSpecs.forEach((spec) => {
    const groupName = spec.group || "Umum";
    if (!groupedSpecs[groupName]) groupedSpecs[groupName] = [];
    groupedSpecs[groupName].push(spec);
  });

  return (
    <div className="animate-fade-in pb-12">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            to={user?.role === "technical" ? "/governance" : "/asset-catalog"}
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" /> Kembali ke{" "}
            {user?.role === "technical" ? "Board Verifikasi" : "Daftar Aset"}
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    asset.status === "Active"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : asset.status === "Verification"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {asset.status.replace("_", " ")}
                </span>
                <span className="text-slate-400 text-xs font-mono">
                  {asset.number}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                {asset.name}
              </h1>
            </div>
            <div className="flex gap-3">
              {canEdit && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Edit size={16} /> Edit Data
                </button>
              )}
              <button
                onClick={runAiAnalysis}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Sparkles size={16} /> AI Analysis
              </button>
            </div>
          </div>

          {/* Lifecycle Stepper - Gap Analysis Implementation */}
          <div className="w-full max-w-3xl mb-2">
            <div className="flex items-center justify-between relative">
              {/* Progress Bar Background */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full -z-0"></div>
              {/* Active Progress */}
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 rounded-full -z-0 transition-all duration-500"
                style={{
                  width: `${
                    (currentStepIndex / (lifecycleSteps.length - 1)) * 100
                  }%`,
                }}
              ></div>

              {lifecycleSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                return (
                  <div
                    key={step.id}
                    className="relative z-10 flex flex-col items-center gap-2"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${
                        isCompleted
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400"
                      }`}
                    >
                      {isCompleted ? <Check size={14} /> : index + 1}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isCurrent
                          ? "text-indigo-600 dark:text-white"
                          : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 flex overflow-x-auto gap-6 border-b border-transparent">
          {[
            { id: "specs", label: "Spesifikasi & Vendor" },
            { id: "telemetry", label: "Telemetri" },
            { id: "safety", label: "K3LL (Safety)" },
            { id: "inventory", label: "Inventaris" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-indigo-600 dark:border-white text-indigo-600 dark:text-white"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {complianceError && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl flex items-center gap-3 shadow-sm animate-fade-in">
            <AlertCircle size={24} className="shrink-0" />
            <div>
              <h3 className="font-bold">Validasi Kepatuhan Gagal</h3>
              <p className="text-xs">{complianceError}</p>
            </div>
          </div>
        )}

        {/* Vendor Action Banner - Gap Analysis Implementation */}
        {user?.role === "vendor" &&
          asset.ownerVendorId === user.id &&
          (asset.status === "Registered" ||
            asset.status === "Catalog_Filling") && (
            <div className="mb-6 p-5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl flex items-center justify-between shadow-sm animate-slide-in">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-600 text-white rounded-lg">
                  <ClipboardCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-indigo-900 dark:text-white">
                    Status:{" "}
                    {asset.status === "Registered"
                      ? "Registrasi Awal"
                      : "Pengisian Katalog"}
                  </h3>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                    {asset.status === "Registered"
                      ? "Silakan lengkapi data spesifikasi teknis untuk melanjutkan."
                      : "Data telah dilengkapi. Ajukan verifikasi untuk validasi MIGAS."}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                {asset.status === "Registered" && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-4 py-2 bg-white dark:bg-slate-900 border border-indigo-200 text-indigo-700 font-bold text-xs rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    Lengkapi Katalog
                  </button>
                )}
                <button
                  onClick={handleSubmitForVerification}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  Ajukan Verifikasi <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "specs" && (
              <div className="space-y-6 animate-fade-in">
                {/* Data Validasi Section - Added per Requirement */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      Data Validasi / Validation Data
                    </h3>
                    <FileCheck size={18} className="text-emerald-500" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="text-sm font-medium text-slate-500">
                        Nomor IMO / IMO Number
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {asset.imoNumber || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="text-sm font-medium text-slate-500">
                        Informasi Vendor / Vendor Information
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {vendor?.name || "Unknown Vendor"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="text-sm font-medium text-slate-500">
                        Status Vendor / Vendor Status
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                          vendor?.status === "Verified"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {vendor?.status || "Pending"}
                      </span>
                    </div>
                    <div className="flex justify-between items-start pt-2">
                      <span className="text-sm font-medium text-slate-500">
                        Bukti Kepemilikan / Proof of Ownership
                      </span>
                      <div className="text-right">
                        <span className="block text-xs font-bold text-indigo-600 cursor-pointer hover:underline mb-1">
                          Bukti Kepemilikan.pdf
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Verified by Admin
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">
                    Informasi Umum & Spesifikasi
                  </h3>

                  <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm mb-6">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        Nama Aset
                      </label>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {asset.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        Kategori / Tipe
                      </label>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {asset.category}{" "}
                        {asset.subType ? `(${asset.subType})` : ""}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        Pabrikan / Tahun
                      </label>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {asset.manufacturer} / {asset.yearBuilt}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        Bendera (Flag)
                      </label>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {asset.flagCountry || "Indonesia"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        Kapasitas Umum
                      </label>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {asset.capacityString}
                      </p>
                    </div>
                  </div>

                  {/* DYNAMIC TECHNICAL SPECS DISPLAY - GROUPED */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                    {Object.keys(groupedSpecs).map((groupName) => (
                      <div key={groupName} className="mb-6 last:mb-0">
                        <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-3 flex items-center gap-2">
                          <SlidersHorizontal size={12} /> {groupName}
                        </h4>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                          {groupedSpecs[groupName].map((param) => {
                            let val = (asset as any)[param.field];
                            if (val === undefined && asset.specs) {
                              val = (asset.specs as any)[param.field];
                            }
                            if (
                              val !== undefined &&
                              val !== null &&
                              val !== ""
                            ) {
                              return (
                                <div key={param.id}>
                                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                                    {param.label}
                                  </label>
                                  <p className="font-medium text-slate-900 dark:text-white">
                                    {typeof val === "object" && val !== null
                                      ? Object.entries(val)
                                          .map(([k, v]) => `${k}: ${v}`)
                                          .join(", ")
                                      : val}{" "}
                                    {param.unit ? param.unit : ""}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      Informasi Pemilik (Owner)
                    </h3>
                    <span
                      className={`text-[10px] px-2 py-1 rounded border uppercase font-bold ${
                        asset.ownerType === "National"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {asset.ownerType}
                    </span>
                  </div>
                  {vendor ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg flex items-start gap-3">
                        <Building className="text-slate-400 mt-1" size={18} />
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase">
                            Nama Perusahaan
                          </p>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {vendor.name}
                          </p>
                        </div>
                      </div>
                      <div className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg flex items-start gap-3">
                        <Mail className="text-slate-400 mt-1" size={18} />
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase">
                            Email
                          </p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {vendor.contactEmail || "contact@vendor.com"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">
                      Data vendor tidak tersedia.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "telemetry" && (
              <div className="space-y-6 animate-fade-in">
                <div className="h-64 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative">
                  <div className="absolute top-4 left-4 z-10 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg text-xs font-bold shadow-sm border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    Posisi Real-time
                  </div>
                  <AssetMap
                    singleAsset={asset}
                    height="h-full"
                    zoomLevel="local"
                    showHeatmap={false}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                        Temperatur Mesin
                      </h4>
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                        Stabil
                      </span>
                    </div>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={telemetryData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke={chartStyles.grid}
                          />
                          <XAxis dataKey="time" hide />
                          <YAxis
                            domain={[50, 100]}
                            tick={{ fontSize: 10, fill: chartStyles.text }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: chartStyles.tooltipBg,
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                            }}
                            itemStyle={{ color: chartStyles.tooltipText }}
                          />
                          <Area
                            type="monotone"
                            dataKey="temp"
                            stroke="#f97316"
                            fillOpacity={0.1}
                            fill="#f97316"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "safety" && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 animate-fade-in shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    Laporan K3LL (HSE)
                  </h3>
                  <button
                    onClick={runHSEAnalysis}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <BrainCircuit size={14} /> AI Audit
                  </button>
                </div>
                {hseReport && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line mb-6 border border-slate-100 dark:border-slate-700 leading-relaxed">
                    {hseReport}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-lg">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">
                      Nihil Kecelakaan (Zero LTI)
                    </p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {asset.daysSinceIncident}{" "}
                      <span className="text-sm font-medium text-slate-400">
                        Hari
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "inventory" && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 animate-fade-in">
                <div className="space-y-4">
                  {asset.inventory?.map((part) => (
                    <div
                      key={part.id}
                      className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <div>
                        <p className="font-bold text-sm text-slate-800 dark:text-white">
                          {part.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          SKU: {part.sku}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold text-sm ${
                            part.quantity <= part.minLevel
                              ? "text-rose-600"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {part.quantity} {part.unit}
                        </p>
                        <button
                          onClick={() => handleUsePart(part.id)}
                          className="text-[10px] text-indigo-600 font-bold hover:underline"
                        >
                          Gunakan Item
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Details */}
          <div className="lg:col-span-1 space-y-6">
            {showVerificationPanel && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-900 shadow-lg shadow-indigo-100 dark:shadow-none p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>
                <h3 className="font-bold text-sm text-indigo-900 dark:text-white mb-4 flex items-center gap-2">
                  <ClipboardCheck size={16} className="text-indigo-600" />{" "}
                  Verifikasi Teknis
                </h3>
                <div className="space-y-3 mb-6">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={verificationChecks.doc_skpp}
                      onChange={() => toggleCheck("doc_skpp")}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Dokumen SKPP Migas Valid
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={verificationChecks.doc_bki}
                      onChange={() => toggleCheck("doc_bki")}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Sertifikat Klasifikasi (BKI)
                    </span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAuditAction("reject")}
                    className="flex-1 py-2.5 border border-rose-200 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-50 transition-colors"
                  >
                    Tolak (Revisi)
                  </button>
                  <button
                    onClick={() => handleAuditAction("approve")}
                    disabled={!Object.values(verificationChecks).every(Boolean)}
                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Approve Asset
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Flag size={14} /> Status Cabotage
              </h3>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg mb-4 text-center border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">
                  Prioritas
                </p>
                <p
                  className={`text-lg font-bold ${
                    cabotagePriority === "PRIORITY_1"
                      ? "text-emerald-600"
                      : cabotagePriority === "PRIORITY_2"
                      ? "text-indigo-600"
                      : "text-amber-600"
                  }`}
                >
                  {getPriorityLabel(cabotagePriority)}
                </p>
              </div>
              <button
                onClick={handleComplianceCheck}
                className="w-full py-2.5 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={14} /> Validasi Kesiapan
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">
                Ringkasan Spesifikasi
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-500">Tahun Pembuatan</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {asset.yearBuilt}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-500">Pabrikan</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {asset.manufacturer}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-500">Kapasitas</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {asset.capacityString}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-500">TKDN (Local Content)</span>
                  <span
                    className={`font-bold ${
                      parseFloat(tkdnValue) > 60
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {tkdnValue}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Modal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          title="Analisis Prediktif"
        >
          <div className="p-6 text-center">
            {aiAnalysisStage === "analyzing" ? (
              <div className="py-8">
                <div className="w-16 h-16 mx-auto border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin flex items-center justify-center text-xs font-bold text-indigo-600">
                  {scanProgress}%
                </div>
                <h3 className="text-lg font-bold mt-6 text-slate-800">
                  Menganalisis Telemetri...
                </h3>
              </div>
            ) : (
              <div className="text-left">
                <div className="bg-slate-50 p-5 rounded-xl flex items-start gap-4 mb-4 border border-slate-100">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <BrainCircuit size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">
                      Hasil Diagnostik
                    </h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      {aiResultText}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Detail Aset"
        >
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Nama Aset
                </label>
                <input
                  value={editFormData.name || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Lokasi
                </label>
                <input
                  value={editFormData.location || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      location: e.target.value,
                    })
                  }
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* DYNAMIC MASTER DATA FIELDS FOR EDITING */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <SlidersHorizontal size={14} className="text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase">
                  Parameter Teknis ({asset.category})
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {activeSpecs.map((param) => (
                  <div key={param.id}>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                      {param.label}
                    </label>
                    <input
                      type={param.type === "number" ? "number" : "text"}
                      value={editSpecs[param.field] || ""}
                      onChange={(e) =>
                        setEditSpecs({
                          ...editSpecs,
                          [param.field]: e.target.value,
                        })
                      }
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 outline-none focus:border-indigo-500 transition-colors"
                      placeholder={param.unit || ""}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm hover:bg-indigo-700 transition-colors"
              >
                <Save size={14} /> Simpan Perubahan
              </button>
            </div>
          </div>
        </Modal>
        <ConfirmationModal
          isOpen={modalConfig.isOpen}
          onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
          onConfirm={modalConfig.onConfirm}
          title={modalConfig.title}
          message={modalConfig.message}
          type={modalConfig.type}
          singleButton={modalConfig.singleButton}
          confirmText="OK"
        />
      </div>
    </div>
  );
};

export default AssetDetail;

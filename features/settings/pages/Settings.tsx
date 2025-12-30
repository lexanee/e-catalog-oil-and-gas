import React, { useState } from "react";
import { useAssets } from "../../../context/AssetContext";
import { useProcurement } from "../../../context/ProcurementContext";
import { useLogistics } from "../../../context/LogisticsContext";
import { useTheme } from "../../../context/ThemeContext";
import { useCurrency } from "../../../context/CurrencyContext";
import { useAuth } from "../../../context/AuthContext";
import {
  Activity,
  Moon,
  Globe,
  Database,
  Server,
  Building2,
  FileCheck,
  Save,
  Sun,
} from "lucide-react";
import RBACWrapper from "../../../components/common/RBACWrapper";
import ConfirmationModal, {
  ConfirmationType,
} from "../../../components/common/ConfirmationModal";

// Feature Flag for Enterprise Production Control
const DEMO_MODE = false;

const Settings: React.FC = () => {
  const { toggleSimulation, isSimulationPaused, injectScenario, resetAssets } =
    useAssets();
  const { resetProcurement } = useProcurement();
  const { resetLogistics } = useLogistics();
  const { theme, toggleTheme } = useTheme();
  const { currency, toggleCurrency } = useCurrency();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"General" | "Company">("General");
  const [vendorData, setVendorData] = useState({
    companyName: user?.company || "",
    civd: "CIVD-2024-XXXX",
    csms: "85",
    npwp: "00.000.000.0-000.000",
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
  });

  const resetData = () => {
    resetAssets();
    resetProcurement();
    resetLogistics();
  };

  const handleVendorSave = () => {
    setModalConfig({
      isOpen: true,
      title: "Berhasil",
      message: "Profil Perusahaan Berhasil Diperbarui!",
      type: "success",
      singleButton: true,
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in pb-20">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Pengaturan Sistem
      </h1>

      {/* 3. MISSING FEATURE: Tabbed Interface for Vendor Profile */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("General")}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "General"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500"
          }`}
        >
          Umum
        </button>
        {user?.role === "vendor" && (
          <button
            onClick={() => setActiveTab("Company")}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "Company"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500"
            }`}
          >
            Profil Perusahaan (CIVD)
          </button>
        )}
      </div>

      {activeTab === "General" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Simulation Control - Visible only if DEMO_MODE is true */}
          <RBACWrapper allowedRoles={["scm", "technical"]}>
            {DEMO_MODE && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-sm uppercase text-slate-400 mb-4">
                  Mesin Simulasi (Demo Mode)
                </h3>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Activity size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Feed Telemetri</p>
                      <p className="text-xs text-slate-500">
                        {isSimulationPaused
                          ? "Jeda (Paused)"
                          : "Berjalan (2000ms)"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleSimulation}
                    className={`px-4 py-2 rounded-lg text-xs font-bold ${
                      isSimulationPaused
                        ? "bg-slate-100 text-slate-600"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {isSimulationPaused ? "Resume" : "Pause"}
                  </button>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Skenario Injeksi
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => injectScenario("weather_natuna")}
                      className="p-2 border border-slate-200 rounded-lg text-xs hover:bg-slate-50"
                    >
                      Badai
                    </button>
                    <button
                      onClick={() => injectScenario("failure_rig_a")}
                      className="p-2 border border-slate-200 rounded-lg text-xs hover:bg-slate-50"
                    >
                      Rig Fail
                    </button>
                    <button
                      onClick={() => injectScenario("cyber_attack")}
                      className="p-2 border border-slate-200 rounded-lg text-xs hover:bg-slate-50"
                    >
                      Cyber
                    </button>
                  </div>
                </div>
              </div>
            )}
          </RBACWrapper>

          {/* Appearance */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-sm uppercase text-slate-400 mb-4">
              Preferensi
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Moon size={16} className="text-slate-400" />
                  <span className="text-sm font-medium">
                    Mode Gelap (Dark Mode)
                  </span>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    theme === "dark"
                      ? "bg-indigo-600 justify-end"
                      : "bg-slate-200 justify-start"
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform"></div>
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-slate-400" />
                  <span className="text-sm font-medium">Mata Uang</span>
                </div>
                <select
                  value={currency}
                  onChange={toggleCurrency}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold px-2 py-1.5 rounded border border-transparent hover:border-slate-300 dark:hover:border-slate-600 outline-none cursor-pointer transition-colors"
                >
                  <option value="IDR">IDR (Rupiah)</option>
                  <option value="USD">USD (Dollar)</option>
                </select>
              </div>
            </div>
          </div>

          {/* System Health (Clean) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-sm uppercase text-slate-400 mb-4">
              Status Sistem
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <div className="flex gap-2 items-center">
                  <Database size={16} className="text-slate-400" /> Database
                </div>
                <span className="text-emerald-600 font-bold text-xs">
                  Terhubung
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex gap-2 items-center">
                  <Server size={16} className="text-slate-400" /> API Gateway
                </div>
                <span className="text-emerald-600 font-bold text-xs">
                  Online (24ms)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 w-[98%] h-full"></div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <RBACWrapper allowedRoles={["scm"]}>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-rose-100 dark:border-rose-900 shadow-sm">
              <h3 className="font-bold text-sm uppercase text-rose-400 mb-4">
                Zona Bahaya
              </h3>
              <div className="flex justify-between items-center">
                <div className="text-xs text-slate-500">
                  Reset semua data aplikasi ke kondisi awal.
                </div>
                <button
                  onClick={() => {
                    setModalConfig({
                      isOpen: true,
                      title: "Konfirmasi Reset",
                      message:
                        "Apakah Anda yakin ingin mereset seluruh data sistem? Tindakan ini tidak dapat dibatalkan.",
                      type: "danger",
                      onConfirm: resetData,
                    });
                  }}
                  className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-100"
                >
                  Reset Sistem
                </button>
              </div>
            </div>
          </RBACWrapper>
        </div>
      ) : (
        // VENDOR COMPANY PROFILE FORM
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl animate-fade-in">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
            <Building2 className="text-indigo-600" /> Data Perusahaan
          </h3>
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">
                Nama Perusahaan
              </label>
              <input
                type="text"
                value={vendorData.companyName}
                onChange={(e) =>
                  setVendorData({ ...vendorData, companyName: e.target.value })
                }
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 outline-none focus:border-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">
                  Nomor CIVD
                </label>
                <div className="relative">
                  <FileCheck
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={vendorData.civd}
                    onChange={(e) =>
                      setVendorData({ ...vendorData, civd: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">
                  NPWP
                </label>
                <input
                  type="text"
                  value={vendorData.npwp}
                  onChange={(e) =>
                    setVendorData({ ...vendorData, npwp: e.target.value })
                  }
                  className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">
                Skor CSMS Terakhir
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={vendorData.csms}
                  onChange={(e) =>
                    setVendorData({ ...vendorData, csms: e.target.value })
                  }
                  className="w-24 p-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 outline-none focus:border-indigo-500 font-bold text-center"
                />
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded border ${
                    parseInt(vendorData.csms) > 80
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {parseInt(vendorData.csms) > 80
                    ? "Resiko Rendah"
                    : "Resiko Sedang"}
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={handleVendorSave}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center gap-2"
              >
                <Save size={16} /> Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
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
  );
};

export default Settings;

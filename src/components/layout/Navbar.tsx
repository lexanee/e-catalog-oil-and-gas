import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  Bell,
  Check,
  BookOpen,
  UserCircle,
  AlertOctagon,
  HelpCircle,
  Activity,
  ChevronRight,
  Search,
  Command,
  Users,
  ChevronDown,
  Cpu,
  RefreshCw,
  Zap,
  Play,
  Pause,
  Trash2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAssets } from "../../context/AssetContext";
import { useAuth, UserRole } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useProcurement } from "../../context/ProcurementContext";
import { useLogistics } from "../../context/LogisticsContext";
import { Sun, Moon } from "lucide-react";
import Modal from "../common/Modal";
import ConfirmationModal, {
  ConfirmationType,
} from "../common/ConfirmationModal";

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const location = useLocation();
  const {
    unreadCount,
    notifications,
    markAllAsRead,
    markAsRead,
    toggleSimulation,
    isSimulationPaused,
    injectScenario,
    resetAssets,
  } = useAssets();
  const { resetProcurement } = useProcurement();
  const { resetLogistics } = useLogistics();
  const { user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: ConfirmationType;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: () => {},
  });

  const handleSwitchRole = (role: UserRole) => {
    login(`demo.${role}@migas.go.id`, role);
    setIsDemoMenuOpen(false);
  };

  const handleResetSystem = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Reset Sistem",
      message:
        "Apakah Anda yakin ingin mereset seluruh data sistem ke kondisi awal? Semua perubahan akan hilang.",
      type: "danger",
      onConfirm: () => {
        resetAssets();
        resetProcurement();
        resetLogistics();
        setIsDemoMenuOpen(false);
      },
    });
  };

  // War Room Detection
  const activeCrisis = notifications.find(
    (n) =>
      n.type === "critical" ||
      (n.type === "warning" &&
        (n.title.includes("WEATHER") || n.title.includes("CUACA")))
  );
  const isWarRoomActive = !!activeCrisis;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
      }
      if (demoRef.current && !demoRef.current.contains(event.target as Node)) {
        setIsDemoMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (location.pathname === "/login") return null;

  const getPageTitle = () => {
    if (location.pathname === "/") return "Ringkasan";
    if (location.pathname.includes("live-map")) return "Geospasial";
    if (location.pathname.includes("vendor")) return "Portal Mitra";
    if (location.pathname.includes("settings")) return "Pengaturan";
    const parts = location.pathname.split("/");
    const main = parts[1];
    return main.charAt(0).toUpperCase() + main.slice(1).replace("-", " ");
  };

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 60000
    );
    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes}m lalu`;
    return `${Math.floor(minutes / 60)}j lalu`;
  };

  return (
    <>
      {/* War Room Banner */}
      {isWarRoomActive && (
        <div className="bg-rose-50 border-b border-rose-100 text-rose-700 px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-2 sticky top-0 z-60 shadow-sm animate-fade-in">
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
          <AlertOctagon size={14} />
          <span className="tracking-wide">
            PROTOKOL AKTIF: {activeCrisis?.title.toUpperCase()}
          </span>
        </div>
      )}

      {/* Navbar */}
      <header className="h-16 px-6 flex items-center justify-between z-30 transition-all sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 supports-backdrop-filter:bg-white/60 dark:supports-backdrop-filter:bg-slate-950/60">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center text-sm text-slate-500 dark:text-slate-400">
            <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors">
              MIGAS
            </span>
            <ChevronRight size={14} className="mx-2 text-slate-300" />
            <span className="font-semibold text-slate-800 dark:text-white">
              {getPageTitle()}
            </span>
          </div>
        </div>

        {/* Center Search */}
        <div className="hidden lg:flex items-center relative group">
          <Search
            size={14}
            className="absolute left-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
          />
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

        <div className="flex items-center gap-3">
          {/* DEMO CONTROL CENTER */}
          <div className="relative hidden md:block" ref={demoRef}>
            <button
              onClick={() => setIsDemoMenuOpen(!isDemoMenuOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isWarRoomActive
                  ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              <Cpu
                size={14}
                className={
                  isWarRoomActive ? "text-rose-600" : "text-indigo-600"
                }
              />
              <span>
                {user?.role?.toUpperCase()} {isWarRoomActive ? "(ALERT)" : ""}
              </span>
              <ChevronDown
                size={12}
                className={`transition-transform ${
                  isDemoMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDemoMenuOpen && (
              <div className="absolute top-full right-0 mt-3 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in z-50">
                {/* Header */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Demo Control Panel
                  </span>
                  <Activity size={12} className="text-slate-400" />
                </div>

                <div className="p-2 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                  {/* Role Switcher */}
                  <div className="space-y-1">
                    <p className="px-2 text-[10px] font-bold text-slate-400 uppercase">
                      Switch Persona
                    </p>
                    {(["scm", "technical", "vendor"] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => handleSwitchRole(r)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          user?.role === r
                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="capitalize">
                          {r === "technical"
                            ? "Technical User"
                            : r === "scm"
                            ? "SCM Admin"
                            : "Vendor Portal"}
                        </span>
                        {user?.role === r && <Check size={12} />}
                      </button>
                    ))}
                  </div>

                  {/* Simulation Controls (SCM/Tech Only) */}
                  {user?.role !== "vendor" && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Simulation Engine
                        </span>
                        <button
                          onClick={toggleSimulation}
                          className={`p-1.5 rounded-md transition-colors ${
                            isSimulationPaused
                              ? "bg-slate-100 text-slate-400 hover:text-slate-600"
                              : "bg-emerald-100 text-emerald-600 animate-pulse"
                          }`}
                          title={isSimulationPaused ? "Resume" : "Pause"}
                        >
                          {isSimulationPaused ? (
                            <Play size={12} />
                          ) : (
                            <Pause size={12} />
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 px-1">
                        <button
                          onClick={() => {
                            injectScenario("weather_natuna");
                            setIsDemoMenuOpen(false);
                          }}
                          className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors text-left flex items-center gap-2"
                        >
                          <Zap size={12} /> Badai Natuna
                        </button>
                        <button
                          onClick={() => {
                            injectScenario("failure_rig_a");
                            setIsDemoMenuOpen(false);
                          }}
                          className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-colors text-left flex items-center gap-2"
                        >
                          <Activity size={12} /> Rig Failure
                        </button>
                        <button
                          onClick={() => {
                            injectScenario("cyber_attack");
                            setIsDemoMenuOpen(false);
                          }}
                          className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-colors text-left flex items-center gap-2"
                        >
                          <Cpu size={12} /> Cyber Attack
                        </button>
                      </div>
                    </div>
                  )}

                  {/* System Actions */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 px-1">
                    <button
                      onClick={handleResetSystem}
                      className="w-full p-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-100 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Trash2 size={12} /> Reset System Data
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors hidden md:block"
            title={
              theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors hidden md:block"
          >
            <HelpCircle size={18} />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`p-2 rounded-lg transition-colors relative ${
                isNotifOpen
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-950"></span>
              )}
            </button>

            {/* Dropdown - Notification */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in origin-top-right z-50">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                  <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wide">
                    Notifikasi
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>
                <div className="max-h-87.5 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">
                      <Bell size={24} className="mx-auto mb-3 opacity-20" />
                      <p className="text-xs font-medium">
                        Belum ada notifikasi
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex gap-3 transition-colors ${
                            !notif.read ? "bg-slate-50 dark:bg-slate-800" : ""
                          }`}
                        >
                          <div
                            className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                              notif.type === "critical"
                                ? "bg-rose-500 shadow-sm shadow-rose-200"
                                : notif.type === "warning"
                                ? "bg-amber-500"
                                : "bg-indigo-500"
                            }`}
                          ></div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <p
                                className={`text-sm ${
                                  !notif.read
                                    ? "font-bold text-slate-900 dark:text-white"
                                    : "font-medium text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                {notif.title}
                              </p>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                {getTimeAgo(notif.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>
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

        {/* Confirmation Modal for Reset */}
        <ConfirmationModal
          isOpen={confirmConfig.isOpen}
          onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
          title={confirmConfig.title}
          message={confirmConfig.message}
          type={confirmConfig.type}
          onConfirm={confirmConfig.onConfirm}
        />

        {/* Help Modal */}
        <Modal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          title="Panduan Sistem"
        >
          <div className="p-4 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm">
              <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                <Activity size={16} /> Simulasi War Room
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Gunakan <strong>Demo Control Panel</strong> (ikon CPU/Role di
                navbar) untuk memicu skenario krisis (Cuaca, Serangan Siber) dan
                amati reaksi sistem secara real-time.
              </p>
            </div>
          </div>
        </Modal>
      </header>
    </>
  );
};

export default Navbar;

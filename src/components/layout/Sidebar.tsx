import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Database,
  Settings,
  LogOut,
  FileSpreadsheet,
  ShieldCheck,
  Warehouse,
  Briefcase,
  ChevronDown,
  Activity,
  Hexagon,
  Search,
  Map,
  ClipboardList,
  BookOpen,
  Wrench,
  Calculator,
  FileText,
  SlidersHorizontal,
} from "lucide-react";

const Sidebar: React.FC<{
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}> = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isAssetMenuOpen, setIsAssetMenuOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const NavItem = ({ to, icon: Icon, label, end = false, children }: any) => {
    return (
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          `group flex items-center justify-between px-4 py-3 mx-2 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
            isActive
              ? "text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-900/20"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
          }`
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>
            )}
            <div className="flex items-center gap-3 relative z-10">
              <Icon
                size={20}
                className={`transition-colors duration-300 ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400 drop-shadow-sm"
                    : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                }`}
              />
              <span
                className={`tracking-wide ${
                  isActive ? "translate-x-1" : ""
                } transition-transform duration-300`}
              >
                {label}
              </span>
            </div>
            {children}
          </>
        )}
      </NavLink>
    );
  };

  const role = user?.role;
  const catalogPath = role === "technical" ? "/master-data" : "/asset-catalog";

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/90 transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 transform transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:relative flex flex-col shadow-xl md:shadow-none`}
      >
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm shadow-indigo-200 dark:shadow-none">
            <Hexagon size={18} className="text-white fill-current" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white text-sm leading-tight tracking-tight">
              MIGAS
            </h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">
              {role === "scm"
                ? "SCM / Pengadaan"
                : role === "technical"
                ? "User Teknis"
                : "Portal Penyedia"}
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 space-y-8 custom-scrollbar">
          {/* --- SCM & TECHNICAL SHARED VIEWS --- */}
          {(role === "scm" || role === "technical") && (
            <>
              <div className="space-y-1">
                <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Pemantauan (Monitoring)
                </p>
                <NavItem
                  to="/"
                  icon={LayoutDashboard}
                  label="Ringkasan Eksekutif"
                  end
                />
                <NavItem to="/live-map" icon={Map} label="Peta Operasional">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </NavItem>
              </div>

              <div className="space-y-1">
                <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {role === "technical" ? "Master Data Aset" : "Katalog Aset"}
                </p>

                <div className="mx-3">
                  <button
                    onClick={() => setIsAssetMenuOpen(!isAssetMenuOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-transparent ${
                      location.pathname.includes("asset-catalog") ||
                      location.pathname.includes("master-data")
                        ? "bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Database
                        size={18}
                        className={
                          location.pathname.includes("asset-catalog") ||
                          location.pathname.includes("master-data")
                            ? "text-indigo-600"
                            : "text-slate-400"
                        }
                      />{" "}
                      <span>
                        {role === "technical" ? "Master Data" : "Katalog"}
                      </span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 text-slate-400 ${
                        isAssetMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isAssetMenuOpen
                        ? "max-h-40 opacity-100 mt-1"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="pl-4 space-y-1 border-l border-slate-100 dark:border-slate-800 ml-4 my-1">
                      <NavLink
                        to={`${catalogPath}?category=Kapal`}
                        className="block pl-4 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors"
                      >
                        Kapal (Vessels)
                      </NavLink>
                      <NavLink
                        to={`${catalogPath}?category=Offshore%20Rig`}
                        className="block pl-4 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors"
                      >
                        Offshore Rigs
                      </NavLink>
                      <NavLink
                        to={`${catalogPath}?category=Onshore%20Rig`}
                        className="block pl-4 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors"
                      >
                        Onshore Rigs
                      </NavLink>
                    </div>
                  </div>
                </div>
                {role === "technical" && (
                  <NavItem
                    to="/master-data/parameters"
                    icon={SlidersHorizontal}
                    label="Parameter Teknis Produk"
                  />
                )}
              </div>
            </>
          )}

          {/* --- SCM SPECIFIC --- */}
          {role === "scm" && (
            <div className="space-y-1">
              <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Pengadaan (Procurement)
              </p>
              <NavItem
                to="/market-assessment"
                icon={Search}
                label="Asesmen Pasar"
              />
              <NavItem
                to="/request-list"
                icon={ClipboardList}
                label="Permintaan (Enquiry)"
              />
              <NavItem
                to="/tenders"
                icon={FileSpreadsheet}
                label="Manajemen Tender"
              />
              <NavItem
                to="/contracts"
                icon={ShieldCheck}
                label="Monitoring Kontrak"
              />
              <NavItem
                to="/vendors"
                icon={Briefcase}
                label="Database Penyedia"
              />
              <NavItem to="/reports" icon={FileText} label="Pusat Laporan" />
            </div>
          )}

          {/* --- TECHNICAL SPECIFIC --- */}
          {role === "technical" && (
            <div className="space-y-1">
              <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Operasional Teknis
              </p>
              <NavItem
                to="/governance"
                icon={ShieldCheck}
                label="Verifikasi Aset"
              />
              <NavItem
                to="/maintenance"
                icon={Wrench}
                label="Pemeliharaan (WO)"
              />
              <NavItem
                to="/request-list"
                icon={ClipboardList}
                label="Validasi Teknis"
              />
              <NavItem to="/reports" icon={FileText} label="Pusat Laporan" />
            </div>
          )}

          {/* --- SCM LOGISTICS --- */}
          {role === "scm" && (
            <div className="space-y-1">
              <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Logistik
              </p>
              <NavItem
                to="/logistics"
                icon={Warehouse}
                label="Pangkalan Logistik"
              />
            </div>
          )}

          {/* --- VENDOR SPECIFIC --- */}
          {role === "vendor" && (
            <div className="space-y-1">
              <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Portal Mitra
              </p>
              <NavItem
                to="/vendor"
                icon={LayoutDashboard}
                label="Dashboard Mitra"
              />
              <NavItem
                to="/asset-catalog"
                icon={Database}
                label="Aset Terdaftar"
              />
              {/* Hide TKDN Calculator by commenting out the NavItem */}
              {/* <NavItem to="/tkdn-calc" icon={Calculator} label="Kalkulator TKDN" /> */}
              <NavItem
                to="/settings"
                icon={Settings}
                label="Profil Perusahaan"
              />
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-900 bg-linear-to-b from-white to-slate-50 dark:from-slate-950 dark:to-black">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-r from-indigo-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md ring-2 ring-white dark:ring-slate-800">
              {user?.avatar || "US"}
            </div>
            <div className="flex-1 overflow-hidden relative z-10 transition-transform group-hover:translate-x-1 duration-300">
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate capitalize font-medium">
                {user?.company || role}
              </p>
            </div>
            {role !== "vendor" && (
              <NavLink
                to="/settings"
                className="text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors relative z-10"
              >
                <Settings size={16} />
              </NavLink>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30 rounded-xl transition-all duration-300"
          >
            <LogOut size={14} /> Keluar (Sign Out)
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

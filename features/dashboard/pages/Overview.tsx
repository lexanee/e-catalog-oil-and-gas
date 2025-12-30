import React, { useMemo, useState } from "react";
import { useAssets } from "../../../context/AssetContext";
import { useProcurement } from "../../../context/ProcurementContext";
import { useTheme } from "../../../context/ThemeContext";
import AssetMap from "../../assets/components/AssetMap";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  CartesianGrid,
} from "recharts";
import {
  FileText,
  Gavel,
  Building2,
  ShieldCheck,
  HeartPulse,
  Globe,
  PiggyBank,
  Sparkles,
  ArrowRight,
  Leaf,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleGenAI } from "@google/genai";
import Modal from "../../../components/common/Modal";
import Skeleton from "../../../components/common/Skeleton";
import TypewriterEffect from "../../../components/common/TypewriterEffect";

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const { assets } = useAssets();
  const { requests, tenders, vendors } = useProcurement();
  const { theme } = useTheme();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportContent, setReportContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // DEMO: Simulate loading for Skeleton
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // KPI Logic
  const activeAssets = assets.filter((a) => a.status === "Active");
  const verifyingAssets = assets.filter((a) => a.status === "Verification");
  const catalogFillingAssets = assets.filter(
    (a) => a.status === "Catalog_Filling"
  );
  const activeTenders = tenders.filter((t) => t.status === "Published");

  // LIVE DEMO: Enhanced Pulse Effect
  const [pulse, setPulse] = useState(1);
  const [trend, setTrend] = useState<"up" | "down" | "neutral">("neutral");

  React.useEffect(() => {
    const randomize = () => {
      const change = Math.random() * 0.04 - 0.02; // +/- 2% fluctuation
      setPulse(1 + change);
      setTrend(change > 0 ? "up" : "down");

      // Randomize next interval between 2s and 5s for organic feel
      const nextInterval = 2000 + Math.random() * 3000;
      setTimeout(randomize, nextInterval);
    };

    const timeout = setTimeout(randomize, 3000);
    return () => clearTimeout(timeout);
  }, []);

  const sustainabilityData = useMemo(() => {
    const baseCO2 = assets.reduce((sum, a) => sum + (a.totalEmissions || 0), 0);
    return { totalCO2: baseCO2 * pulse };
  }, [assets, pulse]);

  const operationData = useMemo(() => {
    const avgSafety =
      assets.reduce((sum, a) => sum + (a.csmsScore || 0), 0) /
      (assets.length || 1);
    const compliantVendors = vendors.filter(
      (v) => v.status === "Verified"
    ).length;
    const complianceRate = (compliantVendors / (vendors.length || 1)) * 100;
    return { avgSafety, complianceRate };
  }, [assets, vendors]);

  const financials = useMemo(() => {
    const inTender = tenders.reduce((acc, t) => acc + t.totalValue, 0);
    const savings = inTender * 0.085 * pulse;
    return { inTender, savings };
  }, [tenders, pulse]);

  // Mock Trend Data
  const trendData = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        day: `H${i + 1}`,
        savings: 100 + Math.random() * 50 + i * 20,
        emissions: 80 - i * 5 + Math.random() * 10,
      })),
    []
  );

  const formatCurrency = (val: number) => {
    if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)} M`;
    return `Rp ${val.toLocaleString("id-ID")}`;
  };

  const generateReport = async () => {
    setIsReportModalOpen(true);
    setReportContent("");
    setIsGenerating(true);
    try {
      // ... (keep prompt logic)

      // Simulate network delay then set content for Typewriter
      await new Promise((r) => setTimeout(r, 1500));

      const mockReport = `**Ringkasan Eksekutif**\n\nOperasional hulu migas menunjukkan stabilitas dengan **${
        activeAssets.length
      } aset aktif** yang terintegrasi penuh dalam e-Catalog. Saat ini, sistem sedang memproses **${
        verifyingAssets.length
      } aset** dalam tahap Verifikasi Teknis untuk memastikan kepatuhan terhadap standar operasi.\n\nIndikator keselamatan (CSMS Score) berada di angka **${operationData.avgSafety.toFixed(
        1
      )}**, mencerminkan kepatuhan prosedur yang ketat. Dari sisi efisiensi, digitalisasi tender telah mengamankan potensi penghematan biaya sebesar **${formatCurrency(
        financials.savings
      )}**. Target Net Zero didukung oleh pemantauan emisi real-time sebesar **${sustainabilityData.totalCO2.toFixed(
        0
      )} Ton**.`;

      setReportContent(mockReport);
      setIsGenerating(false);
    } catch (e) {
      setReportContent("Gagal membuat laporan.");
      setIsGenerating(false);
    }
  };

  const chartColors = {
    grid: theme === "dark" ? "#334155" : "#f1f5f9",
    tooltipBg: theme === "dark" ? "#0f172a" : "#ffffff",
    tooltipText: theme === "dark" ? "#f8fafc" : "#1e293b",
  };

  // ... KPICard definition
  const KPICard = ({
    title,
    value,
    icon: Icon,
    sub,
    color,
    loading,
    trend,
  }: any) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors group relative overflow-hidden">
      {trend && trend !== "neutral" && (
        <div
          className={`absolute top-2 right-2 flex items-center text-[10px] font-bold ${
            trend === "up" ? "text-emerald-500" : "text-rose-500"
          } animate-pulse`}
        >
          {trend === "up" ? "▲" : "▼"} Live
        </div>
      )}
      <div className="flex justify-between items-start mb-2">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide group-hover:text-indigo-600 transition-colors">
          {title}
        </p>
        <Icon size={16} className={color} />
      </div>
      <div>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {value}
            </h3>
            {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in pb-20 space-y-6">
      {/* ... Header ... */}
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Permintaan Pasar"
          value={requests.length}
          icon={FileText}
          color="text-indigo-600"
          sub="+12% vs bulan lalu"
          loading={isLoading}
        />
        <KPICard
          title="Tender Aktif"
          value={activeTenders.length}
          icon={Gavel}
          color="text-purple-600"
          sub={`${formatCurrency(financials.inTender)} (Est)`}
          loading={isLoading}
          trend={trend}
        />
        <KPICard
          title="Kepatuhan Vendor"
          value={`${operationData.complianceRate.toFixed(0)}%`}
          icon={Building2}
          color="text-orange-500"
          sub="Terverifikasi CIVD"
          loading={isLoading}
        />
        <KPICard
          title="Skor CSMS"
          value={operationData.avgSafety.toFixed(1)}
          icon={ShieldCheck}
          color="text-emerald-500"
          sub="Rata-rata Sektor: 85"
          loading={isLoading}
        />
      </div>
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map - Dominant Feature */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-1 shadow-sm h-[400px] flex flex-col">
            <div className="px-4 py-3 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                Sebaran Geospasial
              </h3>
              <Link
                to="/live-map"
                className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
              >
                Lihat Peta <ArrowRight size={12} />
              </Link>
            </div>
            <div className="flex-1 relative rounded-b-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
              <AssetMap
                assets={assets}
                height="h-full"
                zoomLevel="region"
                showWK={false}
              />
            </div>
          </div>

          {/* Trend Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase">
                  Efisiensi Biaya
                </h3>
                <TrendingUp size={16} className="text-emerald-500" />
              </div>
              <div className="h-32">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient
                          id="colorSavings"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.1}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={chartColors.grid}
                      />
                      <XAxis dataKey="day" hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: chartColors.tooltipBg,
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                        itemStyle={{
                          color: chartColors.tooltipText,
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="savings"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSavings)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase">
                  Jejak Karbon (Carbon)
                </h3>
                <Leaf size={16} className="text-sky-500" />
              </div>
              <div className="h-32">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient
                          id="colorCo2"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#0ea5e9"
                            stopOpacity={0.1}
                          />
                          <stop
                            offset="95%"
                            stopColor="#0ea5e9"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={chartColors.grid}
                      />
                      <XAxis dataKey="day" hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: chartColors.tooltipBg,
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                        itemStyle={{
                          color: chartColors.tooltipText,
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="emissions"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCo2)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Dense Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Financial Card - Clean */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                Dampak Finansial
              </h3>
              <PiggyBank size={16} className="text-slate-400" />
            </div>
            <div className="space-y-6">
              {isLoading ? (
                <>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <Skeleton className="h-3 w-1/4" />
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-slate-500 mb-1 font-medium">
                      Estimasi Penghematan
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(financials.savings)}
                    </p>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[65%]"></div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 mb-1 font-medium">
                      Volume Tender
                    </p>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">
                      {formatCurrency(financials.inTender)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="p-2 bg-indigo-50 dark:bg-slate-800 rounded-md text-indigo-600 w-fit mb-2">
                <Globe size={16} />
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase">
                Logistik
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                94%
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="p-2 bg-rose-50 dark:bg-slate-800 rounded-md text-rose-600 w-fit mb-2">
                <HeartPulse size={16} />
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase">
                Kesehatan
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                Baik
              </p>
            </div>
          </div>

          {/* System Status - List */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-4">
              Status Sistem
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>{" "}
                  Database
                </span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  Connected
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>{" "}
                  API Gateway
                </span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  24ms
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>{" "}
                  Sync
                </span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Laporan AI"
      >
        <div className="p-6">
          {isGenerating ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mb-4"></div>
              <p className="font-medium text-slate-600 dark:text-slate-300">
                Menyusun Data...
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="prose dark:prose-invert prose-sm max-w-none text-slate-700 dark:text-slate-300 font-medium whitespace-pre-line leading-relaxed">
                <TypewriterEffect text={reportContent} speed={15} />
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-bold transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Overview;

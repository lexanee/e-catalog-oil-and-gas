import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Hexagon,
  ArrowRight,
  Upload,
  AlertCircle,
  CheckCircle,
  FileText,
  Mail,
  Info,
  Building2,
} from "lucide-react";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"role_selection" | "form" | "success">(
    "role_selection"
  );
  const [selectedType, setSelectedType] = useState<"KKKS" | "Vendor">("KKKS");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    nip: "",
    email: "",
    kkks: "",
    entityName: "", // For Vendor
    npwp: "", // For Vendor
    role: "scm", // Default role
    file: null as File | null,
  });

  const handleRoleSelect = (type: "KKKS" | "Vendor") => {
    setSelectedType(type);
    setStep("form");
    // Reset role based on type
    setFormData((prev) => ({
      ...prev,
      role: type === "KKKS" ? "scm" : "vendor",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate validation delay
    setTimeout(() => {
      // 1. Vendor Validation Logic (Page 6-7 of Vendor Manual)
      if (selectedType === "Vendor") {
        // Mock Check: Email must match CIVD
        if (
          formData.email.includes("gmail") ||
          formData.email.includes("yahoo")
        ) {
          setError(
            "Data email tidak sesuai dengan CIVD. Gunakan email korporat yang terdaftar."
          );
          setIsLoading(false);
          return;
        }
        // Mock Check: NPWP must match CIVD
        if (formData.npwp.length < 15) {
          setError("NPWP tidak valid atau tidak terdaftar di CIVD.");
          setIsLoading(false);
          return;
        }
      }

      // 2. KKKS Validation Logic
      if (selectedType === "KKKS") {
        if (
          formData.email === "user@existing.com" ||
          formData.nip === "12345"
        ) {
          setError("NIP atau Email sudah terdaftar dalam sistem.");
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(false);
      setStep("success");
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors p-6">
      <div className="w-full max-w-lg">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-slate-200 dark:shadow-none">
            <Hexagon
              size={24}
              className="text-white dark:text-slate-900 fill-current"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            MIGAS e-Catalog
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Sistem Pendaftaran Terintegrasi (CIVD)
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          {step === "role_selection" && (
            <div className="p-8">
              <h2 className="text-lg font-bold text-center mb-6 text-slate-800 dark:text-white">
                Pilih Jenis Akun
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleRoleSelect("Vendor")}
                  className="p-6 border-2 border-slate-100 dark:border-slate-800 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group text-center"
                >
                  <Building2
                    size={32}
                    className="mx-auto mb-3 text-slate-400 group-hover:text-indigo-600"
                  />
                  <span className="block font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-700">
                    Vendor / Penyedia
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Wajib terdaftar di CIVD
                  </span>
                </button>
                <button
                  onClick={() => handleRoleSelect("KKKS")}
                  className="p-6 border-2 border-slate-100 dark:border-slate-800 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group text-center"
                >
                  <Hexagon
                    size={32}
                    className="mx-auto mb-3 text-slate-400 group-hover:text-emerald-600"
                  />
                  <span className="block font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-700">
                    KKKS (Kontraktor)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Personil SCM / Teknis
                  </span>
                </button>
              </div>
              <div className="text-center mt-6">
                <Link
                  to="/login"
                  className="text-sm font-bold text-slate-500 hover:text-slate-800"
                >
                  Sudah punya akun? Masuk
                </Link>
              </div>
            </div>
          )}

          {step === "form" && (
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setStep("role_selection")}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Ganti Tipe
                </button>
                <span className="text-xs text-slate-300">|</span>
                <span className="text-xs font-bold text-indigo-600 uppercase">
                  Pendaftaran {selectedType}
                </span>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {selectedType === "Vendor" ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Nama Entitas (Sesuai NPWP)
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.entityName}
                      onChange={(e) =>
                        setFormData({ ...formData, entityName: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-indigo-500 outline-none"
                      placeholder="PT. Penyedia Barang Jasa"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Email Terdaftar di CIVD
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-indigo-500 outline-none"
                      placeholder="admin@vendor.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      NPWP Terdaftar di CIVD
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.npwp}
                      onChange={(e) =>
                        setFormData({ ...formData, npwp: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-indigo-500 outline-none font-mono"
                      placeholder="00.000.000.0-000.000"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Nama Lengkap
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-indigo-500 outline-none"
                      placeholder="Nama sesuai identitas"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        NIP
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.nip}
                        onChange={(e) =>
                          setFormData({ ...formData, nip: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-indigo-500 outline-none"
                        placeholder="ID Pegawai"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        Email Instansi
                      </label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-indigo-500 outline-none"
                        placeholder="email@kkks.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        KKKS (Instansi)
                      </label>
                      <select
                        required
                        value={formData.kkks}
                        onChange={(e) =>
                          setFormData({ ...formData, kkks: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-indigo-500 outline-none"
                      >
                        <option value="">Pilih KKKS...</option>
                        <option value="Pertamina Hulu Energi">
                          Pertamina Hulu Energi
                        </option>
                        <option value="Medco Energi">Medco Energi</option>
                        <option value="ExxonMobil Cepu">ExxonMobil Cepu</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        Peran / Divisi
                      </label>
                      <select
                        required
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-indigo-500 outline-none"
                      >
                        <option value="scm">Pengadaan (SCM)</option>
                        <option value="technical">Teknis / Operasi</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex justify-between">
                  Surat Penunjukan (SK)
                  <span className="text-[10px] text-slate-400 normal-case font-normal">
                    *PDF Max 5MB
                  </span>
                </label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {formData.file ? (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <FileText size={20} />
                      <span className="text-sm font-bold">
                        {formData.file.name}
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload size={20} className="text-slate-400 mb-2" />
                      <p className="text-xs text-slate-500">
                        Upload Surat Penunjukan Pejabat Berwenang
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  required
                  className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-500 leading-snug">
                  Saya menyetujui Syarat & Ketentuan yang berlaku di e-Catalog
                  MIGAS.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm ${
                    isLoading
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:scale-[1.01]"
                  }`}
                >
                  {isLoading ? "Memvalidasi Data..." : "Daftar"}
                  {!isLoading && <ArrowRight size={18} />}
                </button>
              </div>
            </form>
          )}

          {step === "success" && (
            <div className="p-10 text-center animate-fade-in">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Pendaftaran Berhasil!
              </h2>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left flex gap-3">
                <Info size={20} className="text-blue-600 shrink-0" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  Tautan aktivasi akun telah dikirim ke{" "}
                  <strong>{formData.email}</strong>.
                  <br />
                  Silakan cek kotak masuk atau folder spam Anda. Akun harus
                  diaktifkan dalam waktu 24 jam.
                </p>
              </div>

              {/* Simulation Link */}
              <div className="mb-6 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-xs text-left">
                  <Mail size={16} />
                  <span>(Simulasi) Email Masuk:</span>
                </div>
                <Link
                  to="/activate"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Buka Link Aktivasi &rarr;
                </Link>
              </div>

              <Link
                to="/login"
                className="block w-full py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Kembali ke Halaman Login
              </Link>
            </div>
          )}
        </div>
        <p className="text-center text-xs text-slate-400 mt-8">
          &copy; {new Date().getFullYear()} MIGAS. Secured Enterprise System.
        </p>
      </div>
    </div>
  );
};

export default Register;

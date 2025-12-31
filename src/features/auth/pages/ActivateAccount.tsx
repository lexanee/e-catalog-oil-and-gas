import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Hexagon,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const ActivateAccount: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (pwd: string) => {
    // PDF Page 8: minimal 8 karakter (minimal 1 huruf besar, 1 huruf kecil & 1 angka)
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const isLongEnough = pwd.length >= 8;
    return isLongEnough && hasUpperCase && hasLowerCase && hasNumber;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validatePassword(password)) {
      setError(
        "Kata sandi tidak valid. Harap ikuti kriteria keamanan (Min 8 char, 1 Besar, 1 Kecil, 1 Angka)."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsLoading(true);

    // Simulate API Activation
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 animate-fade-in">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Aktivasi Berhasil
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Selamat, akun Anda sudah aktif.
            <br />
            Silahkan login dengan email dan kata sandi yang telah terdaftar.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Masuk (Login)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors p-6">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-slate-200 dark:shadow-none">
            <Hexagon
              size={24}
              className="text-white dark:text-slate-900 fill-current"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Aktivasi Akun
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Buat kata sandi untuk mengamankan akun Anda.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Kata Sandi Baru
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors w-4 h-4" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                *minimal 8 karakter (minimal 1 huruf besar, 1 huruf kecil & 1
                angka)
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Ulangi Kata Sandi
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors w-4 h-4" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-4 shadow-sm ${
                isLoading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:scale-[1.01]"
              }`}
            >
              {isLoading ? "Memproses..." : "Aktivasi"}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          &copy; {new Date().getFullYear()} MIGAS. Secured Enterprise System.
        </p>
      </div>
    </div>
  );
};

export default ActivateAccount;

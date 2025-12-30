import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth, UserRole } from "../../../context/AuthContext";
import {
  Lock,
  Mail,
  ArrowRight,
  Briefcase,
  ShoppingCart,
  HardHat,
  Hexagon,
  Activity,
} from "lucide-react";

const Login: React.FC = () => {
  const [activeRole, setActiveRole] = useState<UserRole>("scm");
  const [email, setEmail] = useState("scm@migas.go.id");
  const [password, setPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleSwitch = (role: UserRole) => {
    setActiveRole(role);
    if (role === "scm") setEmail("scm@migas.go.id");
    else if (role === "technical") setEmail("tech@migas.go.id");
    else setEmail("vendor@supplier.com");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      login(email, activeRole);
      const from =
        (location.state as any)?.from?.pathname ||
        (activeRole === "vendor" ? "/vendor" : "/");
      navigate(from, { replace: true });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-md p-6">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-slate-200 dark:shadow-none">
            <Hexagon
              size={24}
              className="text-white dark:text-slate-900 fill-current"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            MIGAS Enterprise
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            E-Catalog & Supply Chain Management
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Role Tabs - Refined for SCM/Tech/Vendor */}
          <div className="grid grid-cols-3 border-b border-slate-100 dark:border-slate-800">
            {[
              { id: "scm", label: "Pengadaan", icon: ShoppingCart },
              { id: "technical", label: "Teknis", icon: HardHat },
              { id: "vendor", label: "Penyedia", icon: Briefcase },
            ].map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => handleRoleSwitch(role.id as UserRole)}
                className={`py-4 text-[10px] font-bold uppercase tracking-wider transition-all flex flex-col items-center gap-1.5 ${
                  activeRole === role.id
                    ? "bg-slate-50 dark:bg-slate-800 text-indigo-700 dark:text-white border-b-2 border-indigo-600"
                    : "bg-white dark:bg-slate-900 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 border-b-2 border-transparent"
                }`}
              >
                <role.icon size={18} />
                {role.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Alamat Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                  placeholder="user@migas.go.id"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Kata Sandi
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-4 shadow-sm shadow-indigo-200 dark:shadow-none ${
                isLoading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:scale-[1.01]"
              }`}
            >
              {isLoading ? (
                <Activity size={18} className="animate-spin" />
              ) : (
                <ArrowRight size={18} />
              )}
              {isLoading ? "Memverifikasi..." : "Masuk"}
            </button>

            {/* Registration Link per PDF */}
            <div className="text-center pt-2">
              <span className="text-xs text-slate-500">Belum punya akun? </span>
              <Link
                to="/register"
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Daftar disini. Vendor atau KKKS
              </Link>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          &copy; {new Date().getFullYear()} MIGAS. Secured Enterprise System.
        </p>
      </div>
    </div>
  );
};

export default Login;

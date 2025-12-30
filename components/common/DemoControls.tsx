import React, { useState } from "react";
import { useAuth, UserRole } from "../../context/AuthContext";
import { Users, ChevronUp, ChevronDown, Check } from "lucide-react";

const DemoControls: React.FC = () => {
  const { user, login } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSwitch = (role: UserRole) => {
    login(`demo.${role}@skkmigas.go.id`, role);
    setMessage(`Switched to ${role.toUpperCase()}`);
    setTimeout(() => setMessage(null), 3000);
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[9999] flex flex-col items-start gap-2 animate-fade-in">
      {/* Toast Message */}
      {message && (
        <div className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xl animate-fade-in">
          {message}
        </div>
      )}

      {/* Main Pill */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-2xl p-1.5 flex items-center gap-2 transition-all hover:scale-105">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md hover:bg-indigo-700 transition-colors"
        >
          <Users size={16} />
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 flex items-center gap-1 ${
            isOpen ? "w-auto opacity-100 px-2" : "w-0 opacity-0"
          }`}
        >
          <RoleButton
            active={user.role === "scm"}
            label="SCM"
            onClick={() => handleSwitch("scm")}
          />
          <RoleButton
            active={user.role === "technical"}
            label="TEK"
            onClick={() => handleSwitch("technical")}
          />
          <RoleButton
            active={user.role === "vendor"}
            label="VND"
            onClick={() => handleSwitch("vendor")}
          />
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="pr-2 text-slate-400 hover:text-slate-600"
        >
          {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>
    </div>
  );
};

const RoleButton = ({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
      active
        ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200"
        : "text-slate-500 hover:bg-slate-50"
    }`}
  >
    {active && <Check size={10} />}
    {label}
  </button>
);

export default DemoControls;

import React from "react";
import Modal from "./Modal";
import { AlertCircle, CheckCircle, Info, Trash2 } from "lucide-react";

export type ConfirmationType = "danger" | "success" | "warning" | "info";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmationType;
  singleButton?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
  singleButton = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case "danger":
        return <Trash2 size={48} className="text-rose-500" />;
      case "success":
        return <CheckCircle size={48} className="text-emerald-500" />;
      case "warning":
        return <AlertCircle size={48} className="text-amber-500" />;
      case "info":
      default:
        return <Info size={48} className="text-indigo-500" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case "danger":
        return "bg-rose-600 hover:bg-rose-700 focus:ring-rose-300";
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 focus:ring-amber-300";
      case "info":
      default:
        return "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === "danger" ? "Konfirmasi" : title}
      maxWidth="max-w-sm"
    >
      <div className="flex flex-col items-center text-center p-2">
        <div className="mb-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-full ring-8 ring-slate-50 dark:ring-slate-800/50">
          {getIcon()}
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3 w-full">
          {!singleButton && (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className={`flex-1 py-2.5 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 focus:outline-none focus:ring-4 ${getButtonColor()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;

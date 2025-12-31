import React, { useState, useEffect } from "react";
import { useAssets } from "../../context/AssetContext";
import { useLogistics } from "../../context/LogisticsContext";
import { useMaterialTransfer } from "../../hooks/useMaterialTransfer";
import {
  Truck,
  ArrowRight,
  Clock,
  MapPin,
  Package,
  AlertCircle,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";

interface TransferFormProps {
  onSuccess: (eta: string) => void;
  onCancel: () => void;
}

const TransferForm: React.FC<TransferFormProps> = ({ onSuccess, onCancel }) => {
  const { assets } = useAssets();
  const { shorebases } = useLogistics();
  const { calculateETA, initiateTransfer } = useMaterialTransfer();

  const [sourceId, setSourceId] = useState<string>(shorebases[0]?.id || "");
  const [targetId, setTargetId] = useState<string>(assets[0]?.id || "");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(0);
  const [etaInfo, setEtaInfo] = useState<{
    distanceKm: number;
    hours: number;
    etaDate: Date;
  } | null>(null);

  const [errorModalOpen, setErrorModalOpen] = useState(false);

  const selectedShorebase = shorebases.find((s) => s.id === sourceId);
  const selectedStockItem = selectedShorebase?.currentStock?.find(
    (s) => s.item === selectedItem
  );

  useEffect(() => {
    if (sourceId && targetId) {
      setEtaInfo(calculateETA(sourceId, targetId));
    }
  }, [sourceId, targetId]);

  useEffect(() => {
    setSelectedItem("");
    setQuantity(0);
  }, [sourceId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockItem || quantity <= 0) return;
    if (quantity > selectedStockItem.qty) {
      setErrorModalOpen(true);
      return;
    }

    initiateTransfer(
      sourceId,
      targetId,
      selectedItem,
      quantity,
      selectedStockItem.unit
    );

    const etaString = etaInfo ? `${etaInfo.hours.toFixed(1)} Jam` : "Unknown";
    onSuccess(etaString);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
        <div className="p-2 bg-indigo-600 text-white rounded-lg">
          <Truck size={20} />
        </div>
        <div>
          <h3 className="font-bold text-indigo-900 dark:text-white">
            Permintaan Transfer Material (MTR)
          </h3>
          <p className="text-xs text-indigo-700 dark:text-indigo-300">
            Pengiriman stok dari Pangkalan ke Aset.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Dari (Shorebase)
            </label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium outline-none focus:border-indigo-500"
            >
              {shorebases.map((sb) => (
                <option key={sb.id} value={sb.id}>
                  {sb.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Ke (Aset)
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium outline-none focus:border-indigo-500"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
            <div className="flex items-center gap-1">
              <MapPin size={12} /> Jarak:{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {etaInfo?.distanceKm.toFixed(0)} km
              </span>
            </div>
            <ArrowRight size={12} className="text-slate-300" />
            <div className="flex items-center gap-1">
              <Clock size={12} /> Estimasi Waktu:{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {etaInfo?.hours.toFixed(1)} jam
              </span>
            </div>
          </div>

          <div className="space-y-1.5 mb-3">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Pilih Barang
            </label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium outline-none focus:border-indigo-500"
            >
              <option value="">-- Pilih Stok --</option>
              {selectedShorebase?.currentStock?.map((s) => (
                <option key={s.item} value={s.item} disabled={s.qty === 0}>
                  {s.item} (Tersedia: {s.qty} {s.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Jumlah (Qty)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max={selectedStockItem?.qty}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="flex-1 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold outline-none focus:border-indigo-500"
                placeholder="0"
                disabled={!selectedItem}
              />
              <div className="flex items-center px-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold text-slate-500">
                {selectedStockItem?.unit || "Unit"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={!selectedItem || quantity <= 0}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Package size={16} /> Kirim Pesanan
          </button>
        </div>
      </form>

      <ConfirmationModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        title="Stok Tidak Cukup"
        message="Jumlah permintaan melebihi stok yang tersedia di pangkalan."
        type="danger"
        singleButton={true}
        confirmText="OK"
      />
    </div>
  );
};

export default TransferForm;

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Shorebase, Transfer } from "../types";
import { mockApi } from "../services/mockApi";

interface LogisticsContextType {
  shorebases: Shorebase[];
  transfers: Transfer[];

  createTransfer: (transfer: Transfer) => void;
  updateTransferStatus: (id: string, status: "RECEIVED" | "SHIPPING") => void;
  updateShorebaseStock: (
    shorebaseId: string,
    item: string,
    qtyDelta: number
  ) => void;

  resetLogistics: () => void;
}

const LogisticsContext = createContext<LogisticsContextType | undefined>(
  undefined
);

export const LogisticsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [shorebases, setShorebases] = useState<Shorebase[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  // Initialize Data
  useEffect(() => {
    mockApi.getShorebases().then(setShorebases);
  }, []);

  // Simulation loop for moving transfers (Ships/Trucks)
  useEffect(() => {
    const interval = setInterval(() => {
      setTransfers((prev) =>
        prev.map((t) => {
          if (t.status === "RECEIVED") return t;
          const jitter = 0.01;
          return {
            ...t,
            coordinates: {
              lat: t.coordinates.lat + (Math.random() - 0.5) * jitter,
              lng: t.coordinates.lng + (Math.random() - 0.5) * jitter,
            },
          };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const createTransfer = (transfer: Transfer) => {
    // 1. Deduct from Shorebase
    setShorebases((prev) =>
      prev.map((sb) => {
        if (sb.id === transfer.sourceId) {
          return {
            ...sb,
            currentStock: sb.currentStock?.map((stock) =>
              stock.item === transfer.item
                ? { ...stock, qty: stock.qty - transfer.quantity }
                : stock
            ),
          };
        }
        return sb;
      })
    );

    // 2. Add to Transfers list
    setTransfers((prev) => [transfer, ...prev]);
  };

  const updateTransferStatus = (
    id: string,
    status: "RECEIVED" | "SHIPPING"
  ) => {
    setTransfers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  const updateShorebaseStock = (
    shorebaseId: string,
    item: string,
    qtyDelta: number
  ) => {
    setShorebases((prev) =>
      prev.map((sb) => {
        if (sb.id === shorebaseId) {
          return {
            ...sb,
            currentStock: sb.currentStock?.map((stock) =>
              stock.item === item
                ? { ...stock, qty: stock.qty + qtyDelta }
                : stock
            ),
          };
        }
        return sb;
      })
    );
  };

  const resetLogistics = async () => {
    const fresh = await mockApi.getShorebases();
    setShorebases(fresh);
    setTransfers([]);
  };

  return (
    <LogisticsContext.Provider
      value={{
        shorebases,
        transfers,
        createTransfer,
        updateTransferStatus,
        updateShorebaseStock,
        resetLogistics,
      }}
    >
      {children}
    </LogisticsContext.Provider>
  );
};

export const useLogistics = () => {
  const context = useContext(LogisticsContext);
  if (!context)
    throw new Error("useLogistics must be used within a LogisticsProvider");
  return context;
};

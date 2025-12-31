import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Asset, Notification, Zone, AssessmentDoc } from "../types";
import { mockApi } from "../services/mockApi";

interface AssetContextType {
  assets: Asset[];
  zones: Zone[];
  notifications: Notification[];
  savedAssessments: AssessmentDoc[];
  unreadCount: number;
  isSimulationPaused: boolean;
  isLoading: boolean;

  // Notification Actions
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (
    assetId: string,
    title: string,
    message: string,
    type: "critical" | "warning" | "info"
  ) => void;

  // Asset Actions
  addAsset: (asset: Asset) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;

  // Assessment Actions
  saveFinalAssessment: (doc: AssessmentDoc) => void;

  // Simulation Actions
  toggleSimulation: () => void;
  injectScenario: (
    type: "failure_rig_a" | "weather_natuna" | "cyber_attack"
  ) => void;
  resetAssets: () => void;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

const getDistanceFromLatLonInMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))) * 1000;
};

export const AssetProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [savedAssessments, setSavedAssessments] = useState<AssessmentDoc[]>([]);
  const [isSimulationPaused, setIsSimulationPaused] = useState(false);

  // --- Initial Data Fetch ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedAssets, fetchedZones] = await Promise.all([
          mockApi.getAssets(),
          mockApi.getZones(),
        ]);
        setAssets(fetchedAssets);
        setZones(fetchedZones);
      } catch (error) {
        console.error("Failed to load assets:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Notification Logic ---
  const markAsRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const addNotification = (
    assetId: string,
    title: string,
    message: string,
    type: "critical" | "warning" | "info"
  ) => {
    const newNote: Notification = {
      id: Date.now().toString() + Math.random(),
      assetId,
      title,
      message,
      type,
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNote, ...prev].slice(0, 50));
  };

  // --- Asset Management ---
  const addAsset = (asset: Asset) => {
    setAssets((prev) => [asset, ...prev]);
    addNotification(
      asset.id,
      "Aset Baru",
      `Aset ${asset.name} berhasil didaftarkan ke inventaris.`,
      "info"
    );
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const deleteAsset = (id: string) => {
    const asset = assets.find((a) => a.id === id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
    if (asset)
      addNotification(
        id,
        "Aset Dihapus",
        `${asset.name} telah dihapus dari sistem.`,
        "warning"
      );
  };

  // --- Assessment Logic ---
  const saveFinalAssessment = (doc: AssessmentDoc) => {
    setSavedAssessments((prev) => [doc, ...prev]);
    addNotification(
      doc.id,
      "Berita Acara Disimpan",
      `Asesmen Pasar ${doc.id} telah difinalisasi dan diarsipkan.`,
      "info"
    );
  };

  // --- Simulation Logic ---
  const toggleSimulation = () => setIsSimulationPaused((prev) => !prev);

  const injectScenario = (
    type: "failure_rig_a" | "weather_natuna" | "cyber_attack"
  ) => {
    if (type === "failure_rig_a") {
      setAssets((prev) =>
        prev.map((a) => {
          if (a.id === "1") {
            return {
              ...a,
              health: 35,
              status: "Inactive",
              incidentCount: a.incidentCount + 1,
              csmsScore: 40,
            };
          }
          return a;
        })
      );
      addNotification(
        "1",
        "PERINGATAN KRITIS",
        "Rig Darat A: Kegagalan Mesin Utama terdeteksi. Protokol darurat aktif.",
        "critical"
      );
    }

    if (type === "weather_natuna") {
      addNotification(
        "SYS",
        "PERINGATAN CUACA",
        "Laut Natuna: Peringatan Siklon Tropis. Seluruh operasi lepas pantai ditangguhkan.",
        "warning"
      );
      setAssets((prev) =>
        prev.map((a) => {
          if (a.location.includes("Natuna") || a.location.includes("North")) {
            return { ...a, status: "Inactive" };
          }
          return a;
        })
      );
    }

    if (type === "cyber_attack") {
      addNotification(
        "SYS",
        "PELANGGARAN KEAMANAN",
        "Trafik tidak wajar terdeteksi pada Gateway Logistik. Penguncian sistem (Lockdown) dimulai.",
        "critical"
      );
    }
  };

  const resetAssets = async () => {
    const initial = await mockApi.getAssets();
    setAssets(initial);
    setNotifications([]);
    setSavedAssessments([]);
    setIsSimulationPaused(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (isSimulationPaused) return;

      // Asset Movement & Health Simulation
      setAssets((currentAssets) =>
        currentAssets.map((asset) => {
          if (asset.status !== "Active") return asset;
          const scale = asset.category === "Kapal" ? 0.0008 : 0.00005;
          const newLat = asset.coordinates.lat + (Math.random() - 0.5) * scale;
          const newLng = asset.coordinates.lng + (Math.random() - 0.5) * scale;
          const newHistory = [asset.coordinates, ...asset.history].slice(0, 20);

          // Geofence Logic
          let detectedZoneId: string | undefined = undefined;
          zones.forEach((zone) => {
            if (
              getDistanceFromLatLonInMeters(
                newLat,
                newLng,
                zone.coordinates.lat,
                zone.coordinates.lng
              ) <= zone.radius
            ) {
              detectedZoneId = zone.id;
              if (asset.currentZoneId !== zone.id) {
                addNotification(
                  asset.id,
                  "Peringatan Geofence",
                  `${asset.name} memasuki area ${zone.name}`,
                  "info"
                );
              }
            }
          });

          const jitter = (Math.random() - 0.5) * 0.5;
          const newHealth = Math.min(100, Math.max(0, asset.health + jitter));
          const emissionJitter = Math.random() * 0.05;
          const newTotalEmissions =
            asset.totalEmissions +
            (asset.co2Emissions / 86400) * 2 +
            emissionJitter;

          return {
            ...asset,
            coordinates: { lat: newLat, lng: newLng },
            history: newHistory,
            currentZoneId: detectedZoneId,
            health: Number(newHealth.toFixed(2)),
            totalEmissions: Number(newTotalEmissions.toFixed(4)),
          };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [zones, isSimulationPaused]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AssetContext.Provider
      value={{
        assets,
        zones,
        notifications,
        savedAssessments,
        unreadCount,
        isSimulationPaused,
        isLoading,
        markAsRead,
        markAllAsRead,
        addNotification,
        addAsset,
        updateAsset,
        deleteAsset,
        saveFinalAssessment,
        toggleSimulation,
        injectScenario,
        resetAssets,
      }}
    >
      {children}
    </AssetContext.Provider>
  );
};

export const useAssets = () => {
  const context = useContext(AssetContext);
  if (!context)
    throw new Error("useAssets must be used within an AssetProvider");
  return context;
};

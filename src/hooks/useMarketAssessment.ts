import { useState, useCallback } from "react";
import { useAssets } from "../context/AssetContext";
import { useProcurement } from "../context/ProcurementContext";
import { useAuth } from "../context/AuthContext";
import { Asset, AssessmentDoc, AssessmentFilter } from "../types";

export const useMarketAssessment = () => {
  const { assets } = useAssets();
  const {
    contracts,
    requests,
    saveAssessment: saveToContext,
  } = useProcurement();
  const { user } = useAuth();

  const [assessment, setAssessment] = useState<AssessmentDoc>({
    id: "NEW",
    createdBy: user?.name || "Unknown User",
    createdAt: new Date().toISOString(),
    title: `Market Assessment - ${new Date().toLocaleDateString()}`,
    status: "Konsep",
    filters: {
      category: "Onshore Rig",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(new Date().setDate(new Date().getDate() + 30))
        .toISOString()
        .split("T")[0],
      minYear: 2010,
      minCapacity: 0,
    },
    candidates: [],
  });

  const [isCalculated, setIsCalculated] = useState(false);

  // Helper: Parse "2000 HP" or "80 Ton" to number 2000/80
  const extractCapacityValue = (capacityStr: string): number => {
    const matches = capacityStr.match(/(\d+)/);
    return matches ? parseInt(matches[0]) : 0;
  };

  // Helper: Check Date Overlap
  const checkOverlap = (
    startA: string,
    endA: string,
    startB: string,
    endB: string
  ): boolean => {
    const sA = new Date(startA).getTime();
    const eA = new Date(endA).getTime();
    const sB = new Date(startB).getTime();
    const eB = new Date(endB).getTime();
    return sA <= eB && eA >= sB;
  };

  const updateFilters = (newFilters: Partial<AssessmentFilter>) => {
    if (assessment.status === "Tersimpan") return; // Immutable check
    setAssessment((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
    }));
    setIsCalculated(false);
  };

  const updateTitle = (title: string) => {
    if (assessment.status === "Tersimpan") return;
    setAssessment((prev) => ({ ...prev, title }));
  };

  const runAssessment = useCallback(() => {
    const { category, minYear, minCapacity, startDate, endDate, region } =
      assessment.filters;

    const results = assets.filter((asset) => {
      // 1. Basic Status Check
      if (asset.status !== "Active") return false;

      // 2. Category Check
      if (category !== "All" && asset.category !== category) return false;

      // 3. Technical Parameters
      if (minYear && asset.yearBuilt < minYear) return false;

      const assetCapVal = extractCapacityValue(asset.capacityString || "");
      if (minCapacity && assetCapVal < minCapacity) return false;

      if (
        region &&
        !asset.location.toLowerCase().includes(region.toLowerCase())
      )
        return false;

      // 4. Critical: Date Availability Check against Contracts
      const isBookedInContract = contracts.some((contract) => {
        const hasAsset = contract.assetNames.includes(asset.name);
        const isLiveContract = contract.status === "Active";
        const overlap = checkOverlap(
          startDate,
          endDate,
          contract.startDate,
          contract.endDate
        );
        return hasAsset && isLiveContract && overlap;
      });

      if (isBookedInContract) return false;

      // Check against Approved/Pending Requests
      const isBookedInRequest = requests.some((req) => {
        const isSameAsset = req.assetName === asset.name;
        const isRelevantStatus =
          req.status === "Approved" || req.status === "Pending";
        if (!req.dateFrom || !req.dateTo) return false;

        const overlap = checkOverlap(
          startDate,
          endDate,
          req.dateFrom,
          req.dateTo
        );
        return isSameAsset && isRelevantStatus && overlap;
      });

      if (isBookedInRequest) return false;

      return true;
    });

    setAssessment((prev) => ({
      ...prev,
      candidates: results,
    }));
    setIsCalculated(true);
  }, [assessment.filters, assets, contracts, requests]);

  const saveAssessment = (status: "DRAFT" | "FINAL") => {
    if (assessment.candidates.length === 0 && !isCalculated) {
      throw new Error(
        "Harap lakukan kalkulasi kandidat terlebih dahulu sebelum menyimpan."
      );
    }

    // Use ProcurementContext to handle saving and ID generation
    const savedDoc = saveToContext(assessment, status);

    // Update local state with the returned doc (contains new ID and Status)
    setAssessment(savedDoc);
  };

  const resetAssessment = () => {
    setAssessment({
      id: "NEW",
      createdBy: user?.name || "Unknown User",
      createdAt: new Date().toISOString(),
      title: `Market Assessment - ${new Date().toLocaleDateString()}`,
      status: "Konsep",
      filters: {
        category: "Onshore Rig",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(new Date().setDate(new Date().getDate() + 30))
          .toISOString()
          .split("T")[0],
        minYear: 2010,
        minCapacity: 0,
      },
      candidates: [],
    });
    setIsCalculated(false);
  };

  return {
    assessment,
    updateFilters,
    updateTitle,
    runAssessment,
    saveAssessment,
    resetAssessment,
    isCalculated,
  };
};

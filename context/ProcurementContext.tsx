import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  QuotationRequest,
  Tender,
  Contract,
  Vendor,
  TenderBid,
  AssessmentDoc,
} from "../types";
import {
  requestsData as initialRequests,
  vendors as initialVendors,
  tendersData as initialTenders,
  assessmentData as initialAssessments,
} from "../mockData";

interface ProcurementContextType {
  requests: QuotationRequest[];
  tenders: Tender[];
  contracts: Contract[];
  vendors: Vendor[];
  assessments: AssessmentDoc[];

  // Request Actions
  addRequest: (request: QuotationRequest) => void;
  updateRequest: (id: string, updates: Partial<QuotationRequest>) => void;

  // Tender Actions
  addTender: (tender: Tender) => void;
  updateTender: (id: string, updates: Partial<Tender>) => void;
  submitBid: (tenderId: string, bid: TenderBid) => void;
  awardTender: (
    tenderId: string,
    vendorName: string,
    amount: number,
    associatedRequests: QuotationRequest[]
  ) => void;

  // Contract Actions
  updateContract: (id: string, updates: Partial<Contract>) => void;

  // Assessment Actions
  saveAssessment: (
    doc: AssessmentDoc,
    status: "DRAFT" | "FINAL"
  ) => AssessmentDoc;

  resetProcurement: () => void;
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(
  undefined
);

export const ProcurementProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [requests, setRequests] = useState<QuotationRequest[]>(initialRequests);
  const [tenders, setTenders] = useState<Tender[]>(initialTenders);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [vendors] = useState<Vendor[]>(initialVendors);
  const [assessments, setAssessments] =
    useState<AssessmentDoc[]>(initialAssessments);

  const addRequest = (request: QuotationRequest) => {
    setRequests((prev) => [request, ...prev]);
  };

  const updateRequest = (id: string, updates: Partial<QuotationRequest>) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const addTender = (tender: Tender) => {
    setTenders((prev) => [tender, ...prev]);
    // Link requests to tender
    setRequests((prev) =>
      prev.map((req) =>
        tender.items.includes(req.id) ? { ...req, tenderId: tender.id } : req
      )
    );
  };

  const updateTender = (id: string, updates: Partial<Tender>) => {
    setTenders((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const submitBid = (tenderId: string, bid: TenderBid) => {
    setTenders((prev) =>
      prev.map((t) => {
        if (t.id === tenderId) {
          const currentBids = t.bids || [];
          return { ...t, bids: [...currentBids, bid] };
        }
        return t;
      })
    );
  };

  const awardTender = (
    tenderId: string,
    vendorName: string,
    amount: number,
    associatedRequests: QuotationRequest[]
  ) => {
    const tender = tenders.find((t) => t.id === tenderId);
    if (!tender) return;

    updateTender(tenderId, { status: "Closed" });

    const contractId = `CTR-${new Date().getFullYear()}-${Math.floor(
      Math.random() * 10000
    )}`;
    const assetNames = associatedRequests
      .filter((r) => tender.items.includes(r.id))
      .map((r) => r.assetName);

    const newContract: Contract = {
      id: contractId,
      tenderId: tenderId,
      vendorName: vendorName,
      assetNames: assetNames,
      totalValue: amount,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 12))
        .toISOString()
        .split("T")[0],
      status: "Active",
      blockchainHash:
        "0x" +
        Array(40)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join(""),
      milestones: [
        {
          id: "m1",
          label: "Contract Signing",
          targetDate: new Date().toISOString().split("T")[0],
          status: "Completed",
        },
        {
          id: "m2",
          label: "Mobilization",
          targetDate: "2024-05-15",
          status: "In Progress",
        },
        {
          id: "m3",
          label: "Spud / Commencement",
          targetDate: "2024-06-01",
          status: "Pending",
        },
        {
          id: "m4",
          label: "Project Completion",
          targetDate: "2025-05-01",
          status: "Pending",
        },
      ],
    };

    setContracts((prev) => [newContract, ...prev]);
  };

  const updateContract = (id: string, updates: Partial<Contract>) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const saveAssessment = (
    doc: AssessmentDoc,
    status: "DRAFT" | "FINAL"
  ): AssessmentDoc => {
    // Logic: If FINAL, generate official Berita Acara ID. If Draft, keep generic or existing.
    let newId = doc.id;
    let newStatus: "Konsep" | "Tersimpan" =
      status === "FINAL" ? "Tersimpan" : "Konsep";

    if (
      status === "FINAL" &&
      (doc.id === "NEW" || doc.id.startsWith("DRAFT"))
    ) {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      newId = `BA-${year}-${random}`;
    } else if (doc.id === "NEW") {
      newId = `DRAFT-${Date.now()}`;
    }

    const updatedDoc: AssessmentDoc = {
      ...doc,
      id: newId,
      status: newStatus,
      createdAt: status === "FINAL" ? new Date().toISOString() : doc.createdAt,
    };

    setAssessments((prev) => {
      const exists = prev.findIndex((a) => a.id === doc.id);
      if (exists >= 0) {
        const copy = [...prev];
        copy[exists] = updatedDoc;
        return copy;
      }
      return [updatedDoc, ...prev];
    });

    return updatedDoc;
  };

  const resetProcurement = () => {
    setRequests(initialRequests);
    setTenders([]);
    setContracts([]);
    setAssessments([]);
  };

  return (
    <ProcurementContext.Provider
      value={{
        requests,
        tenders,
        contracts,
        vendors,
        assessments,
        addRequest,
        updateRequest,
        addTender,
        updateTender,
        submitBid,
        awardTender,
        updateContract,
        saveAssessment,
        resetProcurement,
      }}
    >
      {children}
    </ProcurementContext.Provider>
  );
};

export const useProcurement = () => {
  const context = useContext(ProcurementContext);
  if (!context)
    throw new Error("useProcurement must be used within a ProcurementProvider");
  return context;
};

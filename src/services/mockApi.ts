import db from "../data/db.json";
import {
  Asset,
  Vendor,
  Shorebase,
  Zone,
  QuotationRequest,
  Tender,
  AssessmentDoc,
  TechnicalParameter,
  Contract,
} from "../types";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Generic fetch function to simulate API calls
async function fetchMockData<T>(data: T, delayMs: number = 500): Promise<T> {
  await delay(delayMs);
  return data;
}

export const mockApi = {
  // --- ASSETS ---
  getAssets: async (): Promise<Asset[]> =>
    fetchMockData(db.assets as unknown as Asset[]),

  getAssetById: async (id: string): Promise<Asset | undefined> => {
    await delay(300);
    return (db.assets as unknown as Asset[]).find((a) => a.id === id);
  },

  createAsset: async (asset: Asset): Promise<Asset> => {
    await delay(800);
    // In a real mock server, we'd write to the file. Here we just return simulacrum.
    // The Context will handle the "local" state update.
    return asset;
  },

  updateAsset: async (
    id: string,
    searchUpdates: Partial<Asset>
  ): Promise<Asset> => {
    await delay(500);
    const asset = (db.assets as unknown as Asset[]).find((a) => a.id === id);
    if (!asset) throw new Error("Asset not found");
    return { ...asset, ...searchUpdates };
  },

  deleteAsset: async (id: string): Promise<void> => {
    await delay(500);
    return;
  },

  // --- VENDORS ---
  getVendors: async (): Promise<Vendor[]> =>
    fetchMockData(db.vendors as Vendor[]),

  // --- SHOREBASES ---
  getShorebases: async (): Promise<Shorebase[]> =>
    fetchMockData(db.shorebases as Shorebase[]),

  // --- ZONES ---
  getZones: async (): Promise<Zone[]> => fetchMockData(db.zones as Zone[]),

  // --- PROCUREMENT ---
  getQuotationRequests: async (): Promise<QuotationRequest[]> =>
    fetchMockData(db.quotationRequests as QuotationRequest[]),

  getTenders: async (): Promise<Tender[]> =>
    fetchMockData(db.tenders as Tender[]),

  getAssessments: async (): Promise<AssessmentDoc[]> => {
    // Correct type casting for assessments which might be 'any' in db.json initially
    return fetchMockData(db.assessments as unknown as AssessmentDoc[]);
  },

  saveAssessment: async (doc: AssessmentDoc): Promise<AssessmentDoc> => {
    await delay(800);
    return doc;
  },

  createTender: async (tender: Tender): Promise<Tender> => {
    await delay(600);
    return tender;
  },

  createRequest: async (
    request: QuotationRequest
  ): Promise<QuotationRequest> => {
    await delay(600);
    return request;
  },

  createContract: async (contract: Contract): Promise<Contract> => {
    await delay(1000);
    return contract;
  },
};

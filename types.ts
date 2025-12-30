export type AssetCategory = "Onshore Rig" | "Offshore Rig" | "Kapal";
export type AssetStatus =
  | "Active"
  | "Inactive"
  | "Maintenance"
  | "Registered"
  | "Catalog_Filling"
  | "Verification";

export interface Coordinates {
  lat: number;
  lng: number;
}

// Detailed Specifications for Gap Analysis Compliance

export interface Capacities {
  fuelOil: number; // m3
  freshWater: number; // m3
  drillWater?: number; // m3
  liquidMud?: number; // m3
  bulkCement?: number; // m3
  deckArea: number; // m2
  deckCargo: number; // tons
}

export interface FireFighting {
  class: string; // e.g., "FiFi 1"
  monitors: number;
  capacity: number; // m3/hr
  foamCapacity?: number; // liters
}

export interface Navigation {
  radar: string[];
  gps: string;
  echoSounder: string;
  autoPilot: string;
  gmdss: string; // Global Maritime Distress and Safety System
  ais: boolean; // Automatic Identification System
}

export interface MudSystem {
  pumpCount: number;
  pumpType: string;
  pressureRating: number; // psi
  totalCapacity: number; // bbl
  shaleShakers: number;
  desander: boolean;
  desilter: boolean;
}

export interface WellControl {
  bopStack: string; // e.g., "13-5/8 10k"
  diverter: string;
  chokeManifold: string;
  accumulatorUnit: string;
}

export interface TechnicalSpecs {
  // Vessel Specific
  bollardPull?: number; // tons
  dwt?: number; // deadweight tonnage
  grossTonnage?: number;
  mainEngine?: string;
  bhp?: number; // Brake Horse Power
  maxSpeed?: number; // knots

  // Vessel - Detailed (New)
  capacities?: Capacities;
  fireFighting?: FireFighting;
  navigation?: Navigation;

  // Rig Specific - Basic
  ratedHP?: number; // Horse Power rating
  drillingDepth?: number; // ft
  waterDepth?: number; // ft
  cantileverSkid?: number; // ft
  quartersCapacity?: number; // pax
  variableDeckLoad?: number; // kips

  // Rig Specific - Advanced (Gap Analysis Fix)
  drawworksHP?: number;
  topDriveTorque?: number; // ft-lbs

  // Rig - Detailed (New)
  mudSystem?: MudSystem;
  wellControl?: WellControl;

  // Common Dimensions
  loa?: number; // Length Overall (m)
  breadth?: number; // m
  depth?: number; // m
  draft?: number; // m
}

export interface MaintenanceRecord {
  id: string;
  title: string;
  date: string;
  type: "Inspection" | "Repair" | "Maintenance";
  description: string;
  status: "Open" | "In Progress" | "Completed";
  priority?: "Low" | "Medium" | "High" | "Critical";
}

export interface SparePart {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minLevel: number;
  unit: string;
  location: string;
  lastUpdated: string;
}

export interface DataOwner {
  name: string;
  email: string;
  phone: string;
  address: string;
  type: "Owner" | "Operator";
  // Operator Specific
  appointmentEndDate?: string;
  appointmentDoc?: string; // Filename/URL
  // Verification
  proofOfOwnershipDoc?: string; // Filename/URL
}

export interface Asset {
  id: string;
  number: string;
  name: string;
  category: AssetCategory;
  subType?: string;
  location: string;
  coordinates: Coordinates;
  history: Coordinates[];
  dailyRate: number;
  status: AssetStatus;

  // New Fields for Compliance
  classification?: "BKI" | "Non-BKI"; // Added
  priority?: "1" | "2" | "3"; // Added for Rigs/Non-BKI Vessels

  health: number;
  expiryDate?: string;
  crewCount?: number;
  certification: string;
  yearBuilt: number;
  manufacturer: string;
  flagCountry?: string;

  // Updated Owner Structure
  ownerType?: "National" | "Foreign"; // Retain for high-level filtering
  dataOwner?: DataOwner; // Detailed owner info (Gap Fix)
  ownerVendorId?: string;

  // Enhanced Specs
  specs: TechnicalSpecs;
  capacityString?: string; // Display purposes only (e.g. "2000 HP")

  co2Emissions: number;
  totalEmissions: number; // Added to match usage
  sustainabilityScore?: number;
  csmsScore: number;
  incidentCount: number;
  daysSinceIncident: number;
  nextMaintenanceDate: string;
  mtbf: number;
  maintenanceLog?: MaintenanceRecord[];
  inventory?: SparePart[];
  currentZoneId?: string;
  bkiData?: any;
  imoNumber?: string;
}

export interface Zone {
  id: string;
  name: string;
  coordinates: Coordinates;
  radius: number;
  color: string;
  type: "danger" | "safe";
}

export interface Vendor {
  id: string;
  name: string;
  type: string; // "PT" | "CV" | "BUT"
  status: "Verified" | "Pending" | "Suspended" | "Blacklisted";

  // Registration Fields (Gap Fix)
  npwp: string;
  civilRegistrationType: "National" | "Local"; // SKK Migas/Local
  address: string;
  phone: string;

  // CIVD Integration
  civdId: string;
  civdExpiry?: string;

  // Performance
  csmsScore?: number;
  performanceRating?: number;
  projectsCompleted?: number;
  riskLevel?: "Low" | "Medium" | "High";

  // Contact
  contactName: string;
  contactEmail?: string;
}

export interface ShorebaseStock {
  item: string;
  qty: number;
  unit: string;
}

export interface Shorebase {
  id: string;
  name: string;
  location: string;
  coordinates: Coordinates;
  capabilities: string[];
  currentStock: ShorebaseStock[];
  // New Ownership Fields
  owner: string; // e.g. "Medco Energi", "Petrosea"
  type: "KKKS" | "ThirdParty";
}

export interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: string;
}

export interface QuotationRequest {
  id: string;
  date: string;
  assetName: string;
  category: AssetCategory;
  status: "Approved" | "Pending" | "Review" | "Rejected";
  hps: string;
  tenderId?: string;
  kkksName?: string;
  contactName?: string;
  contactEmail?: string;
  contactNumber?: string;
  projectName?: string;
  additionalInfo?: string;
  dateFrom?: string;
  dateTo?: string;
  techStatus?: "Valid" | "Invalid";
  techNotes?: string;
  comments?: Comment[];
}

export interface TenderBid {
  id?: string;
  tenderId?: string;
  vendorId?: string;
  vendorName: string;
  amount?: number; // legacy support
  bidAmount?: number; // legacy support
  submittedDate: string;
  status: "Submitted" | "Review" | "Shortlisted" | "Pending";
  technicalScore?: number;
  commercialScore?: number;
  documents?: any[];
  complianceScore?: number;
}

export interface Tender {
  id: string;
  name: string;
  description: string;
  createdDate: string;
  bidOpeningDate?: string;
  status: "Draft" | "Published" | "Review" | "Closed";
  items: string[];
  totalValue: number;
  bids?: TenderBid[];
}

export interface Milestone {
  id: string;
  label: string;
  targetDate: string;
  status: "Completed" | "In Progress" | "Pending" | "Delayed";
}

export interface Contract {
  id: string;
  tenderId: string;
  vendorName: string;
  assetNames: string[];
  totalValue: number;
  startDate: string;
  endDate: string;
  status: "Active" | "Completed" | "Disputed";
  blockchainHash: string;
  milestones: Milestone[];
  aiRiskAnalysisReport?: string;
}

export interface Notification {
  id: string;
  assetId: string;
  title: string;
  message: string;
  type: "critical" | "warning" | "info";
  timestamp: Date;
  read: boolean;
}

export interface Transfer {
  id: string;
  sourceId: string;
  targetId: string;
  item: string;
  quantity: number;
  unit: string;
  status: "SHIPPING" | "RECEIVED";
  departureTime: string;
  eta: string;
  coordinates: Coordinates;
}

export interface AssessmentFilter {
  category: AssetCategory | "All";
  subType?: string;
  startDate: string;
  endDate: string;
  minYear: number;
  minCapacity: number;
  region?: string;
}

export interface AssessmentDoc {
  id: string;
  createdBy: string;
  createdAt: string;
  title: string;
  status: "Konsep" | "Tersimpan";
  filters: AssessmentFilter;
  candidates: Asset[];
}

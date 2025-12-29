
import { Asset, Zone, QuotationRequest, SparePart, Shorebase, Vendor, Tender, MaintenanceRecord } from './types';

// Dynamic Date Helper
const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;
const today = new Date().toISOString().split('T')[0];

export const vendors: Vendor[] = [
  {
    id: 'v-001',
    name: 'PT. Samudra Merah Putih',
    type: 'Jasa Pengeboran Terintegrasi',
    status: 'Verified',
    civdExpiry: `${nextYear}-05-20`,
    csmsScore: 95,
    performanceRating: 4.9,
    projectsCompleted: 24,
    riskLevel: 'Low',
    contactEmail: 'bids@samudrahmerah.co.id'
  },
  {
    id: 'v-002',
    name: 'Global Offshore Indonesia',
    type: 'Logistik Kelautan (Marine)',
    status: 'Verified',
    civdExpiry: `${currentYear}-12-15`,
    csmsScore: 88,
    performanceRating: 4.5,
    projectsCompleted: 12,
    riskLevel: 'Low',
    contactEmail: 'ops@globaloffshore.id'
  },
  {
    id: 'v-003',
    name: 'Deepsea Drilling Intl',
    type: 'Pengeboran Lepas Pantai',
    status: 'Verified',
    civdExpiry: `${currentYear}-08-01`,
    csmsScore: 75,
    performanceRating: 3.8,
    projectsCompleted: 8,
    riskLevel: 'Medium',
    contactEmail: 'tender@deepseadrill.com'
  }
];

export const shorebases: Shorebase[] = [
  {
    id: 'sb1',
    name: 'Pangkalan Matak (Anambas)',
    location: 'Kepulauan Anambas',
    coordinates: { lat: 3.5400, lng: 106.2600 },
    capabilities: ['Fuel Bunkering', 'Open Yard', 'Helipad', 'Waste Management'],
    currentStock: [
      { item: 'Minyak Solar (MGO)', qty: 500000, unit: 'Liter' },
      { item: 'Pipa Bor 5 inch', qty: 450, unit: 'Joint' },
      { item: 'Barite (Lumpur)', qty: 2000, unit: 'Sak' }
    ]
  },
  {
    id: 'sb2',
    name: 'Lamongan Shorebase',
    location: 'Jawa Timur',
    coordinates: { lat: -6.8900, lng: 112.3000 },
    capabilities: ['Heavy Lift Crane', 'Warehouse'],
    currentStock: [
      { item: 'Pipa Tubular', qty: 5000, unit: 'MT' },
      { item: 'Unit Semen (Cementing)', qty: 4, unit: 'Unit' }
    ]
  },
  {
    id: 'sb3',
    name: 'Hub Logistik Sorong',
    location: 'Papua Barat',
    coordinates: { lat: -0.8700, lng: 131.2500 },
    capabilities: ['Deep Water Jetty', 'Drilling Mud Plant'],
    currentStock: [
      { item: 'Lumpur Cair (Liquid Mud)', qty: 12000, unit: 'BBL' },
      { item: 'Base Oil', qty: 2500, unit: 'BBL' }
    ]
  }
];

export const zones: Zone[] = [
  {
    id: 'z1',
    name: 'Zona Terbatas Natuna',
    coordinates: { lat: 4.8000, lng: 108.0000 },
    radius: 120000, 
    color: '#ef4444', 
    type: 'danger'
  },
  {
    id: 'z2',
    name: 'Wilayah Operasi Masela',
    coordinates: { lat: -8.5000, lng: 130.5000 },
    radius: 150000,
    color: '#3b82f6',
    type: 'safe'
  }
];

// Maintenance Logs
const commonLog: MaintenanceRecord[] = [
  { id: 'm1', title: 'Sertifikasi Tahunan', date: `${currentYear}-01-15`, type: 'Inspection', description: 'Survei Tahunan Kelas BKI Selesai.' },
];

export const assets: Asset[] = [
  { 
    id: 'ast-001', 
    number: `${currentYear}/OS/001/NJ01`, 
    name: 'Nusantara Jack-up 01', 
    category: 'Offshore Rig', 
    location: 'Laut Natuna Blok B', 
    coordinates: { lat: 4.1234, lng: 108.2000 }, 
    history: [{ lat: 4.1200, lng: 108.1900 }, { lat: 4.1234, lng: 108.2000 }], 
    dailyRate: 150000000, 
    status: 'Active', 
    health: 92, 
    expiryDate: `${nextYear}-11-20`, 
    crewCount: 110,
    certification: 'ABS Class & SKPP Migas', 
    yearBuilt: 2015, 
    capacity: '3000 HP / 350ft Depth', 
    manufacturer: 'Keppel FELS',
    flagCountry: 'Indonesia',
    ownerType: 'National',
    ownerVendorId: 'v-001',
    co2Emissions: 85.0, 
    totalEmissions: 24500, 
    sustainabilityScore: 88, 
    csmsScore: 98, 
    incidentCount: 0, 
    daysSinceIncident: 890, 
    nextMaintenanceDate: `${currentYear}-12-05`, 
    mtbf: 2400,
    variableDeckLoad: 6500,
    maintenanceLog: commonLog,
    inventory: [
      { id: 'sp-1', name: 'Pipa Bor 5 inch', sku: 'DP-005', category: 'Pengeboran', quantity: 200, minLevel: 50, unit: 'Joint', location: 'Pipe Deck', lastUpdated: today },
      { id: 'sp-2', name: 'Filter Diesel (Utama)', sku: 'ENG-FLT-204', category: 'Mesin', quantity: 15, minLevel: 8, unit: 'Pcs', location: 'Ruang Mesin', lastUpdated: today }
    ]
  },
  { 
    id: 'ast-002', 
    number: `${currentYear}/VS/005/MA05`, 
    name: 'Merpati AHTS-05', 
    category: 'Kapal', 
    location: 'Blok Masela (Lapangan Abadi)', 
    coordinates: { lat: -8.5000, lng: 130.5000 }, 
    history: [], 
    dailyRate: 45000000, 
    status: 'Maintenance', 
    health: 38, // < 40% Triggers Automation
    expiryDate: `${currentYear}-10-30`, 
    crewCount: 18,
    certification: 'BKI Class', 
    yearBuilt: 2018, 
    capacity: '80 Ton BP / 6000 BHP', 
    manufacturer: 'Damen',
    flagCountry: 'Indonesia',
    ownerType: 'Foreign',
    ownerVendorId: 'v-002',
    co2Emissions: 22.0, 
    totalEmissions: 1200, 
    sustainabilityScore: 65, 
    csmsScore: 72, 
    incidentCount: 1, 
    daysSinceIncident: 45, 
    nextMaintenanceDate: today, 
    mtbf: 800,
    maintenanceLog: [
      { id: 'wo-prev', title: 'Overheat Mesin Utama', date: today, type: 'Repair', description: 'Kegagalan sistem pendingin terdeteksi.' }
    ],
    inventory: [
      { id: 'sp-3', name: 'Oli Sintetik (55 Gal)', sku: 'LUB-OIL-55G', category: 'Lubricants', quantity: 2, minLevel: 5, unit: 'Drum', location: 'Store', lastUpdated: today }
    ]
  },
  { 
    id: 'ast-003', 
    number: `${currentYear}/VS/009/PS09`, 
    name: 'Pacific Supply 09', 
    category: 'Kapal', 
    location: 'Shorebase Sorong', 
    coordinates: { lat: -0.8700, lng: 131.2500 }, 
    history: [], 
    dailyRate: 35000000, 
    status: 'Inactive', 
    health: 85, 
    expiryDate: `${nextYear}-01-10`, 
    crewCount: 0,
    certification: 'DNV GL', 
    yearBuilt: 2012, 
    capacity: '4500 DWT PSV', 
    manufacturer: 'Vard',
    flagCountry: 'Panama',
    ownerType: 'Foreign',
    ownerVendorId: 'v-003',
    co2Emissions: 0, 
    totalEmissions: 5000, 
    sustainabilityScore: 50, 
    csmsScore: 90, 
    incidentCount: 0, 
    daysSinceIncident: 1200, 
    nextMaintenanceDate: `${nextYear}-03-01`, 
    mtbf: 3200,
    maintenanceLog: [],
    inventory: []
  }
];

export const requestsData: QuotationRequest[] = [
  { 
    id: 'REQ-2024-009', 
    date: today, 
    assetName: 'Nusantara Jack-up 01', 
    category: 'Offshore Rig', 
    status: 'Approved', 
    hps: 'IDR 45.000.000.000', 
    tenderId: 'TDR-2024-009',
    kkksName: 'Pertamina Hulu Energi',
    contactName: 'Budi Santoso',
    dateFrom: `${nextYear}-01-01`,
    dateTo: `${nextYear}-12-31`
  }
];

// Initial Tenders with Sealed Bids
export const tenders: Tender[] = [
  {
    id: 'TDR-2024-009',
    name: 'Penyediaan 1 Unit Rig Jack-up untuk Eksplorasi',
    description: 'Pengadaan Rig Jack-up Spesifikasi Tinggi untuk pengeboran eksplorasi Laut Natuna. Kedalaman Air 350 kaki (Water Depth) diperlukan sesuai standar PTK-007.',
    createdDate: today,
    bidOpeningDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0], // 7 Days from now
    status: 'Published',
    items: ['REQ-2024-009'],
    totalValue: 150000000000, // 150 Billion IDR Est
    bids: [
      { vendorName: 'PT. Samudra Merah Putih', bidAmount: 45000000000, submittedDate: today, status: 'Submitted', complianceScore: 98 },
      { vendorName: 'Global Offshore Indonesia', bidAmount: 43500000000, submittedDate: today, status: 'Submitted', complianceScore: 92 },
      { vendorName: 'Deepsea Drilling Intl', bidAmount: 41000000000, submittedDate: today, status: 'Submitted', complianceScore: 85 }
    ]
  }
];

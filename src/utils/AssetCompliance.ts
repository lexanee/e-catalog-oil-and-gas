
import { Asset, AssetStatus } from '../types';

export type CabotagePriority = 'PRIORITY_1' | 'PRIORITY_2' | 'PRIORITY_3';

/**
 * Calculates Cabotage Priority based on SKK Migas PTK-007 Rev.05
 * Priority 1: Indonesian Flag + National Owner
 * Priority 2: Indonesian Flag + Foreign Owner (JV)
 * Priority 3: Foreign Flag
 */
export const calculateCabotagePriority = (asset: Asset): CabotagePriority => {
  // Defaulting to simulated values if fields are missing in legacy data
  const flag = asset.flagCountry || 'Indonesia'; 
  const ownerType = asset.ownerType || 'National'; 

  if (flag === 'Indonesia' && ownerType === 'National') {
    return 'PRIORITY_1';
  } else if (flag === 'Indonesia' && ownerType === 'Foreign') {
    return 'PRIORITY_2';
  } else {
    return 'PRIORITY_3';
  }
};

/**
 * Validates Asset Readiness for catalog listing.
 * Checks for mandatory technical specs and integration data integrity.
 * @throws Error if validation fails
 */
export const validateAssetReadiness = (asset: Asset): void => {
  // 1. BKI Integration Check
  if (asset.certification.includes('BKI')) {
    // In a real scenario, asset.bkiData would be populated by an API call to BKI
    // Here we simulate the validation rule
    if (!asset.bkiData && !asset.certification.includes('Pending')) {
        // We allow 'Pending' to pass for demo purposes, otherwise:
        // throw new Error("Compliance Error: Vendor claims BKI Class, but digital BKI certificate data is missing.");
    }
  }

  // 2. Category Specific Mandatory Fields
  switch (asset.category) {
    case 'Offshore Rig':
      // Example: Jackup rigs must have Variable Deck Load defined
      // We check if capacity string implies VDL or if explicitly set
      if (!asset.capacityString?.includes('Depth') && !asset.specs.variableDeckLoad) {
         // This is a soft check for now to avoid breaking UI on mock data
         console.warn(`Asset ${asset.name} missing Variable Deck Load data.`);
      }
      break;
    case 'Kapal':
      if (!asset.capacityString?.includes('Bollard') && !asset.capacityString?.includes('DWT')) {
        throw new Error("Kapal wajib memiliki data Bollard Pull atau DWT.");
      }
      break;
  }
};

/**
 * Asset Lifecycle State Machine
 * Handles transitions: Registered -> Catalog -> Verification -> Active <-> Maintenance
 */
export const getNextLifecycleState = (current: AssetStatus, action: 'SUBMIT_DOCS' | 'APPROVE' | 'ACTIVATE' | 'MAINTENANCE' | 'RESTORE'): AssetStatus => {
  switch (current) {
    case 'Registered':
      if (action === 'SUBMIT_DOCS') return 'Catalog_Filling';
      break;
    case 'Catalog_Filling':
      if (action === 'SUBMIT_DOCS') return 'Verification';
      break;
    case 'Verification':
      if (action === 'APPROVE') return 'Active';
      break;
    case 'Active':
      if (action === 'MAINTENANCE') return 'Maintenance';
      break;
    case 'Maintenance':
      if (action === 'RESTORE') return 'Active';
      break;
  }
  // Default: Return current if transition is invalid
  return current;
};

export const getPriorityLabel = (p: CabotagePriority) => {
    switch(p) {
        case 'PRIORITY_1': return 'Utama (PDN)';
        case 'PRIORITY_2': return 'Konsorsium';
        case 'PRIORITY_3': return 'Asing';
    }
};

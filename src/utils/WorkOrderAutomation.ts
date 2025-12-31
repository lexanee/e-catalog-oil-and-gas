
import { Asset, MaintenanceRecord, SparePart } from '../types';

// Configuration for critical parts mapping
const CRITICAL_PARTS_MAP: Record<string, string> = {
  'Onshore Rig': 'Hydraulic Valve Set',
  'Offshore Rig': 'Diesel Filter (Main)',
  'Kapal': 'Synthetic Oil (55 Gal)'
};

export const checkAndGenerateWorkOrder = (
  asset: Asset,
  updateAsset: (id: string, updates: Partial<Asset>) => void,
  addNotification: (assetId: string, title: string, message: string, type: 'critical' | 'warning' | 'info') => void
) => {
  // 1. Threshold Check
  if (asset.health >= 40) return;

  // 2. Debounce/State Check
  const hasActiveWO = asset.maintenanceLog?.some(log => 
    log.date === new Date().toISOString().split('T')[0] && 
    log.title.includes('AUTO-WO')
  );
  
  if (hasActiveWO || asset.status === 'Inactive') return;

  // 3. Inventory Logic
  const requiredPartName = CRITICAL_PARTS_MAP[asset.category] || 'General Kit';
  const inventory = [...(asset.inventory || [])];
  const partIndex = inventory.findIndex(p => p.name === requiredPartName);
  
  let procurementNote = '';
  let woPriority: 'High' | 'Critical' = 'High';

  if (partIndex >= 0) {
    const part = inventory[partIndex];
    if (part.quantity > 0) {
      inventory[partIndex] = {
        ...part,
        quantity: part.quantity - 1,
        lastUpdated: new Date().toISOString()
      };
      procurementNote = `Part RESERVED: ${part.name} (1 unit)`;
      addNotification(asset.id, 'Inventory Reserved', `${part.name} automatically allocated.`, 'info');
    } else {
      procurementNote = `STOCKOUT: ${part.name}. Procurement Request Triggered.`;
      woPriority = 'Critical';
      addNotification(asset.id, 'Low Stock Alert', `Critical part ${part.name} unavailable.`, 'critical');
    }
  }

  // 4. Create Ticket
  const newTicket: MaintenanceRecord = {
    id: `WO-${Date.now().toString().slice(-6)}`,
    title: `AUTO-WO: Health Critical (${asset.health}%)`,
    date: new Date().toISOString().split('T')[0],
    type: 'Repair',
    description: `System Auto-Generation. Priority: ${woPriority}. ${procurementNote}`,
    status: 'Open',
    priority: woPriority
  };

  const newLog = [newTicket, ...(asset.maintenanceLog || [])];

  // 5. Commit Transaction
  updateAsset(asset.id, {
    status: 'Inactive', 
    maintenanceLog: newLog,
    inventory: inventory,
    nextMaintenanceDate: new Date().toISOString().split('T')[0]
  });

  addNotification(asset.id, 'Maintenance Ticket Created', `WO #${newTicket.id} created due to health drop (<40%).`, 'warning');
};

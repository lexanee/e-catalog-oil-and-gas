
import { useState, useCallback } from 'react';
import { useAssets } from '../context/AssetContext';
import { useLogistics } from '../context/LogisticsContext';
import { Shorebase, Asset, Transfer, SparePart } from '../types';

export const useMaterialTransfer = () => {
  const { assets, updateAsset } = useAssets();
  const { shorebases, createTransfer, updateTransferStatus, transfers } = useLogistics();
  
  // Constants
  const VESSEL_SPEED_KNOTS = 10; 
  const KNOTS_TO_KMH = 1.852;
  const SPEED_KMH = VESSEL_SPEED_KNOTS * KNOTS_TO_KMH;

  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calculateETA = (sourceId: string, targetId: string): { distanceKm: number, hours: number, etaDate: Date } | null => {
    const source = shorebases.find(s => s.id === sourceId);
    const target = assets.find(a => a.id === targetId);

    if (!source || !target) return null;

    const distance = calculateDistanceKm(
        source.coordinates.lat, source.coordinates.lng,
        target.coordinates.lat, target.coordinates.lng
    );

    const hours = distance / SPEED_KMH;
    const etaDate = new Date();
    etaDate.setHours(etaDate.getHours() + hours);

    return { distanceKm: distance, hours, etaDate };
  };

  const initiateTransfer = (sourceId: string, targetId: string, item: string, quantity: number, unit: string) => {
     const calc = calculateETA(sourceId, targetId);
     const source = shorebases.find(s => s.id === sourceId);

     if (!calc || !source) throw new Error("Invalid logistics route");

     const newTransfer: Transfer = {
        id: `TRF-${Date.now()}`,
        sourceId,
        targetId,
        item,
        quantity,
        unit,
        status: 'SHIPPING',
        departureTime: new Date().toISOString(),
        eta: calc.etaDate.toISOString(),
        coordinates: { ...source.coordinates } // Start at source
     };

     createTransfer(newTransfer);
     return newTransfer;
  };

  const receiveTransfer = useCallback((id: string) => {
      // 1. Update Logistics Status
      updateTransferStatus(id, 'RECEIVED');

      // 2. Update Asset Inventory
      const transfer = transfers.find(t => t.id === id);
      if (!transfer) return;

      const asset = assets.find(a => a.id === transfer.targetId);
      if (!asset) return;

      const currentInventory = asset.inventory || [];
      const existingItemIndex = currentInventory.findIndex(i => i.name === transfer.item);

      let newInventory = [...currentInventory];

      if (existingItemIndex >= 0) {
         // Update existing
         newInventory[existingItemIndex] = {
            ...newInventory[existingItemIndex],
            quantity: newInventory[existingItemIndex].quantity + transfer.quantity,
            lastUpdated: new Date().toISOString()
         };
      } else {
         // Add new
         const newItem: SparePart = {
            id: `SP-${Date.now()}`,
            name: transfer.item,
            quantity: transfer.quantity,
            unit: transfer.unit,
            category: 'Logistics',
            sku: `IMP-${Math.floor(Math.random()*1000)}`,
            minLevel: 5,
            location: 'Receiving Area',
            lastUpdated: new Date().toISOString()
         };
         newInventory.push(newItem);
      }

      updateAsset(asset.id, { inventory: newInventory });

  }, [updateTransferStatus, transfers, assets, updateAsset]);

  return {
     calculateETA,
     initiateTransfer,
     completeTransfer: receiveTransfer
  };
};

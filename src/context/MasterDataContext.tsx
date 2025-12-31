import React, { createContext, useContext, useState, ReactNode } from "react";
import { AssetCategory, TechnicalParameter } from "../types";

type ParameterConfig = Record<AssetCategory, TechnicalParameter[]>;

interface MasterDataContextType {
  configurations: ParameterConfig;
  updateConfiguration: (
    category: AssetCategory,
    params: TechnicalParameter[]
  ) => void;
  availableLibrary: TechnicalParameter[];
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(
  undefined
);

// Initial Configuration - Aligned with Reference "Teknis (Katalog)"
const INITIAL_CONFIG: ParameterConfig = {
  Kapal: [
    {
      id: "p1",
      label: "Tahun Pembuatan",
      field: "yearBuilt",
      type: "number",
      group: "Identitas",
    },
    {
      id: "p2",
      label: "Bollard Pull",
      field: "bollardPull",
      type: "number",
      unit: "Ton",
      group: "Capacities",
    },
    {
      id: "p3",
      label: "Main Engine Power",
      field: "bhp",
      type: "number",
      unit: "BHP",
      group: "Engines",
    },
    {
      id: "p4",
      label: "Deadweight (DWT)",
      field: "dwt",
      type: "number",
      unit: "Ton",
      group: "Capacities",
    },
    {
      id: "p5",
      label: "Klasifikasi (BKI/Asing)",
      field: "certification",
      type: "string",
      group: "Certificates",
    },
    {
      id: "p_nav",
      label: "Sistem Navigasi",
      field: "navigation",
      type: "string",
      group: "Navigation",
    },
    {
      id: "p_fifi",
      label: "Fire Fighting Class",
      field: "fifiClass",
      type: "string",
      group: "Fire Fighting",
    },
  ],
  "Offshore Rig": [
    {
      id: "p6",
      label: "Tahun Pembuatan",
      field: "yearBuilt",
      type: "number",
      group: "Umum",
    },
    {
      id: "p7",
      label: "Drawworks Power",
      field: "ratedHP",
      type: "number",
      unit: "HP",
      group: "Hoisting Equipment",
    },
    {
      id: "p8",
      label: "Max Drilling Depth",
      field: "drillingDepth",
      type: "number",
      unit: "ft",
      group: "Main Specification",
    },
    {
      id: "p9",
      label: "Max Water Depth",
      field: "waterDepth",
      type: "number",
      unit: "ft",
      group: "Main Specification",
    },
    {
      id: "p_mud",
      label: "Mud Pump Capacity",
      field: "mudPumpHP",
      type: "number",
      unit: "HP",
      group: "Mud System",
    },
    {
      id: "p_bop",
      label: "BOP Pressure Rating",
      field: "bopPressure",
      type: "number",
      unit: "psi",
      group: "Well Control",
    },
  ],
  "Onshore Rig": [
    {
      id: "p10",
      label: "Tahun Pembuatan",
      field: "yearBuilt",
      type: "number",
      group: "Umum",
    },
    {
      id: "p11",
      label: "Drawworks Power",
      field: "ratedHP",
      type: "number",
      unit: "HP",
      group: "Hoisting Equipment",
    },
    {
      id: "p12",
      label: "Max Drilling Depth",
      field: "drillingDepth",
      type: "number",
      unit: "ft",
      group: "Main Specification",
    },
    {
      id: "p_bop_land",
      label: "BOP Pressure",
      field: "bopPressure",
      type: "number",
      unit: "psi",
      group: "Well Control",
    },
  ],
};

// Expanded Library based on SKK Migas Reference
const AVAILABLE_LIBRARY: TechnicalParameter[] = [
  // Common
  {
    id: "lib1",
    label: "Tahun Pembuatan",
    field: "yearBuilt",
    type: "number",
    group: "Umum",
  },
  {
    id: "lib_flag",
    label: "Bendera (Flag)",
    field: "flagCountry",
    type: "string",
    group: "Umum",
  },

  // Vessel Specific (Reference: Capacities, Engines, Fire Fighting, Nav)
  {
    id: "lib2",
    label: "Bollard Pull",
    field: "bollardPull",
    type: "number",
    unit: "Ton",
    group: "Capacities",
  },
  {
    id: "lib3",
    label: "Brake Horse Power",
    field: "bhp",
    type: "number",
    unit: "HP",
    group: "Engines",
  },
  {
    id: "lib4",
    label: "Deadweight (DWT)",
    field: "dwt",
    type: "number",
    unit: "Ton",
    group: "Capacities",
  },
  {
    id: "lib5",
    label: "Clear Deck Area",
    field: "deckArea",
    type: "number",
    unit: "m2",
    group: "Capacities",
  },
  {
    id: "lib6",
    label: "Max Speed",
    field: "maxSpeed",
    type: "number",
    unit: "Knots",
    group: "Performance",
  },
  {
    id: "lib_fifi",
    label: "Fire Fighting Class",
    field: "fifiClass",
    type: "string",
    group: "Fire Fighting",
  },
  {
    id: "lib_dp",
    label: "Dynamic Positioning",
    field: "dpClass",
    type: "string",
    group: "Navigation",
  },
  {
    id: "lib_nav_radar",
    label: "Radar System",
    field: "radarSystem",
    type: "string",
    group: "Navigation",
  },

  // Rig Specific (Reference: Hoisting, Mud, Well Control)
  {
    id: "lib8",
    label: "Drawworks Power",
    field: "ratedHP",
    type: "number",
    unit: "HP",
    group: "Hoisting Equipment",
  },
  {
    id: "lib9",
    label: "Drilling Depth",
    field: "drillingDepth",
    type: "number",
    unit: "ft",
    group: "Main Specification",
  },
  {
    id: "lib10",
    label: "Water Depth",
    field: "waterDepth",
    type: "number",
    unit: "ft",
    group: "Main Specification",
  },
  {
    id: "lib11",
    label: "Quarters Capacity",
    field: "quartersCapacity",
    type: "number",
    unit: "Pax",
    group: "Accommodation",
  },
  {
    id: "lib12",
    label: "Variable Deck Load",
    field: "variableDeckLoad",
    type: "number",
    unit: "Kips",
    group: "Main Specification",
  },
  {
    id: "lib13",
    label: "Cantilever Skid",
    field: "cantileverSkid",
    type: "number",
    unit: "ft",
    group: "Main Specification",
  },
  {
    id: "lib14",
    label: "Length Overall (LOA)",
    field: "loa",
    type: "number",
    unit: "m",
    group: "Dimensions",
  },
  {
    id: "lib_mud_cnt",
    label: "Mud Pump Count",
    field: "mudPumpCount",
    type: "number",
    unit: "Unit",
    group: "Mud System",
  },
  {
    id: "lib_mud_hp",
    label: "Mud Pump Power",
    field: "mudPumpHP",
    type: "number",
    unit: "HP",
    group: "Mud System",
  },
  {
    id: "lib_top_drive",
    label: "Top Drive Torque",
    field: "topDriveTorque",
    type: "number",
    unit: "ft-lbs",
    group: "Hoisting Equipment",
  },
  {
    id: "lib_bop",
    label: "BOP Pressure Rating",
    field: "bopPressure",
    type: "number",
    unit: "psi",
    group: "Well Control",
  },
  {
    id: "lib_bop_type",
    label: "BOP Type",
    field: "bopType",
    type: "string",
    group: "Well Control",
  },
];

export const MasterDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [configurations, setConfigurations] =
    useState<ParameterConfig>(INITIAL_CONFIG);

  const updateConfiguration = (
    category: AssetCategory,
    params: TechnicalParameter[]
  ) => {
    setConfigurations((prev) => ({
      ...prev,
      [category]: params,
    }));
  };

  return (
    <MasterDataContext.Provider
      value={{
        configurations,
        updateConfiguration,
        availableLibrary: AVAILABLE_LIBRARY,
      }}
    >
      {children}
    </MasterDataContext.Provider>
  );
};

export const useMasterData = () => {
  const context = useContext(MasterDataContext);
  if (!context)
    throw new Error("useMasterData must be used within a MasterDataProvider");
  return context;
};

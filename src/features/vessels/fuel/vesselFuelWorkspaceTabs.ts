export const VESSEL_FUEL_WORKSPACE_TABS = [
  { key: "overview", label: "Overview" },
] as const;

export type VesselFuelWorkspaceTab =
  (typeof VESSEL_FUEL_WORKSPACE_TABS)[number]["key"];

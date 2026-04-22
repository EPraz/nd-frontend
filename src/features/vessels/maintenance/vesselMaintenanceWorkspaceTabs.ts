export const VESSEL_MAINTENANCE_WORKSPACE_TABS = [
  { key: "overview", label: "Overview" },
] as const;

export type VesselMaintenanceWorkspaceTab =
  (typeof VESSEL_MAINTENANCE_WORKSPACE_TABS)[number]["key"];

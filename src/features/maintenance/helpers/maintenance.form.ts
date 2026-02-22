import type { AssetDto } from "@/src/contracts/assets.contract";
import { MaintenancePriority, MaintenanceStatus } from "../contracts";

export type MaintenanceFormValues = {
  // vessel
  assetId: string | null; // id final a persistir
  selectedVessel: AssetDto | null; // solo para UI select

  // fields
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD (UI)

  status: MaintenanceStatus; // opcional en create, editable en edit
  priority: MaintenancePriority; // opcional en create, editable en edit
};

export function emptyMaintenanceFormValues(): MaintenanceFormValues {
  return {
    assetId: null,
    selectedVessel: null,
    title: "",
    description: "",
    dueDate: "",
    status: "OPEN",
    priority: "MEDIUM",
  };
}

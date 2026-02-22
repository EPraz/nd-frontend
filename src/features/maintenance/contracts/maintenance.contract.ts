import { AssetDto } from "@/src/contracts/assets.contract";

export type MaintenanceStatus = "OPEN" | "IN_PROGRESS" | "DONE";
export type MaintenancePriority = "LOW" | "MEDIUM" | "HIGH";

export type MaintenanceDto = {
  id: string;
  assetId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  createdAt: string;
  asset: AssetDto;
};

export type CreateMaintenanceInput = {
  title: string;
  description?: string;
  dueDate?: string;
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
};

export type UpdateMaintenanceInput = {
  title: string;
  description: string | null;
  dueDate: string | null;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  // assetId?: string; // solo si en el futuro permites mover
};

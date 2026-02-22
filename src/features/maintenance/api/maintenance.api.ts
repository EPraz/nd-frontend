import { apiClient } from "@/src/api/client";
import {
  CreateMaintenanceInput,
  MaintenanceDto,
  UpdateMaintenanceInput,
} from "../contracts";

export async function fetchMaintenance(
  projectId: string,
  assetId: string,
): Promise<MaintenanceDto[]> {
  return apiClient.get<MaintenanceDto[]>(
    `/projects/${projectId}/assets/${assetId}/maintenance`,
  );
}

export async function createMaintenance(
  projectId: string,
  assetId: string,
  input: CreateMaintenanceInput,
): Promise<MaintenanceDto> {
  return apiClient.post<MaintenanceDto>(
    `/projects/${projectId}/assets/${assetId}/maintenance`,
    input,
  );
}

export async function fetchMaintenanceByProject(
  projectId: string,
): Promise<MaintenanceDto[]> {
  return apiClient.get<MaintenanceDto[]>(`/projects/${projectId}/maintenance`);
}

export async function fetchMaintenanceById(
  projectId: string,
  assetId: string,
  maintenanceId: string,
): Promise<MaintenanceDto> {
  return apiClient.get<MaintenanceDto>(
    `/projects/${projectId}/assets/${assetId}/maintenance/${maintenanceId}`,
  );
}

export async function updateMaintenance(
  projectId: string,
  assetId: string,
  maintenanceId: string,
  input: UpdateMaintenanceInput,
): Promise<MaintenanceDto> {
  return apiClient.patch<MaintenanceDto>(
    `/projects/${projectId}/assets/${assetId}/maintenance/${maintenanceId}`,
    input,
  );
}

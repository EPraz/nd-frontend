import { apiClient } from "@/src/api/client";
import type { PaginationRequest } from "@/src/contracts/pagination.contract";
import { buildPaginationQuery } from "@/src/contracts/pagination.contract";
import {
  CreateMaintenanceInput,
  MaintenanceDto,
  MaintenancePageDto,
  UpdateMaintenanceInput,
} from "../contracts";

type MaintenanceTableQuery = PaginationRequest & {
  sort?: string;
  search?: string;
  status?: string;
  priority?: string;
  assetId?: string;
  dateWindow?: string;
  dateFrom?: string;
  dateTo?: string;
};

export async function fetchMaintenance(
  projectId: string,
  assetId: string,
): Promise<MaintenanceDto[]> {
  return apiClient.get<MaintenanceDto[]>(
    `/projects/${projectId}/assets/${assetId}/maintenance`,
  );
}

export async function fetchMaintenancePage(
  projectId: string,
  assetId: string,
  params: MaintenanceTableQuery,
): Promise<MaintenancePageDto> {
  return apiClient.get<MaintenancePageDto>(
    `/projects/${projectId}/assets/${assetId}/maintenance${buildPaginationQuery(params)}`,
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

export async function fetchMaintenancePageByProject(
  projectId: string,
  params: MaintenanceTableQuery,
): Promise<MaintenancePageDto> {
  return apiClient.get<MaintenancePageDto>(
    `/projects/${projectId}/maintenance${buildPaginationQuery(params)}`,
  );
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

import { apiClient } from "@/src/api/client";
import type { PaginationRequest } from "@/src/contracts/pagination.contract";
import { buildPaginationQuery } from "@/src/contracts/pagination.contract";
import { CreateFuelInput, FuelDto, FuelPageDto, UpdateFuelInput } from "../contracts";

type FuelTableQuery = PaginationRequest & {
  sort?: string;
  search?: string;
  eventType?: string;
  fuelType?: string;
  assetId?: string;
  dateWindow?: string;
  dateFrom?: string;
  dateTo?: string;
  hasCriticalGap?: string;
};

export async function fetchFuelLog(
  projectId: string,
  assetId: string,
): Promise<FuelDto[]> {
  return apiClient.get<FuelDto[]>(
    `/projects/${projectId}/assets/${assetId}/fuel`,
  );
}

export async function fetchFuelLogPage(
  projectId: string,
  assetId: string,
  params: FuelTableQuery,
): Promise<FuelPageDto> {
  return apiClient.get<FuelPageDto>(
    `/projects/${projectId}/assets/${assetId}/fuel${buildPaginationQuery(params)}`,
  );
}

export async function createFuelLog(
  projectId: string,
  assetId: string,
  input: CreateFuelInput,
): Promise<FuelDto> {
  return apiClient.post<FuelDto>(
    `/projects/${projectId}/assets/${assetId}/fuel`,
    input,
  );
}

export async function fetchFuelByProject(
  projectId: string,
): Promise<FuelDto[]> {
  return apiClient.get<FuelDto[]>(`/projects/${projectId}/fuel`);
}

export async function fetchFuelPageByProject(
  projectId: string,
  params: FuelTableQuery,
): Promise<FuelPageDto> {
  return apiClient.get<FuelPageDto>(
    `/projects/${projectId}/fuel${buildPaginationQuery(params)}`,
  );
}

export async function fetchFuelById(
  projectId: string,
  assetId: string,
  fuelId: string,
): Promise<FuelDto> {
  return apiClient.get<FuelDto>(
    `/projects/${projectId}/assets/${assetId}/fuel/${fuelId}`,
  );
}

export async function updateFuel(
  projectId: string,
  assetId: string,
  fuelId: string,
  input: UpdateFuelInput,
): Promise<FuelDto> {
  return apiClient.patch<FuelDto>(
    `/projects/${projectId}/assets/${assetId}/fuel/${fuelId}`,
    input,
  );
}

import { apiClient } from "@/src/api/client";
import { CreateFuelInput, FuelDto, UpdateFuelInput } from "../contracts";

export async function fetchFuelLog(
  projectId: string,
  assetId: string,
): Promise<FuelDto[]> {
  return apiClient.get<FuelDto[]>(
    `/projects/${projectId}/assets/${assetId}/fuel`,
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

import type {
  AssetDto,
  AssetType,
  CreateAssetInput,
} from "@/src/contracts/assets.contract";
import { apiClient } from "./client";

export async function fetchAssets(
  projectId: string,
  type?: AssetType,
): Promise<AssetDto[]> {
  const q = type ? `?type=${encodeURIComponent(type)}` : "";
  return apiClient.get<AssetDto[]>(`/projects/${projectId}/assets${q}`);
}

export async function fetchAssetById(
  projectId: string,
  assetId: string,
): Promise<AssetDto> {
  return apiClient.get<AssetDto>(`/projects/${projectId}/assets/${assetId}`);
}

export async function createAsset(
  projectId: string,
  input: CreateAssetInput,
): Promise<AssetDto> {
  return apiClient.post<AssetDto>(`/projects/${projectId}/assets`, input);
}

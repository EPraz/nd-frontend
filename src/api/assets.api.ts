import type {
  AssetDto,
  AssetType,
  CreateAssetInput,
} from "@/src/contracts/assets.contract";
import type { UploadFileInput } from "@/src/contracts/uploads.contract";
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

export async function deleteAsset(
  projectId: string,
  assetId: string,
): Promise<AssetDto> {
  return apiClient.delete<AssetDto>(`/projects/${projectId}/assets/${assetId}`);
}

function appendUploadFile(formData: FormData, file: UploadFileInput) {
  const normalizedType = file.mimeType || "application/octet-stream";

  if (file.file) {
    formData.append("file", file.file as Blob, file.name);
    return;
  }

  formData.append("file", {
    uri: file.uri,
    name: file.name,
    type: normalizedType,
  } as never);
}

export async function uploadAssetImage(
  projectId: string,
  assetId: string,
  file: UploadFileInput,
): Promise<AssetDto> {
  const formData = new FormData();
  appendUploadFile(formData, file);

  return apiClient.post<AssetDto>(
    `/projects/${projectId}/assets/${assetId}/image`,
    formData,
  );
}

export async function deleteAssetImage(
  projectId: string,
  assetId: string,
): Promise<AssetDto> {
  return apiClient.delete<AssetDto>(
    `/projects/${projectId}/assets/${assetId}/image`,
  );
}

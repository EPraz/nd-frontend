import type {
  AssetDto,
  AssetType,
  CreateAssetInput,
} from "@/src/contracts/assets.contract";
import type { UploadFileInput } from "@/src/contracts/uploads.contract";
import { getBaseUrl } from "./baseUrl";
import { apiClient } from "./client";

function toAbsoluteAssetImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : `${getBaseUrl()}${url}`;
}

function normalizeAsset(asset: AssetDto): AssetDto {
  return {
    ...asset,
    imageUrl: toAbsoluteAssetImageUrl(asset.imageUrl),
  };
}

export function normalizeUploadBlob(
  blob: Blob,
  fileName: string,
  mimeType: string,
): Blob {
  if (blob.type === mimeType) {
    return blob;
  }

  if (typeof File !== "undefined") {
    return new File([blob], fileName, { type: mimeType });
  }

  if (typeof blob.slice === "function") {
    return blob.slice(0, blob.size, mimeType);
  }

  return blob;
}

export async function fetchAssets(
  projectId: string,
  type?: AssetType,
): Promise<AssetDto[]> {
  const q = type ? `?type=${encodeURIComponent(type)}` : "";
  const assets = await apiClient.get<AssetDto[]>(`/projects/${projectId}/assets${q}`);
  return assets.map(normalizeAsset);
}

export async function fetchAssetById(
  projectId: string,
  assetId: string,
): Promise<AssetDto> {
  return normalizeAsset(
    await apiClient.get<AssetDto>(`/projects/${projectId}/assets/${assetId}`),
  );
}

export async function createAsset(
  projectId: string,
  input: CreateAssetInput,
): Promise<AssetDto> {
  return normalizeAsset(
    await apiClient.post<AssetDto>(`/projects/${projectId}/assets`, input),
  );
}

export async function deleteAsset(
  projectId: string,
  assetId: string,
): Promise<AssetDto> {
  return normalizeAsset(
    await apiClient.delete<AssetDto>(`/projects/${projectId}/assets/${assetId}`),
  );
}

function appendUploadFile(formData: FormData, file: UploadFileInput) {
  const normalizedType = file.mimeType || "application/octet-stream";

  if (file.file) {
    formData.append(
      "file",
      normalizeUploadBlob(file.file as Blob, file.name, normalizedType),
      file.name,
    );
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

  return normalizeAsset(
    await apiClient.post<AssetDto>(
      `/projects/${projectId}/assets/${assetId}/image`,
      formData,
    ),
  );
}

export async function deleteAssetImage(
  projectId: string,
  assetId: string,
): Promise<AssetDto> {
  return normalizeAsset(
    await apiClient.delete<AssetDto>(
      `/projects/${projectId}/assets/${assetId}/image`,
    ),
  );
}

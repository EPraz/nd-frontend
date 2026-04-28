import { apiClient } from "../../../../api/client";
import type { UploadFileInput } from "@/src/contracts/uploads.contract";
import { getBaseUrl } from "@/src/api/baseUrl";
import { buildPaginationQuery } from "@/src/contracts/pagination.contract";
import {
  CreateCrewInput,
  CrewDto,
  type CrewPageDto,
  type CrewSortOption,
} from "../contracts";
import type { PaginationRequest } from "@/src/contracts/pagination.contract";

function toAbsoluteCrewMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : `${getBaseUrl()}${url}`;
}

function normalizeCrew(crew: CrewDto): CrewDto {
  return {
    ...crew,
    photoUrl: toAbsoluteCrewMediaUrl(crew.photoUrl),
    asset: crew.asset
      ? {
          ...crew.asset,
          imageUrl: toAbsoluteCrewMediaUrl(crew.asset.imageUrl),
        }
      : null,
  };
}

export async function fetchCrew(
  projectId: string,
  assetId: string,
): Promise<CrewDto[]> {
  const crew = await apiClient.get<CrewDto[]>(
    `/projects/${projectId}/assets/${assetId}/crew`,
  );
  return crew.map(normalizeCrew);
}

export async function fetchCrewPage(
  projectId: string,
  assetId: string,
  params: PaginationRequest & CrewListQueryParams,
): Promise<CrewPageDto> {
  const page = await apiClient.get<CrewPageDto>(
    `/projects/${projectId}/assets/${assetId}/crew${buildCrewPageQuery(params)}`,
  );

  return normalizeCrewPage(page);
}

export async function fetchCrewById(
  projectId: string,
  assetId: string,
  crewId: string,
): Promise<CrewDto> {
  return normalizeCrew(
    await apiClient.get<CrewDto>(
      `/projects/${projectId}/assets/${assetId}/crew/${crewId}`,
    ),
  );
}

export async function createCrew(
  projectId: string,
  input: CreateCrewInput,
): Promise<CrewDto> {
  return normalizeCrew(
    await apiClient.post<CrewDto>(`/projects/${projectId}/crew`, input),
  );
}

export async function fetchCrewByProject(
  projectId: string,
): Promise<CrewDto[]> {
  const crew = await apiClient.get<CrewDto[]>(`/projects/${projectId}/crew`);
  return crew.map(normalizeCrew);
}

export async function fetchCrewPageByProject(
  projectId: string,
  params: PaginationRequest & CrewListQueryParams,
): Promise<CrewPageDto> {
  const page = await apiClient.get<CrewPageDto>(
    `/projects/${projectId}/crew${buildCrewPageQuery(params)}`,
  );

  return normalizeCrewPage(page);
}

export async function updateCrew(
  projectId: string,
  assetId: string,
  crewId: string,
  input: Partial<CreateCrewInput>,
): Promise<CrewDto> {
  return normalizeCrew(
    await apiClient.patch<CrewDto>(
      `/projects/${projectId}/assets/${assetId}/crew/${crewId}`,
      input,
    ),
  );
}

export async function deleteCrew(
  projectId: string,
  assetId: string,
  crewId: string,
): Promise<CrewDto> {
  return normalizeCrew(
    await apiClient.delete<CrewDto>(
      `/projects/${projectId}/assets/${assetId}/crew/${crewId}`,
    ),
  );
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

export async function uploadCrewPhoto(
  projectId: string,
  assetId: string,
  crewId: string,
  file: UploadFileInput,
): Promise<CrewDto> {
  const formData = new FormData();
  appendUploadFile(formData, file);

  return normalizeCrew(
    await apiClient.post<CrewDto>(
      `/projects/${projectId}/assets/${assetId}/crew/${crewId}/photo`,
      formData,
    ),
  );
}

export async function deleteCrewPhoto(
  projectId: string,
  assetId: string,
  crewId: string,
): Promise<CrewDto> {
  return normalizeCrew(
    await apiClient.delete<CrewDto>(
      `/projects/${projectId}/assets/${assetId}/crew/${crewId}/photo`,
    ),
  );
}

function normalizeCrewPage(page: CrewPageDto): CrewPageDto {
  return {
    ...page,
    items: page.items.map(normalizeCrew),
  };
}

type CrewListQueryParams = {
  sort?: CrewSortOption;
  search?: string;
  status?: string;
  assetId?: string;
  department?: string;
  medicalState?: string;
  dateWindow?: string;
  dateFrom?: string;
  dateTo?: string;
};

function buildCrewPageQuery(params: PaginationRequest & CrewListQueryParams) {
  return buildPaginationQuery(params);
}

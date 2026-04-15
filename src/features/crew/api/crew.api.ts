import { apiClient } from "../../../api/client";
import type { UploadFileInput } from "@/src/contracts/uploads.contract";
import { CreateCrewInput, CrewDto } from "../contracts";

export async function fetchCrew(
  projectId: string,
  assetId: string,
): Promise<CrewDto[]> {
  return apiClient.get<CrewDto[]>(
    `/projects/${projectId}/assets/${assetId}/crew`,
  );
}

export async function fetchCrewById(
  projectId: string,
  assetId: string,
  crewId: string,
): Promise<CrewDto> {
  return apiClient.get<CrewDto>(
    `/projects/${projectId}/assets/${assetId}/crew/${crewId}`,
  );
}

export async function createCrew(
  projectId: string,
  input: CreateCrewInput,
): Promise<CrewDto> {
  return apiClient.post<CrewDto>(`/projects/${projectId}/crew`, input);
}

export async function fetchCrewByProject(
  projectId: string,
): Promise<CrewDto[]> {
  return apiClient.get<CrewDto[]>(`/projects/${projectId}/crew`);
}

export async function updateCrew(
  projectId: string,
  assetId: string,
  crewId: string,
  input: Partial<CreateCrewInput>,
): Promise<CrewDto> {
  return apiClient.patch<CrewDto>(
    `/projects/${projectId}/assets/${assetId}/crew/${crewId}`,
    input,
  );
}

export async function deleteCrew(
  projectId: string,
  assetId: string,
  crewId: string,
): Promise<CrewDto> {
  return apiClient.delete<CrewDto>(
    `/projects/${projectId}/assets/${assetId}/crew/${crewId}`,
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

  return apiClient.post<CrewDto>(
    `/projects/${projectId}/assets/${assetId}/crew/${crewId}/photo`,
    formData,
  );
}

export async function deleteCrewPhoto(
  projectId: string,
  assetId: string,
  crewId: string,
): Promise<CrewDto> {
  return apiClient.delete<CrewDto>(
    `/projects/${projectId}/assets/${assetId}/crew/${crewId}/photo`,
  );
}

import { apiClient } from "../../../api/client";
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

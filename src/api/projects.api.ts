import type { ProjectDto } from "@/src/contracts/projects.contract";
import type {
  ProjectModuleEntitlementsDto,
  UpdateProjectModuleEntitlementsDto,
} from "@/src/contracts/project-entitlements.contract";
import { apiClient } from "./client";

export async function fetchProjects(): Promise<ProjectDto[]> {
  return apiClient.get<ProjectDto[]>("/projects");
}

export async function fetchProjectById(projectId: string): Promise<ProjectDto> {
  return apiClient.get<ProjectDto>(`/projects/${projectId}`);
}

export async function fetchProjectModuleEntitlements(
  projectId: string,
): Promise<ProjectModuleEntitlementsDto> {
  return apiClient.get<ProjectModuleEntitlementsDto>(
    `/projects/${projectId}/module-entitlements`,
  );
}

export async function updateProjectModuleEntitlements(
  projectId: string,
  dto: UpdateProjectModuleEntitlementsDto,
): Promise<ProjectModuleEntitlementsDto> {
  return apiClient.patch<ProjectModuleEntitlementsDto>(
    `/projects/${projectId}/module-entitlements`,
    dto,
  );
}

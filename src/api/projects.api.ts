import type { ProjectDto } from "@/src/contracts/projects.contract";
import { apiClient } from "./client";

export async function fetchProjects(): Promise<ProjectDto[]> {
  return apiClient.get<ProjectDto[]>("/projects");
}

export async function fetchProjectById(projectId: string): Promise<ProjectDto> {
  return apiClient.get<ProjectDto>(`/projects/${projectId}`);
}

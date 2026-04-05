import type {
  AdminProjectDto,
  AdminUserDto,
  CreateAdminUserDto,
  CreateProjectDto,
  UpdateProjectUserAccessDto,
} from "@/src/contracts/admin.contract";
import { apiClient } from "./client";

export async function fetchAdminProjects(): Promise<AdminProjectDto[]> {
  return apiClient.get<AdminProjectDto[]>("/admin/projects");
}

export async function createAdminProject(
  dto: CreateProjectDto,
): Promise<AdminProjectDto> {
  return apiClient.post<AdminProjectDto>("/admin/projects", dto);
}

export async function fetchAdminUsers(): Promise<AdminUserDto[]> {
  return apiClient.get<AdminUserDto[]>("/admin/users");
}

export async function createAdminUser(
  dto: CreateAdminUserDto,
): Promise<AdminUserDto> {
  return apiClient.post<AdminUserDto>("/admin/users", dto);
}

export async function updateProjectUserAccess(
  projectId: string,
  dto: UpdateProjectUserAccessDto,
): Promise<AdminProjectDto> {
  return apiClient.patch<AdminProjectDto>(`/admin/projects/${projectId}/users`, dto);
}

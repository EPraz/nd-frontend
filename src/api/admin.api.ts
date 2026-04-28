import type {
  AdminProjectDto,
  AdminProjectPageDto,
  AdminUserDto,
  AdminUserPageDto,
  CreateAdminUserDto,
  CreateProjectDto,
  UpdateProjectUserAccessDto,
} from "@/src/contracts/admin.contract";
import type { PaginationRequest } from "@/src/contracts/pagination.contract";
import { buildPaginationQuery } from "@/src/contracts/pagination.contract";
import { apiClient } from "./client";

type AdminProjectPageQuery = PaginationRequest & {
  sort?: string;
  search?: string;
  status?: string;
  kind?: string;
  assignedUserId?: string;
};

type AdminUserPageQuery = PaginationRequest & {
  sort?: string;
  search?: string;
  role?: string;
  projectId?: string;
  accessState?: string;
};

export async function fetchAdminProjects(): Promise<AdminProjectDto[]> {
  return apiClient.get<AdminProjectDto[]>("/admin/projects");
}

export async function fetchAdminProjectPage(
  params: AdminProjectPageQuery,
): Promise<AdminProjectPageDto> {
  return apiClient.get<AdminProjectPageDto>(
    `/admin/projects${buildPaginationQuery(params)}`,
  );
}

export async function createAdminProject(
  dto: CreateProjectDto,
): Promise<AdminProjectDto> {
  return apiClient.post<AdminProjectDto>("/admin/projects", dto);
}

export async function fetchAdminUsers(): Promise<AdminUserDto[]> {
  return apiClient.get<AdminUserDto[]>("/admin/users");
}

export async function fetchAdminUserPage(
  params: AdminUserPageQuery,
): Promise<AdminUserPageDto> {
  return apiClient.get<AdminUserPageDto>(
    `/admin/users${buildPaginationQuery(params)}`,
  );
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

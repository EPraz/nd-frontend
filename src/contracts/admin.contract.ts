import { ProjectKind, ProjectStatus } from "./projects.contract";
import type { PaginatedResponseDto } from "./pagination.contract";

export type UserRole = "ADMIN" | "OPS" | "VIEWER";

export type AdminProjectAssignedUserDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AdminProjectDto = {
  id: string;
  name: string;
  status: ProjectStatus;
  kind: ProjectKind;
  createdAt: string;
  assignedUsers: AdminProjectAssignedUserDto[];
};

export type AdminProjectListStatsDto = {
  total: number;
  active: number;
  archived: number;
  assigned: number;
  unassigned: number;
};

export type AdminProjectPageDto = PaginatedResponseDto<AdminProjectDto> & {
  stats: AdminProjectListStatsDto;
};

export type CreateProjectDto = {
  name: string;
  kind?: ProjectKind;
};

export type AdminUserDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  assignedProjectIds: string[];
};

export type AdminUserListStatsDto = {
  total: number;
  admins: number;
  ops: number;
  viewers: number;
  assigned: number;
  unassigned: number;
};

export type AdminUserPageDto = PaginatedResponseDto<AdminUserDto> & {
  stats: AdminUserListStatsDto;
};

export type CreateAdminUserDto = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  projectIds?: string[];
};

export type UpdateProjectUserAccessDto = {
  userIds: string[];
};

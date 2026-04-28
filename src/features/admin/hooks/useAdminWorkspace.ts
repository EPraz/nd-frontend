import {
  createAdminProject,
  createAdminUser,
  fetchAdminProjectPage,
  fetchAdminProjects,
  fetchAdminUserPage,
  fetchAdminUsers,
  updateProjectUserAccess,
} from "@/src/api/admin.api";
import { updateProjectModuleEntitlements } from "@/src/api/projects.api";
import type { PaginationRequest } from "@/src/contracts/pagination.contract";
import type {
  AdminProjectDto,
  AdminProjectListStatsDto,
  AdminProjectPageDto,
  AdminUserDto,
  AdminUserListStatsDto,
  AdminUserPageDto,
  CreateAdminUserDto,
  CreateProjectDto,
} from "@/src/contracts/admin.contract";
import type { UpdateProjectModuleEntitlementsDto } from "@/src/contracts/project-entitlements.contract";
import { useCallback, useEffect, useState } from "react";

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

type AdminProjectPageOptions = PaginationRequest & {
  sort?: string;
  search?: string;
  status?: string;
  kind?: string;
  assignedUserId?: string;
};

type AdminUserPageOptions = PaginationRequest & {
  sort?: string;
  search?: string;
  role?: string;
  projectId?: string;
  accessState?: string;
};

export function useAdminWorkspace(enabled = true) {
  const [projects, setProjects] = useState<AdminProjectDto[]>([]);
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingProject, setSavingProject] = useState(false);
  const [savingProjectModules, setSavingProjectModules] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [savingAccess, setSavingAccess] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      setError(null);
      setProjects([]);
      setUsers([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [projectData, userData] = await Promise.all([
        fetchAdminProjects(),
        fetchAdminUsers(),
      ]);
      setProjects(projectData);
      setUsers(userData);
    } catch (error) {
      setError(toMessage(error));
      setProjects([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createProject = useCallback(async (dto: CreateProjectDto) => {
    setSavingProject(true);
    try {
      const created = await createAdminProject(dto);
      setProjects((current) => [created, ...current]);
      return created;
    } finally {
      setSavingProject(false);
    }
  }, []);

  const saveProjectModules = useCallback(
    async (projectId: string, dto: UpdateProjectModuleEntitlementsDto) => {
      setSavingProjectModules(true);
      try {
        return await updateProjectModuleEntitlements(projectId, dto);
      } finally {
        setSavingProjectModules(false);
      }
    },
    [],
  );

  const createUser = useCallback(async (dto: CreateAdminUserDto) => {
    setSavingUser(true);
    try {
      const created = await createAdminUser(dto);
      setUsers((current) => [created, ...current]);
      await refresh();
      return created;
    } finally {
      setSavingUser(false);
    }
  }, [refresh]);

  const saveProjectUsers = useCallback(async (projectId: string, userIds: string[]) => {
    setSavingAccess(projectId);
    try {
      const updatedProject = await updateProjectUserAccess(projectId, { userIds });
      setProjects((current) =>
        current.map((project) => (project.id === projectId ? updatedProject : project)),
      );
      await refresh();
      return updatedProject;
    } finally {
      setSavingAccess(null);
    }
  }, [refresh]);

  return {
    projects,
    users,
    loading,
    error,
    refresh,
    createProject,
    saveProjectModules,
    createUser,
    saveProjectUsers,
    savingProject,
    savingProjectModules,
    savingUser,
    savingAccess,
  };
}

export function useAdminProjectPage(enabled: boolean, options: AdminProjectPageOptions) {
  const [projects, setProjects] = useState<AdminProjectDto[]>([]);
  const [pagination, setPagination] = useState<AdminProjectPageDto["meta"] | null>(null);
  const [stats, setStats] = useState<AdminProjectListStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = options.page;
  const pageSize = options.pageSize;
  const sort = options.sort;
  const search = options.search;
  const status = options.status;
  const kind = options.kind;
  const assignedUserId = options.assignedUserId;

  const refresh = useCallback(async () => {
    if (!enabled) {
      setProjects([]);
      setPagination(null);
      setStats(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminProjectPage({
        page,
        pageSize,
        sort,
        search,
        status,
        kind,
        assignedUserId,
      });
      setProjects(data.items);
      setPagination(data.meta);
      setStats(data.stats);
    } catch (error) {
      setError(toMessage(error));
      setProjects([]);
      setPagination(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [enabled, page, pageSize, sort, search, status, kind, assignedUserId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { projects, pagination, stats, loading, error, refresh };
}

export function useAdminUserPage(enabled: boolean, options: AdminUserPageOptions) {
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [pagination, setPagination] = useState<AdminUserPageDto["meta"] | null>(null);
  const [stats, setStats] = useState<AdminUserListStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = options.page;
  const pageSize = options.pageSize;
  const sort = options.sort;
  const search = options.search;
  const role = options.role;
  const projectId = options.projectId;
  const accessState = options.accessState;

  const refresh = useCallback(async () => {
    if (!enabled) {
      setUsers([]);
      setPagination(null);
      setStats(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUserPage({
        page,
        pageSize,
        sort,
        search,
        role,
        projectId,
        accessState,
      });
      setUsers(data.items);
      setPagination(data.meta);
      setStats(data.stats);
    } catch (error) {
      setError(toMessage(error));
      setUsers([]);
      setPagination(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [enabled, page, pageSize, sort, search, role, projectId, accessState]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { users, pagination, stats, loading, error, refresh };
}

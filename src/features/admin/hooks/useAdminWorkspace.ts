import {
  createAdminProject,
  createAdminUser,
  fetchAdminProjects,
  fetchAdminUsers,
  updateProjectUserAccess,
} from "@/src/api/admin.api";
import { updateProjectModuleEntitlements } from "@/src/api/projects.api";
import type {
  AdminProjectDto,
  AdminUserDto,
  CreateAdminUserDto,
  CreateProjectDto,
} from "@/src/contracts/admin.contract";
import type { UpdateProjectModuleEntitlementsDto } from "@/src/contracts/project-entitlements.contract";
import { useCallback, useEffect, useState } from "react";

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

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

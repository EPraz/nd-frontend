import {
  fetchProjectModuleEntitlements,
  updateProjectModuleEntitlements,
} from "@/src/api/projects.api";
import type {
  ProjectModuleEntitlementsDto,
  UpdateProjectModuleEntitlementsDto,
} from "@/src/contracts/project-entitlements.contract";
import { useCallback, useEffect, useState } from "react";

export function useProjectModuleEntitlements(projectId: string) {
  const [data, setData] = useState<ProjectModuleEntitlementsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const next = await fetchProjectModuleEntitlements(projectId);
      setData(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const save = useCallback(
    async (dto: UpdateProjectModuleEntitlementsDto) => {
      if (!projectId) return null;
      setSaving(true);
      setError(null);
      try {
        const next = await updateProjectModuleEntitlements(projectId, dto);
        setData(next);
        return next;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [projectId],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, saving, error, refresh, save };
}

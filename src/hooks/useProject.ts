import { fetchProjectById } from "@/src/api/projects.api";
import type { ProjectDto } from "@/src/contracts/projects.contract";
import { useCallback, useEffect, useState } from "react";

export function useProject(projectId: string) {
  const [project, setProject] = useState<ProjectDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProjectById(projectId);
      setProject(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { project, loading, error, refresh };
}

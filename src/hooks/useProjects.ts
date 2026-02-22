import { fetchProjects } from "@/src/api/projects.api";
import type { ProjectDto } from "@/src/contracts/projects.contract";
import { useCallback, useEffect, useState } from "react";

type UseProjectsState = {
  projects: ProjectDto[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

function toMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return "Unknown error";
}

export function useProjects(): UseProjectsState {
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (e) {
      setError(toMessage(e));
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { projects, loading, error, refresh };
}

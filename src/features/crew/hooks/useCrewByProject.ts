import { useCallback, useEffect, useState } from "react";
import { fetchCrewByProject } from "../api/crew.api";
import { CrewDto } from "../contracts";

export function useCrewByProject(projectId: string) {
  const [crew, setCrew] = useState<CrewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCrewByProject(projectId);
      setCrew(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setCrew([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { crew, loading, error, refresh };
}

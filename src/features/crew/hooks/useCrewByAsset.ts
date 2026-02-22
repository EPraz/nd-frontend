import { useCallback, useEffect, useState } from "react";
import { fetchCrew } from "../api/crew.api";
import { CrewDto } from "../contracts";

export function useCrewByAsset(projectId: string, assetId: string) {
  const [crew, setCrew] = useState<CrewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCrew(projectId, assetId);
      setCrew(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setCrew([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, assetId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { crew, loading, error, refresh };
}

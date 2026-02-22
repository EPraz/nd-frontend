import { useCallback, useEffect, useState } from "react";
import { fetchCrewById } from "../api/crew.api";
import type { CrewDto } from "../contracts";

export function useCrewById(
  projectId: string,
  assetId: string,
  crewId: string,
) {
  const [crew, setCrew] = useState<CrewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId || !crewId) {
      setCrew(null);
      setLoading(false);
      setError("Missing route parameters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchCrewById(projectId, assetId, crewId);
      setCrew(data ?? null);
      if (!data) setError("Crew member not found.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setCrew(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, assetId, crewId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { crew, loading, error, refresh };
}

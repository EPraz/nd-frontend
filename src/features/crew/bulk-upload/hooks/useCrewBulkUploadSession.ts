import { useCallback, useEffect, useState } from "react";
import { fetchCrewBulkUploadSessionById } from "../api/crewBulkUpload.api";
import type { CrewBulkUploadSessionDto } from "../contracts/crewBulkUpload.contract";

export function useCrewBulkUploadSession(projectId: string, sessionId: string) {
  const [session, setSession] = useState<CrewBulkUploadSessionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCrewBulkUploadSessionById(projectId, sessionId);
      setSession(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, sessionId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { session, loading, error, refresh, setSession };
}

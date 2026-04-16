import { useCallback, useEffect, useState } from "react";
import { fetchCrewBulkUploadSessions } from "../api/crewBulkUpload.api";
import type { CrewBulkUploadSessionSummaryDto } from "../contracts/crewBulkUpload.contract";

export function useCrewBulkUploadSessions(projectId: string) {
  const [sessions, setSessions] = useState<CrewBulkUploadSessionSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCrewBulkUploadSessions(projectId);
      setSessions(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { sessions, loading, error, refresh };
}

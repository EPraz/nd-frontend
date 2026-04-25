import { fetchAssetAuditEvents } from "@/src/api/audit.api";
import { ApiError } from "@/src/api/client";
import type { AuditEventDto } from "@/src/contracts/audit.contract";
import { useCallback, useEffect, useState } from "react";

type UseAssetAuditEventsOptions = {
  limit?: number;
  enabled?: boolean;
};

export function useAssetAuditEvents(
  projectId: string,
  assetId: string,
  options: UseAssetAuditEventsOptions = {},
) {
  const { limit = 25, enabled = true } = options;
  const [events, setEvents] = useState<AuditEventDto[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId || !enabled) {
      setEvents([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchAssetAuditEvents(projectId, assetId, limit);
      setEvents(data);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setEvents([]);
        setError(null);
        return;
      }
      setError(e instanceof Error ? e.message : "Unknown error");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [assetId, enabled, limit, projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    events,
    loading,
    error,
    refresh,
  };
}

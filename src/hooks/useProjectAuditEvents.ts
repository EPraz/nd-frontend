import { fetchProjectAuditEvents } from "@/src/api/audit.api";
import type { AuditEventDto } from "@/src/contracts/audit.contract";
import { useCallback, useEffect, useState } from "react";

type UseProjectAuditEventsOptions = {
  limit?: number;
  enabled?: boolean;
};

export function useProjectAuditEvents(
  projectId: string,
  options: UseProjectAuditEventsOptions = {},
) {
  const { limit = 25, enabled = true } = options;
  const [events, setEvents] = useState<AuditEventDto[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !enabled) {
      setEvents([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchProjectAuditEvents(projectId, limit);
      setEvents(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, limit, projectId]);

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

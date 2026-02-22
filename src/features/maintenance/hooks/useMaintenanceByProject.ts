import { useCallback, useEffect, useState } from "react";
import { fetchMaintenanceByProject } from "../api/maintenance.api";
import { MaintenanceDto } from "../contracts";

export function useMaintenanceByProject(projectId: string) {
  const [maintenance, setMaintenance] = useState<MaintenanceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMaintenanceByProject(projectId);
      setMaintenance(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setMaintenance([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { maintenance, loading, error, refresh };
}

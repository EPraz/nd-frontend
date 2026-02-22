import { useCallback, useEffect, useState } from "react";
import { fetchMaintenance } from "../api/maintenance.api";
import { MaintenanceDto } from "../contracts";

export function useMaintenanceByAsset(projectId: string, assetId: string) {
  const [maintenance, setMaintenance] = useState<MaintenanceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId) return;
    setLoading(true);
    setError(null);
    try {
      setMaintenance(await fetchMaintenance(projectId, assetId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setMaintenance([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, assetId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { maintenance, loading, error, refresh };
}

import { useCallback, useEffect, useState } from "react";
import { fetchMaintenanceById } from "../api/maintenance.api";
import type { MaintenanceDto } from "../contracts";

export function useMaintenanceById(
  projectId: string,
  assetId: string,
  maintenanceId: string,
) {
  const [maintenance, setMaintenance] = useState<MaintenanceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId || !maintenanceId) {
      setMaintenance(null);
      setLoading(false);
      setError("Missing route parameters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchMaintenanceById(
        projectId,
        assetId,
        maintenanceId,
      );
      setMaintenance(data ?? null);
      if (!data) setError("Maintenance task not found.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setMaintenance(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, assetId, maintenanceId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { maintenance, loading, error, refresh };
}

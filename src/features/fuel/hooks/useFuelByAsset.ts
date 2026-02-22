import { useCallback, useEffect, useState } from "react";
import { fetchFuelLog } from "../api/fuel.api";
import { FuelDto } from "../contracts";

export function useFuelByAsset(projectId: string, assetId: string) {
  const [fuelLogs, setFuelLogs] = useState<FuelDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFuelLog(projectId, assetId);
      setFuelLogs(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setFuelLogs([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, assetId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { fuelLogs, loading, error, refresh };
}

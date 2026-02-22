import { useCallback, useEffect, useState } from "react";
import { fetchFuelByProject } from "../api/fuel.api";
import { FuelDto } from "../contracts";

export function useFuelByProject(projectId: string) {
  const [fuelLogs, setFuelLogs] = useState<FuelDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFuelByProject(projectId);
      setFuelLogs(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setFuelLogs([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { fuelLogs, loading, error, refresh };
}

import { useCallback, useEffect, useState } from "react";
import { fetchFuelById } from "../api/fuel.api";
import type { FuelDto } from "../contracts/fuel.contract";

export function useFuelById(
  projectId: string,
  assetId: string,
  fuelId: string,
) {
  const [fuel, setFuel] = useState<FuelDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId || !fuelId) {
      setFuel(null);
      setLoading(false);
      setError("Missing route parameters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchFuelById(projectId, assetId, fuelId);
      setFuel(data ?? null);
      if (!data) setError("Fuel log not found.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setFuel(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, assetId, fuelId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { fuel, loading, error, refresh };
}

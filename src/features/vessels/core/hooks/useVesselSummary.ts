import { useCallback, useEffect, useState } from "react";
import { fetchVesselSummary } from "../api/vessel-profile.api";
import { VesselSummaryDto } from "../contracts/vessel.contract";

export function useVesselSummary(projectId: string, assetId: string) {
  const [data, setData] = useState<VesselSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchVesselSummary(projectId, assetId);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, assetId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

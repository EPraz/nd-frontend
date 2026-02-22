import { fetchAssetById } from "@/src/api/assets.api";
import type { AssetDto } from "@/src/contracts/assets.contract";
import { useCallback, useEffect, useState } from "react";

export function useVessel(projectId: string, assetId: string) {
  const [vessel, setVessel] = useState<AssetDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAssetById(projectId, assetId);
      setVessel(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setVessel(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, assetId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { vessel, loading, error, refresh };
}

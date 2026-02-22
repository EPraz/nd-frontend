import { fetchAssets } from "@/src/api/assets.api";
import type { AssetDto } from "@/src/contracts/assets.contract";
import { useCallback, useEffect, useState } from "react";

export function useVessels(projectId: string) {
  const [vessels, setVessels] = useState<AssetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAssets(projectId, "VESSEL");
      setVessels(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setVessels([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { vessels, loading, error, refresh };
}

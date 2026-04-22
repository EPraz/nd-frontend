import { useCallback, useEffect, useState } from "react";
import { fetchVesselProfile } from "../api/vessel-profile.api";

export function useVesselProfile(projectId: string, assetId: string) {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVesselProfile(projectId, assetId);
      setProfile(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, assetId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, loading, error, refresh, setProfile };
}

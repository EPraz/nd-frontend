import { useCallback, useEffect, useState } from "react";
import { fetchCrewCertificatesByCrew } from "../api/crewCertificates.api";
import type { CrewCertificateDto } from "../contracts";

export function useCrewCertificatesByCrew(
  projectId: string,
  assetId: string,
  crewId: string,
) {
  const [certificates, setCertificates] = useState<CrewCertificateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId || !crewId) {
      setCertificates([]);
      setLoading(false);
      setError("Missing route parameters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchCrewCertificatesByCrew(projectId, assetId, crewId);
      setCertificates(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, assetId, crewId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { certificates, loading, error, refresh };
}

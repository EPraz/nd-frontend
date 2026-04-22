import { useCallback, useEffect, useState } from "react";
import { fetchCrewCertificateRequirementsByCrew } from "../api/crewCertificates.api";
import type { CrewCertificateRequirementDto } from "../contracts";

export function useCrewCertificateRequirementsByCrew(
  projectId: string,
  assetId: string,
  crewId: string,
) {
  const [requirements, setRequirements] = useState<CrewCertificateRequirementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId || !crewId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchCrewCertificateRequirementsByCrew(projectId, assetId, crewId);
      setRequirements(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, assetId, crewId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { requirements, loading, error, refresh };
}

import { useCallback, useEffect, useState } from "react";
import { fetchCrewCertificateRequirementsByProject } from "../api/crewCertificates.api";
import type { CrewCertificateRequirementDto } from "../contracts";

export function useCrewCertificateRequirementsByProject(projectId: string) {
  const [requirements, setRequirements] = useState<CrewCertificateRequirementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchCrewCertificateRequirementsByProject(projectId);
      setRequirements(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { requirements, loading, error, refresh };
}

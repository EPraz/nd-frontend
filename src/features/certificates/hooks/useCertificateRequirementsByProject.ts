import { fetchCertificateRequirementsByProject } from "@/src/features/certificates/api/certificates.api";
import { CertificateRequirementDto } from "@/src/features/certificates/contracts";
import { useCallback, useEffect, useState } from "react";

export function useCertificateRequirementsByProject(projectId: string) {
  const [requirements, setRequirements] = useState<CertificateRequirementDto[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCertificateRequirementsByProject(projectId);
      setRequirements(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { requirements, loading, error, refresh };
}

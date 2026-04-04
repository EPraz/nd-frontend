import { fetchCertificateRequirementsByAsset } from "@/src/features/certificates/api/certificates.api";
import { CertificateRequirementDto } from "@/src/features/certificates/contracts";
import { useCallback, useEffect, useState } from "react";

export function useCertificateRequirementsByAsset(
  projectId: string,
  assetId: string,
) {
  const [requirements, setRequirements] = useState<CertificateRequirementDto[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId) {
      setRequirements([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCertificateRequirementsByAsset(projectId, assetId);
      setRequirements(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, assetId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { requirements, loading, error, refresh };
}

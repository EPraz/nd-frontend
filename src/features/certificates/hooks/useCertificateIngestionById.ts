import { useCallback, useEffect, useState } from "react";
import { fetchCertificateIngestionById } from "../api/certificates.api";
import { CertificateIngestionDto } from "../contracts";

export function useCertificateIngestionById(
  projectId: string,
  assetId: string,
  ingestionId: string,
) {
  const [ingestion, setIngestion] = useState<CertificateIngestionDto | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId || !ingestionId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCertificateIngestionById(
        projectId,
        assetId,
        ingestionId,
      );
      setIngestion(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setIngestion(null);
    } finally {
      setLoading(false);
    }
  }, [assetId, ingestionId, projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ingestion, loading, error, refresh };
}

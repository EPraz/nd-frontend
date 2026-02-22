import { fetchCertificatesByAsset } from "@/src/features/certificates/api/certificates.api";
import { useCallback, useEffect, useState } from "react";
import { CertificateDto } from "../contracts/certificates.contract";

export function useCertificatesByAsset(projectId: string, assetId: string) {
  const [certificates, setCertificates] = useState<CertificateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCertificatesByAsset(projectId, assetId);
      setCertificates(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, assetId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { certificates, loading, error, refresh };
}

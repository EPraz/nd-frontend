import { fetchCertificatesById } from "@/src/features/certificates/api/certificates.api";
import { useCallback, useEffect, useState } from "react";
import type { CertificateDto } from "../contracts/certificates.contract";

export function useCertificatesById(
  projectId: string,
  assetId: string,
  certificateId: string,
) {
  const [certificate, setCertificate] = useState<CertificateDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId || !certificateId) {
      setCertificate(null);
      setLoading(false);
      setError("Missing route parameters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchCertificatesById(
        projectId,
        assetId,
        certificateId,
      );

      if (!data) {
        setCertificate(null);
        setError("Certificate not found.");
      } else {
        setCertificate(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setCertificate(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, assetId, certificateId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const isNotFoundState = !loading && !error && certificate === null;

  return { certificate, loading, error, refresh, isNotFoundState };
}

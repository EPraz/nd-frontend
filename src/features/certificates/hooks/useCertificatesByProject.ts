import { fetchCertificatesByProject } from "@/src/features/certificates/api/certificates.api";
import { CertificateDto } from "@/src/features/certificates/contracts/certificates.contract";
import { useCallback, useEffect, useState } from "react";

export function useCertificatesByProject(projectId: string) {
  const [certificates, setCertificates] = useState<CertificateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCertificatesByProject(projectId);
      setCertificates(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { certificates, loading, error, refresh };
}

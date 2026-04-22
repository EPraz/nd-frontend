import { fetchCertificateTypes } from "@/src/features/certificates/shared/api/certificates.api";
import { CertificateTypeDto } from "@/src/features/certificates/shared";
import { useCallback, useEffect, useState } from "react";

export function useCertificateTypes(projectId: string) {
  const [certificateTypes, setCertificateTypes] = useState<CertificateTypeDto[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchCertificateTypes(projectId);
      setCertificateTypes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setCertificateTypes([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { certificateTypes, loading, error, refresh };
}


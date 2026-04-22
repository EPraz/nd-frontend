import { useCallback, useEffect, useState } from "react";
import { fetchCrewCertificateById } from "../api/crewCertificates.api";
import type { CrewCertificateDto } from "../contracts";

export function useCrewCertificatesById(
  projectId: string,
  assetId: string,
  crewId: string,
  certificateId: string,
) {
  const [certificate, setCertificate] = useState<CrewCertificateDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId || !crewId || !certificateId) {
      setCertificate(null);
      setLoading(false);
      setError("Missing route parameters.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchCrewCertificateById(projectId, assetId, crewId, certificateId);
      if (!data || data.isDeleted) {
        setCertificate(null);
        setError("Crew certificate not found.");
      } else {
        setCertificate(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setCertificate(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, assetId, crewId, certificateId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { certificate, loading, error, refresh };
}

import { useCallback, useEffect, useState } from "react";
import { fetchCrewCertificateIngestionById } from "../api/crewCertificates.api";
import type { CrewCertificateIngestionDto } from "../contracts";

export function useCrewCertificateIngestionById(
  projectId: string,
  assetId: string,
  crewId: string,
  ingestionId: string,
) {
  const [ingestion, setIngestion] = useState<CrewCertificateIngestionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId || !crewId || !ingestionId) {
      setIngestion(null);
      setLoading(false);
      setError("Missing route parameters.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchCrewCertificateIngestionById(
        projectId,
        assetId,
        crewId,
        ingestionId,
      );
      setIngestion(data ?? null);
      if (!data) setError("Crew certificate ingestion not found.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setIngestion(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, assetId, crewId, ingestionId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ingestion, loading, error, refresh };
}

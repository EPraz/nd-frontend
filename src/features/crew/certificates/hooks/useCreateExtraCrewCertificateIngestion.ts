import { useState } from "react";
import { createExtraCrewCertificateIngestion } from "../api/crewCertificates.api";
import type { CreateCrewCertificateIngestionInput } from "../contracts";

export function useCreateExtraCrewCertificateIngestion(
  projectId: string,
  assetId: string,
  crewId: string,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(input: CreateCrewCertificateIngestionInput) {
    setLoading(true);
    setError(null);
    try {
      return await createExtraCrewCertificateIngestion(projectId, assetId, crewId, input);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, error };
}

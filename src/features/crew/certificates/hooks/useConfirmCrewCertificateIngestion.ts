import { useState } from "react";
import { confirmCrewCertificateIngestion } from "../api/crewCertificates.api";
import type { ConfirmCrewCertificateIngestionInput } from "../contracts";

export function useConfirmCrewCertificateIngestion(
  projectId: string,
  assetId: string,
  crewId: string,
  ingestionId: string,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(input: ConfirmCrewCertificateIngestionInput) {
    setLoading(true);
    setError(null);
    try {
      return await confirmCrewCertificateIngestion(
        projectId,
        assetId,
        crewId,
        ingestionId,
        input,
      );
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

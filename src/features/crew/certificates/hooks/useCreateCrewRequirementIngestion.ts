import { useState } from "react";
import { createCrewRequirementIngestion } from "../api/crewCertificates.api";
import type { CreateCrewCertificateIngestionInput } from "../contracts";

export function useCreateCrewRequirementIngestion(
  projectId: string,
  assetId: string,
  crewId: string,
  requirementId: string,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(input: CreateCrewCertificateIngestionInput) {
    setLoading(true);
    setError(null);
    try {
      return await createCrewRequirementIngestion(
        projectId,
        assetId,
        crewId,
        requirementId,
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

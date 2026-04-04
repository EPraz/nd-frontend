import { useState } from "react";
import { createRequirementIngestion } from "../api/certificates.api";
import { CertificateIngestionDto, CreateCertificateIngestionInput } from "../contracts";

export function useCreateRequirementIngestion(
  projectId: string,
  assetId: string,
  requirementId: string,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(
    input: CreateCertificateIngestionInput,
  ): Promise<CertificateIngestionDto> {
    setLoading(true);
    setError(null);
    try {
      return await createRequirementIngestion(
        projectId,
        assetId,
        requirementId,
        input,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, error };
}

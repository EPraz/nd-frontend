import { useState } from "react";
import { createExtraCertificateIngestion } from "../api/certificates.api";
import { CertificateIngestionDto, CreateCertificateIngestionInput } from "../contracts";

export function useCreateExtraCertificateIngestion(
  projectId: string,
  assetId: string,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(
    input: CreateCertificateIngestionInput,
  ): Promise<CertificateIngestionDto> {
    setLoading(true);
    setError(null);
    try {
      return await createExtraCertificateIngestion(projectId, assetId, input);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, error };
}

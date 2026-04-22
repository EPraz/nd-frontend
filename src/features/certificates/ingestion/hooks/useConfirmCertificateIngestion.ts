import { useState } from "react";
import { confirmCertificateIngestion } from "@/src/features/certificates/shared/api/certificates.api";
import {
  ConfirmCertificateIngestionInput,
  ConfirmCertificateIngestionResultDto,
} from "@/src/features/certificates/shared";

export function useConfirmCertificateIngestion(
  projectId: string,
  assetId: string,
  ingestionId: string,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(
    input: ConfirmCertificateIngestionInput,
  ): Promise<ConfirmCertificateIngestionResultDto> {
    setLoading(true);
    setError(null);
    try {
      return await confirmCertificateIngestion(
        projectId,
        assetId,
        ingestionId,
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


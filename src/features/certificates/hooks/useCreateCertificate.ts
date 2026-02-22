import { useState } from "react";
import { createCertificate } from "../api/certificates.api";
import {
  CertificateDto,
  CreateCertificateInput,
} from "../contracts/certificates.contract";

export function useCreateCertificate(projectId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(
    input: CreateCertificateInput,
  ): Promise<CertificateDto> {
    setLoading(true);
    setError(null);
    try {
      return await createCertificate(projectId, input);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, error };
}

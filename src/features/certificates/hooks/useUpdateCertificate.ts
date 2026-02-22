import { useCallback, useState } from "react";
import { updateCertificate } from "../api/certificates.api";
import type { UpdateCertificateInput } from "../contracts";

export function useUpdateCertificate(
  projectId: string,
  assetId: string,
  certificateId: string,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (input: UpdateCertificateInput) => {
      setLoading(true);
      setError(null);

      try {
        return await updateCertificate(
          projectId,
          assetId,
          certificateId,
          input,
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [projectId, assetId, certificateId],
  );

  return { submit, loading, error };
}

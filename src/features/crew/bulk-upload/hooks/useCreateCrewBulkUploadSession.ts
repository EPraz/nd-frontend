import { useState } from "react";
import { createCrewBulkUploadSession } from "../api/crewBulkUpload.api";
import type {
  CreateCrewBulkUploadSessionInput,
  CrewBulkUploadSessionDto,
} from "../contracts/crewBulkUpload.contract";

export function useCreateCrewBulkUploadSession(projectId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(
    input: CreateCrewBulkUploadSessionInput,
  ): Promise<CrewBulkUploadSessionDto> {
    setLoading(true);
    setError(null);
    try {
      return await createCrewBulkUploadSession(projectId, input);
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

import { useState } from "react";
import { deleteCrew } from "../api/crew.api";
import type { CrewDto } from "../contracts";

export function useDeleteCrew(
  projectId: string,
  assetId: string,
  crewId: string,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(): Promise<CrewDto> {
    setLoading(true);
    setError(null);

    try {
      return await deleteCrew(projectId, assetId, crewId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, error };
}

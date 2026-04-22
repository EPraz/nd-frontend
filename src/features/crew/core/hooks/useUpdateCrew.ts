import { useCallback, useState } from "react";
import { updateCrew } from "../api/crew.api";
import type { CreateCrewInput } from "../contracts";

export function useUpdateCrew(
  projectId: string,
  assetId: string,
  crewId: string,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (input: Partial<CreateCrewInput>) => {
      setLoading(true);
      setError(null);
      try {
        return await updateCrew(projectId, assetId, crewId, input);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [projectId, assetId, crewId],
  );

  return { submit, loading, error };
}

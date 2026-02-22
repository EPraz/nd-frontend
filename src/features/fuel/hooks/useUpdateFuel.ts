import { useCallback, useState } from "react";
import { updateFuel } from "../api/fuel.api";
import { UpdateFuelInput } from "../contracts";

export function useUpdateFuel(
  projectId: string,
  assetId: string,
  fuelId: string,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (input: UpdateFuelInput) => {
      setLoading(true);
      setError(null);

      try {
        return await updateFuel(projectId, assetId, fuelId, input);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [projectId, assetId, fuelId],
  );

  return { submit, loading, error };
}

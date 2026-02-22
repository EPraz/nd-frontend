import { useCallback, useState } from "react";
import { updateMaintenance } from "../api/maintenance.api";
import type { MaintenanceDto } from "../contracts";

export function useUpdateMaintenance(
  projectId: string,
  assetId: string,
  maintenanceId: string,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (input: Parameters<typeof updateMaintenance>[3]) => {
      if (!projectId || !assetId || !maintenanceId) {
        setError("Missing route parameters.");
        throw new Error("Missing route parameters.");
      }

      setLoading(true);
      setError(null);

      try {
        const updated = await updateMaintenance(
          projectId,
          assetId,
          maintenanceId,
          input,
        );
        return updated as MaintenanceDto;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [projectId, assetId, maintenanceId],
  );

  return { submit, loading, error };
}

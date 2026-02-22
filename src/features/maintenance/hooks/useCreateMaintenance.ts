import { useState } from "react";
import { createMaintenance } from "../api/maintenance.api";
import { CreateMaintenanceInput, MaintenanceDto } from "../contracts";

export function useCreateMaintenance(projectId: string, assetId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(
    input: CreateMaintenanceInput,
  ): Promise<MaintenanceDto> {
    setLoading(true);
    setError(null);
    try {
      return await createMaintenance(projectId, assetId, input);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, error };
}

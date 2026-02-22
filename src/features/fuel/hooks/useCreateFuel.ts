import { useState } from "react";
import { createFuelLog } from "../api/fuel.api";
import { CreateFuelInput, FuelDto } from "../contracts";

export function useCreateFuel(projectId: string, assetId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(input: CreateFuelInput): Promise<FuelDto> {
    setLoading(true);
    setError(null);
    try {
      return await createFuelLog(projectId, assetId, input);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, error };
}

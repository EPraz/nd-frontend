import { createAsset } from "@/src/api/assets.api";
import type {
  AssetDto,
  CreateAssetInput,
} from "@/src/contracts/assets.contract";
import { useState } from "react";

export function useCreateVessel(projectId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(input: CreateAssetInput): Promise<AssetDto> {
    setLoading(true);
    setError(null);
    try {
      return await createAsset(projectId, input);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, error };
}

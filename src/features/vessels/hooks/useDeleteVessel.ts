import { deleteAsset } from "@/src/api/assets.api";
import type { AssetDto } from "@/src/contracts/assets.contract";
import { useState } from "react";

export function useDeleteVessel(projectId: string, assetId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(): Promise<AssetDto> {
    setLoading(true);
    setError(null);

    try {
      return await deleteAsset(projectId, assetId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, error };
}

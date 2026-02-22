import { useState } from "react";
import { patchVesselProfile } from "../api/vessel-profile.api";
import { UpdateVesselProfileInput } from "../contracts/vessel.contract";

export function useUpdateVesselProfile(projectId: string, assetId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(input: UpdateVesselProfileInput) {
    setLoading(true);
    setError(null);
    try {
      return await patchVesselProfile(projectId, assetId, input);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, error };
}

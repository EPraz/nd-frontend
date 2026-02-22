import { useState } from "react";
import { createCrew } from "../api/crew.api";
import { CreateCrewInput, CrewDto } from "../contracts";

export function useCreateCrew(projectId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(input: CreateCrewInput): Promise<CrewDto> {
    setLoading(true);
    setError(null);
    try {
      return await createCrew(projectId, input);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, error };
}

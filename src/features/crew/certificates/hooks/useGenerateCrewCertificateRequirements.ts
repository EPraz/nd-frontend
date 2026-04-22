import { useState } from "react";
import {
  generateCrewCertificateRequirementsByCrew,
  generateCrewCertificateRequirementsByProject,
} from "../api/crewCertificates.api";

export function useGenerateCrewCertificateRequirements(
  projectId: string,
  assetId?: string,
  crewId?: string,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateProject() {
    setLoading(true);
    setError(null);
    try {
      return await generateCrewCertificateRequirementsByProject(projectId);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function generateCrew() {
    if (!assetId || !crewId) {
      throw new Error("Missing crew scope.");
    }

    setLoading(true);
    setError(null);
    try {
      return await generateCrewCertificateRequirementsByCrew(projectId, assetId, crewId);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { generateProject, generateCrew, loading, error };
}

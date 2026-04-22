import {
  generateCertificateRequirementsByAsset,
  generateCertificateRequirementsByProject,
} from "@/src/features/certificates/shared/api/certificates.api";
import { GenerateRequirementsResult } from "@/src/features/certificates/shared";
import { useState } from "react";

export function useGenerateCertificateRequirements(projectId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateProject(): Promise<GenerateRequirementsResult> {
    setLoading(true);
    setError(null);
    try {
      return await generateCertificateRequirementsByProject(projectId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function generateAsset(assetId: string): Promise<GenerateRequirementsResult> {
    setLoading(true);
    setError(null);
    try {
      return await generateCertificateRequirementsByAsset(projectId, assetId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { generateProject, generateAsset, loading, error };
}


import { useCallback, useEffect, useState } from "react";
import {
  fetchCrewComplianceSummaryByAsset,
  fetchCrewComplianceSummaryByProject,
} from "../api/crewCertificates.api";
import type { CrewComplianceSummaryDto } from "../contracts";

export function useCrewComplianceSummaryByProject(projectId: string) {
  const [summaries, setSummaries] = useState<CrewComplianceSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId) {
      setSummaries([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setSummaries(await fetchCrewComplianceSummaryByProject(projectId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setSummaries([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { summaries, loading, error, refresh };
}

export function useCrewComplianceSummaryByAsset(
  projectId: string,
  assetId: string,
) {
  const [summary, setSummary] = useState<CrewComplianceSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId) {
      setSummary(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setSummary(await fetchCrewComplianceSummaryByAsset(projectId, assetId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [assetId, projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { summary, loading, error, refresh };
}

import {
  getCrewCertificatesProjectSummaryItems,
  useCrewCertificateOverviewStatsByProject,
  useCrewCertificateRequirementsByProject,
  useCrewComplianceSummaryByAsset,
} from "@/src/features/crew/certificates";
import { useCallback, useMemo } from "react";

export function useCrewByAssetCertificatesWorkspace(
  projectId: string,
  assetId: string,
) {
  const requirementsQuery = useCrewCertificateRequirementsByProject(projectId);
  const msmcQuery = useCrewComplianceSummaryByAsset(projectId, assetId);

  const requirements = useMemo(
    () =>
      requirementsQuery.requirements.filter(
        (requirement) => requirement.assetId === assetId,
      ),
    [assetId, requirementsQuery.requirements],
  );

  const overviewQuery = useCrewCertificateOverviewStatsByProject(
    projectId,
    requirements,
  );

  const summaryItems = useMemo(
    () => getCrewCertificatesProjectSummaryItems(overviewQuery.stats),
    [overviewQuery.stats],
  );

  const refreshAll = useCallback(async () => {
    await Promise.all([requirementsQuery.refresh(), msmcQuery.refresh()]);
  }, [msmcQuery, requirementsQuery]);

  return {
    requirements,
    loading: requirementsQuery.loading,
    error: requirementsQuery.error,
    stats: overviewQuery.stats,
    statsLoading: overviewQuery.loading,
    statsError: overviewQuery.error,
    summaryItems,
    msmcSummary: msmcQuery.summary,
    msmcLoading: msmcQuery.loading,
    msmcError: msmcQuery.error,
    refreshMsmc: msmcQuery.refresh,
    refreshAll,
  };
}

export type CrewByAssetCertificatesWorkspaceState = ReturnType<
  typeof useCrewByAssetCertificatesWorkspace
>;

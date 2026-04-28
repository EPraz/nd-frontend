import {
  getCrewCertificatesProjectSummaryItems,
  useCrewCertificateOverviewStatsByProject,
  useCrewCertificateRequirementsByAsset,
  useCrewComplianceSummaryByAsset,
} from "@/src/features/crew/certificates";
import type { PaginationRequest } from "@/src/contracts/pagination.contract";
import { useCallback, useMemo } from "react";
import type { CrewCertificateSortOption } from "@/src/features/crew/certificates/components/crewCertificatesProject.constants";

type CrewByAssetCertificatesWorkspaceOptions = PaginationRequest & {
  sort?: CrewCertificateSortOption;
  search?: string;
  status?: string;
  crewState?: string;
};

export function useCrewByAssetCertificatesWorkspace(
  projectId: string,
  assetId: string,
  options?: CrewByAssetCertificatesWorkspaceOptions,
) {
  const requirementsQuery = useCrewCertificateRequirementsByAsset(
    projectId,
    assetId,
    options?.page !== undefined && options?.pageSize !== undefined
      ? {
          page: options.page,
          pageSize: options.pageSize,
          sort: options.sort,
          search: options.search,
          status: options.status,
          crewState: options.crewState,
        }
      : undefined,
  );
  const msmcQuery = useCrewComplianceSummaryByAsset(projectId, assetId);

  const overviewQuery = useCrewCertificateOverviewStatsByProject(
    projectId,
    requirementsQuery.requirements,
    requirementsQuery.stats,
  );

  const summaryItems = useMemo(
    () => getCrewCertificatesProjectSummaryItems(overviewQuery.stats),
    [overviewQuery.stats],
  );

  const refreshAll = useCallback(async () => {
    await Promise.all([requirementsQuery.refresh(), msmcQuery.refresh()]);
  }, [msmcQuery, requirementsQuery]);

  return {
    requirements: requirementsQuery.requirements,
    pagination: requirementsQuery.pagination,
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

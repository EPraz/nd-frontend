import { useCallback } from "react";
import { useCrewCertificateOverviewStatsByProject } from "./useCrewCertificateOverviewStatsByProject";
import { useCrewCertificateRequirementsByProject } from "./useCrewCertificateRequirementsByProject";
import { useCrewComplianceSummaryByProject } from "./useCrewComplianceSummary";
import { useGenerateCrewCertificateRequirements } from "./useGenerateCrewCertificateRequirements";
import type { CrewCertificateSortOption } from "../components/crewCertificatesProject.constants";

type CrewCertificatesProjectWorkspaceOptions = {
  page?: number;
  pageSize?: number;
  sort?: CrewCertificateSortOption;
  search?: string;
  status?: string;
  assetId?: string;
  crewState?: string;
};

export function useCrewCertificatesProjectWorkspace(
  projectId: string,
  options?: CrewCertificatesProjectWorkspaceOptions,
) {
  const requirementsQuery = useCrewCertificateRequirementsByProject(
    projectId,
    options?.page !== undefined && options?.pageSize !== undefined
      ? {
          page: options.page,
          pageSize: options.pageSize,
          sort: options.sort,
          search: options.search,
          status: options.status,
          assetId: options.assetId,
          crewState: options.crewState,
        }
      : undefined,
  );
  const overviewQuery = useCrewCertificateOverviewStatsByProject(
    projectId,
    requirementsQuery.requirements,
    requirementsQuery.stats,
  );
  const msmcQuery = useCrewComplianceSummaryByProject(projectId);
  const generationQuery = useGenerateCrewCertificateRequirements(projectId);

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
    msmcSummaries: msmcQuery.summaries,
    msmcLoading: msmcQuery.loading,
    msmcError: msmcQuery.error,
    refreshMsmc: msmcQuery.refresh,
    generateProject: generationQuery.generateProject,
    generating: generationQuery.loading,
    generationError: generationQuery.error,
    refreshAll,
  };
}

export type CrewCertificatesProjectWorkspaceState = ReturnType<
  typeof useCrewCertificatesProjectWorkspace
>;

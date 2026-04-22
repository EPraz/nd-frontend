import { useCallback } from "react";
import { useCrewCertificateOverviewStatsByProject } from "./useCrewCertificateOverviewStatsByProject";
import { useCrewCertificateRequirementsByProject } from "./useCrewCertificateRequirementsByProject";
import { useCrewComplianceSummaryByProject } from "./useCrewComplianceSummary";
import { useGenerateCrewCertificateRequirements } from "./useGenerateCrewCertificateRequirements";

export function useCrewCertificatesProjectWorkspace(projectId: string) {
  const requirementsQuery = useCrewCertificateRequirementsByProject(projectId);
  const overviewQuery = useCrewCertificateOverviewStatsByProject(
    projectId,
    requirementsQuery.requirements,
  );
  const msmcQuery = useCrewComplianceSummaryByProject(projectId);
  const generationQuery = useGenerateCrewCertificateRequirements(projectId);

  const refreshAll = useCallback(async () => {
    await Promise.all([requirementsQuery.refresh(), msmcQuery.refresh()]);
  }, [msmcQuery, requirementsQuery]);

  return {
    requirements: requirementsQuery.requirements,
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

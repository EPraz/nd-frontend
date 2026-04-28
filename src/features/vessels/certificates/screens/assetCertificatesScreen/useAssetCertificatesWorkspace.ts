import { useCertificatesByAsset } from "@/src/features/certificates/core";
import {
  useCertificateRequirementsByAsset,
  useGenerateCertificateRequirements,
} from "@/src/features/certificates/requirements";
import type { PaginationRequest } from "@/src/contracts/pagination.contract";
import { useCallback, useMemo } from "react";
import {
  getAssetCertificatesSummaryItems,
  getAssetCertificatesWorkspaceStats,
} from "./assetCertificatesWorkspace.helpers";

type AssetCertificatesWorkspaceOptions = {
  requirements?: PaginationRequest & {
    sort?: string;
    search?: string;
    status?: string;
    category?: string;
  };
  records?: PaginationRequest & {
    sort?: string;
    search?: string;
    status?: string;
    workflowStatus?: string;
    category?: string;
    dateWindow?: string;
    dateFrom?: string;
    dateTo?: string;
  };
};

export function useAssetCertificatesWorkspace(
  projectId: string,
  assetId: string,
  options?: AssetCertificatesWorkspaceOptions,
) {
  const requirementsQuery = useCertificateRequirementsByAsset(
    projectId,
    assetId,
    options?.requirements,
  );
  const certificatesQuery = useCertificatesByAsset(
    projectId,
    assetId,
    options?.records,
  );
  const generationQuery = useGenerateCertificateRequirements(projectId);

  const stats = useMemo(() => {
    const computed = getAssetCertificatesWorkspaceStats(
        requirementsQuery.requirements,
        certificatesQuery.certificates,
      );

    return {
      totalRequirements:
        requirementsQuery.stats?.total ?? computed.totalRequirements,
      records: certificatesQuery.stats?.total ?? computed.records,
      missing: requirementsQuery.stats?.missing ?? computed.missing,
      expired: requirementsQuery.stats?.expired ?? computed.expired,
      underReview:
        requirementsQuery.stats?.underReview ?? computed.underReview,
      provided: requirementsQuery.stats?.provided ?? computed.provided,
    };
  }, [
    certificatesQuery.certificates,
    certificatesQuery.stats,
    requirementsQuery.requirements,
    requirementsQuery.stats,
  ]);
  const summaryItems = useMemo(
    () => getAssetCertificatesSummaryItems(stats),
    [stats],
  );

  const refreshAll = useCallback(async () => {
    await Promise.all([requirementsQuery.refresh(), certificatesQuery.refresh()]);
  }, [certificatesQuery, requirementsQuery]);

  return {
    requirements: requirementsQuery.requirements,
    requirementsPagination: requirementsQuery.pagination,
    requirementsLoading: requirementsQuery.loading,
    requirementsError: requirementsQuery.error,
    refreshRequirements: requirementsQuery.refresh,
    certificates: certificatesQuery.certificates,
    recordsPagination: certificatesQuery.pagination,
    recordsLoading: certificatesQuery.loading,
    recordsError: certificatesQuery.error,
    refreshRecords: certificatesQuery.refresh,
    generateAsset: generationQuery.generateAsset,
    generating: generationQuery.loading,
    generationError: generationQuery.error,
    stats,
    summaryItems,
    refreshAll,
  };
}

export type AssetCertificatesWorkspaceState = ReturnType<
  typeof useAssetCertificatesWorkspace
>;

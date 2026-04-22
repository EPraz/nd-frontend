import { useCertificatesByAsset } from "@/src/features/certificates/core";
import {
  useCertificateRequirementsByAsset,
  useGenerateCertificateRequirements,
} from "@/src/features/certificates/requirements";
import { useCallback, useMemo } from "react";
import {
  getAssetCertificatesSummaryItems,
  getAssetCertificatesWorkspaceStats,
} from "./assetCertificatesWorkspace.helpers";

export function useAssetCertificatesWorkspace(
  projectId: string,
  assetId: string,
) {
  const requirementsQuery = useCertificateRequirementsByAsset(projectId, assetId);
  const certificatesQuery = useCertificatesByAsset(projectId, assetId);
  const generationQuery = useGenerateCertificateRequirements(projectId);

  const stats = useMemo(
    () =>
      getAssetCertificatesWorkspaceStats(
        requirementsQuery.requirements,
        certificatesQuery.certificates,
      ),
    [certificatesQuery.certificates, requirementsQuery.requirements],
  );
  const summaryItems = useMemo(
    () => getAssetCertificatesSummaryItems(stats),
    [stats],
  );

  const refreshAll = useCallback(async () => {
    await Promise.all([requirementsQuery.refresh(), certificatesQuery.refresh()]);
  }, [certificatesQuery, requirementsQuery]);

  return {
    requirements: requirementsQuery.requirements,
    requirementsLoading: requirementsQuery.loading,
    requirementsError: requirementsQuery.error,
    refreshRequirements: requirementsQuery.refresh,
    certificates: certificatesQuery.certificates,
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

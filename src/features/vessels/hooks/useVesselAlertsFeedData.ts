import { useCertificatesByAsset } from "@/src/features/certificates/hooks/useCertificatesByAsset";
import { useMaintenanceByAsset } from "@/src/features/maintenance/hooks/useMaintenanceByAsset";
import { buildAlertsFeedItems } from "@/src/hooks/dashboard/alertsFeed.shared";
import { useMemo } from "react";

export function useVesselAlertsFeedData(projectId: string, assetId: string) {
  const certificatesState = useCertificatesByAsset(projectId, assetId);
  const maintenanceState = useMaintenanceByAsset(projectId, assetId);

  const data = useMemo(
    () =>
      buildAlertsFeedItems(
        certificatesState.certificates,
        maintenanceState.maintenance,
      ),
    [certificatesState.certificates, maintenanceState.maintenance],
  );

  return {
    data,
    isLoading: certificatesState.loading || maintenanceState.loading,
    error: certificatesState.error ?? maintenanceState.error,
    refetch: async () => {
      await Promise.all([certificatesState.refresh(), maintenanceState.refresh()]);
    },
  };
}

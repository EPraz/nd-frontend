import { useCertificatesByAsset } from "@/src/features/certificates/core/hooks/useCertificatesByAsset";
import { useMaintenanceByAsset } from "@/src/features/maintenance/core/hooks/useMaintenanceByAsset";
import { buildAlertsFeedItems } from "@/src/hooks/dashboard/alertsFeed.shared";
import { useMemo } from "react";

type VesselAlertSources = {
  certificatesEnabled?: boolean;
  maintenanceEnabled?: boolean;
};

export function useVesselAlertsFeedData(
  projectId: string,
  assetId: string,
  sources: VesselAlertSources = {},
) {
  const certificatesEnabled = sources.certificatesEnabled ?? true;
  const maintenanceEnabled = sources.maintenanceEnabled ?? true;
  const certificatesState = useCertificatesByAsset(projectId, assetId, {
    enabled: certificatesEnabled,
  });
  const maintenanceState = useMaintenanceByAsset(projectId, assetId, {
    enabled: maintenanceEnabled,
  });

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
    isLoading:
      (certificatesEnabled && certificatesState.loading) ||
      (maintenanceEnabled && maintenanceState.loading),
    error:
      (certificatesEnabled ? certificatesState.error : null) ??
      (maintenanceEnabled ? maintenanceState.error : null),
    refetch: async () => {
      await Promise.all([
        certificatesEnabled ? certificatesState.refresh() : Promise.resolve(),
        maintenanceEnabled ? maintenanceState.refresh() : Promise.resolve(),
      ]);
    },
  };
}

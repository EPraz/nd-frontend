import { useProjectEntitlements } from "@/src/context/ProjectEntitlementsProvider";
import { useProjectContext } from "@/src/context/ProjectProvider";
import { useAssetAuditEvents } from "@/src/hooks/useAssetAuditEvents";
import { useVesselAlertsFeedData } from "../../core/hooks";
import { useVesselShell } from "../../shared/context/VesselShellProvider";
import { VesselOperationalProfileReviewLayout } from "./VesselOperationalProfileReviewLayout";

export default function VesselOverviewScreen() {
  const { projectName } = useProjectContext();
  const { isModuleEnabled } = useProjectEntitlements();
  const { projectId, assetId, vessel, summary } = useVesselShell();
  const alertsState = useVesselAlertsFeedData(projectId, assetId);
  const auditState = useAssetAuditEvents(projectId, assetId, { limit: 6 });

  if (!vessel) return null;

  return (
    <VesselOperationalProfileReviewLayout
      projectId={projectId}
      assetId={assetId}
      projectName={projectName}
      vessel={vessel}
      summary={summary}
      alerts={alertsState.data}
      alertsLoading={alertsState.isLoading}
      alertsError={alertsState.error}
      onRetryAlerts={alertsState.refetch}
      auditState={auditState}
      isModuleEnabled={isModuleEnabled}
    />
  );
}

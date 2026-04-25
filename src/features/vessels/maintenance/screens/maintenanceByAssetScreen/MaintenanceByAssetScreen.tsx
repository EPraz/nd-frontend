import {
  RegistrySegmentedTabs,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
} from "@/src/components/ui/registryWorkspace";
import { useMaintenanceByAsset } from "@/src/features/maintenance/core/hooks/useMaintenanceByAsset";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";
import { VESSEL_MAINTENANCE_WORKSPACE_TABS } from "../../vesselMaintenanceWorkspaceTabs";
import { MaintenanceByAssetHeaderActions } from "./MaintenanceByAssetHeaderActions";
import { MaintenanceByAssetWorkspaceSection } from "./MaintenanceByAssetWorkspaceSection";
import { getMaintenanceByAssetSummaryItems } from "./maintenanceByAssetWorkspace.helpers";

export default function MaintenanceByAssetScreen() {
  const { projectId, assetId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
  }>();

  const pid = String(projectId);
  const aid = String(assetId);
  const page = useMaintenanceByAsset(pid, aid);
  const summaryItems = useMemo(
    () => getMaintenanceByAssetSummaryItems(page.maintenance),
    [page.maintenance],
  );

  return (
    <View className="gap-5">
      <View className="gap-4">
        <RegistryWorkspaceHeader
          title="Maintenance"
          eyebrow="Vessel maintenance registry"
          actions={
            <MaintenanceByAssetHeaderActions onRefresh={page.refresh} />
          }
        />

        <RegistrySegmentedTabs
          tabs={[...VESSEL_MAINTENANCE_WORKSPACE_TABS]}
          activeKey="overview"
          onChange={() => {}}
        />

        <RegistrySummaryStrip items={summaryItems} />
      </View>

      <MaintenanceByAssetWorkspaceSection
        projectId={pid}
        list={page.maintenance}
        isLoading={page.loading}
        error={page.error}
        onRetry={page.refresh}
      />
    </View>
  );
}

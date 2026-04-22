import {
  RegistrySegmentedTabs,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
} from "@/src/components/ui/registryWorkspace";
import { useFuelByAsset } from "@/src/features/fuel/core/hooks/useFuelByAsset";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";
import { VESSEL_FUEL_WORKSPACE_TABS } from "../../vesselFuelWorkspaceTabs";
import { FuelByAssetHeaderActions } from "./FuelByAssetHeaderActions";
import { FuelByAssetWorkspaceSection } from "./FuelByAssetWorkspaceSection";
import { getFuelByAssetSummaryItems } from "./fuelByAssetWorkspace.helpers";

export default function FuelByAssetScreen() {
  const { projectId, assetId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
  }>();

  const pid = String(projectId);
  const aid = String(assetId);
  const page = useFuelByAsset(pid, aid);
  const summaryItems = useMemo(
    () => getFuelByAssetSummaryItems(page.fuelLogs),
    [page.fuelLogs],
  );

  return (
    <View className="gap-5">
      <View className="gap-4">
        <RegistryWorkspaceHeader
          title="Fuel"
          eyebrow="Vessel fuel registry"
          actions={
            <FuelByAssetHeaderActions
              projectId={pid}
              assetId={aid}
              onRefresh={page.refresh}
            />
          }
        />

        <RegistrySegmentedTabs
          tabs={[...VESSEL_FUEL_WORKSPACE_TABS]}
          activeKey="overview"
          onChange={() => {}}
        />

        <RegistrySummaryStrip items={summaryItems} />
      </View>

      <FuelByAssetWorkspaceSection
        projectId={pid}
        list={page.fuelLogs}
        isLoading={page.loading}
        error={page.error}
        onRetry={page.refresh}
      />
    </View>
  );
}

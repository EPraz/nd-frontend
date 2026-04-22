import {
  RegistrySegmentedTabs,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
} from "@/src/components/ui/registryWorkspace";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";
import { useVesselsPageData } from "../../hooks/useVesselsPageData";
import { VESSEL_WORKSPACE_TABS } from "../../../shared/vesselWorkspaceTabs";
import { VesselsOverviewHeaderActions } from "./VesselsOverviewHeaderActions";
import { VesselsOverviewWorkspaceSection } from "./VesselsOverviewWorkspaceSection";
import { getVesselWorkspaceSummaryItems } from "./vesselsWorkspace.helpers";

export default function VesselsByProjectScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);
  const page = useVesselsPageData(pid);
  const summaryItems = useMemo(
    () => getVesselWorkspaceSummaryItems(page.stats),
    [page.stats],
  );

  return (
    <View className="gap-4 p-4 web:p-6">
      <View className="gap-5">
        <RegistryWorkspaceHeader
          title="Vessels"
          eyebrow="Project vessel registry"
          actions={
            <VesselsOverviewHeaderActions
              projectId={pid}
              onRefresh={page.refetch}
            />
          }
        />

        <RegistrySegmentedTabs
          tabs={VESSEL_WORKSPACE_TABS}
          activeKey="overview"
          onChange={() => {}}
        />

        <RegistrySummaryStrip items={summaryItems} />
      </View>

      <VesselsOverviewWorkspaceSection
        projectId={pid}
        isLoading={page.isLoading}
        error={page.error}
        onRetry={page.refetch}
        list={page.list}
      />
    </View>
  );
}

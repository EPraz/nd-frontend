import {
  RegistrySegmentedTabs,
  type RegistrySummaryItem,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
} from "@/src/components/ui/registryWorkspace";
import { useCrewByAsset } from "@/src/features/crew/core";
import { useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import {
  normalizeVesselCrewWorkspaceTab,
  VESSEL_CREW_WORKSPACE_TABS,
  type VesselCrewWorkspaceTab,
} from "../../vesselCrewWorkspaceTabs";
import { CrewByAssetCertificatesHeaderActions } from "./CrewByAssetCertificatesHeaderActions";
import { CrewByAssetCertificatesWorkspaceSection } from "./CrewByAssetCertificatesWorkspaceSection";
import { CrewByAssetHeaderActions } from "./CrewByAssetHeaderActions";
import { CrewByAssetWorkspaceSection } from "./CrewByAssetWorkspaceSection";
import { getCrewByAssetSummaryItems } from "./crewByAssetWorkspace.helpers";
import { useCrewByAssetCertificatesWorkspace } from "./useCrewByAssetCertificatesWorkspace";

type VesselCrewWorkspaceConfig = {
  actions: ReactNode;
  summaryItems?: RegistrySummaryItem[];
  content: ReactNode;
};

export default function CrewByAssetScreen() {
  const { projectId, assetId, tab } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
    tab?: string;
  }>();

  const pid = String(projectId);
  const aid = String(assetId);
  const page = useCrewByAsset(pid, aid);
  const certificatesWorkspace = useCrewByAssetCertificatesWorkspace(pid, aid);
  const [activeTab, setActiveTab] = useState<VesselCrewWorkspaceTab>(
    normalizeVesselCrewWorkspaceTab(tab),
  );
  const summaryItems = useMemo(
    () => getCrewByAssetSummaryItems(page.crew),
    [page.crew],
  );

  useEffect(() => {
    setActiveTab(normalizeVesselCrewWorkspaceTab(tab));
  }, [tab]);

  const tabConfigs = useMemo<
    Record<VesselCrewWorkspaceTab, VesselCrewWorkspaceConfig>
  >(
    () => ({
      overview: {
        actions: (
          <CrewByAssetHeaderActions
            projectId={pid}
            assetId={aid}
            onRefresh={page.refresh}
          />
        ),
        summaryItems,
        content: (
          <CrewByAssetWorkspaceSection
            projectId={pid}
            list={page.crew}
            isLoading={page.loading}
            error={page.error}
            onRetry={page.refresh}
          />
        ),
      },
      certificates: {
        actions: (
          <CrewByAssetCertificatesHeaderActions
            onRefresh={certificatesWorkspace.refreshAll}
          />
        ),
        summaryItems: certificatesWorkspace.summaryItems,
        content: (
          <CrewByAssetCertificatesWorkspaceSection
            projectId={pid}
            workspace={certificatesWorkspace}
          />
        ),
      },
    }),
    [
      aid,
      certificatesWorkspace,
      page.crew,
      page.error,
      page.loading,
      page.refresh,
      pid,
      summaryItems,
    ],
  );
  const activeTabConfig = tabConfigs[activeTab];

  return (
    <View className="gap-5">
      <View className="gap-4">
        <RegistryWorkspaceHeader
          title="Crew"
          eyebrow="Vessel crew registry"
          actions={activeTabConfig.actions}
        />

        <RegistrySegmentedTabs
          tabs={VESSEL_CREW_WORKSPACE_TABS}
          activeKey={activeTab}
          onChange={setActiveTab}
        />

        {activeTabConfig.summaryItems ? (
          <RegistrySummaryStrip items={activeTabConfig.summaryItems} />
        ) : null}
      </View>

      {activeTabConfig.content}
    </View>
  );
}

import {
  RegistrySegmentedTabs,
  type RegistrySummaryItem,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
} from "@/src/components/ui/registryWorkspace";
import {
  CrewBulkUploadTabHeaderActions,
} from "../../../bulk-upload/components/CrewBulkUploadTabHeaderActions";
import { CrewBulkUploadWorkspaceSection } from "../../../bulk-upload/components/CrewBulkUploadWorkspaceSection";
import { CrewCertificatesProjectTabHeaderActions } from "../../../certificates/components/CrewCertificatesProjectTabHeaderActions";
import { CrewCertificatesProjectWorkspaceSection } from "../../../certificates/components/CrewCertificatesProjectWorkspaceSection";
import { useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useCrewPageData } from "../../hooks/useCrewPageData";
import { CrewOverviewHeaderActions } from "./CrewOverviewHeaderActions";
import { CrewOverviewWorkspaceSection } from "./CrewOverviewWorkspaceSection";
import { getCrewWorkspaceSummaryItems } from "./crewWorkspace.helpers";
import {
  CREW_WORKSPACE_TABS,
  normalizeCrewWorkspaceTab,
  type CrewWorkspaceTab,
} from "../../../shared/crewWorkspaceTabs";

type CrewWorkspaceConfig = {
  actions: ReactNode;
  summaryItems?: RegistrySummaryItem[];
  content: ReactNode;
};

export default function CrewByProjectScreen() {
  const { projectId, tab } = useLocalSearchParams<{
    projectId: string;
    tab?: string;
  }>();
  const pid = String(projectId);

  const page = useCrewPageData(pid);
  const [activeTab, setActiveTab] = useState<CrewWorkspaceTab>(
    normalizeCrewWorkspaceTab(tab),
  );

  useEffect(() => {
    setActiveTab(normalizeCrewWorkspaceTab(tab));
  }, [tab]);

  const tabConfigs = useMemo<Record<CrewWorkspaceTab, CrewWorkspaceConfig>>(
    () => ({
      overview: {
        actions: (
          <CrewOverviewHeaderActions
            projectId={pid}
            onRefresh={page.refetch}
          />
        ),
        summaryItems: getCrewWorkspaceSummaryItems(page.stats),
        content: (
          <CrewOverviewWorkspaceSection
            projectId={pid}
            list={page.list}
            isLoading={page.isLoading}
            error={page.error}
            onRetry={page.refetch}
          />
        ),
      },
      certificates: {
        actions: <CrewCertificatesProjectTabHeaderActions projectId={pid} />,
        content: <CrewCertificatesProjectWorkspaceSection projectId={pid} />,
      },
      "bulk-upload": {
        actions: <CrewBulkUploadTabHeaderActions projectId={pid} />,
        content: <CrewBulkUploadWorkspaceSection projectId={pid} />,
      },
    }),
    [page.error, page.isLoading, page.list, page.refetch, page.stats, pid],
  );
  const activeTabConfig = tabConfigs[activeTab];

  return (
    <View className="gap-5 p-4 web:p-6">
      <View className="gap-4">
        <RegistryWorkspaceHeader
          title="Crew"
          eyebrow="Project crew registry"
          actions={activeTabConfig.actions}
        />

        <View className="flex-row flex-wrap items-center justify-between gap-3">
          <RegistrySegmentedTabs
            tabs={CREW_WORKSPACE_TABS}
            activeKey={activeTab}
            onChange={setActiveTab}
          />
        </View>

        {activeTabConfig.summaryItems ? (
          <RegistrySummaryStrip items={activeTabConfig.summaryItems} />
        ) : null}
      </View>

      {activeTabConfig.content}
    </View>
  );
}

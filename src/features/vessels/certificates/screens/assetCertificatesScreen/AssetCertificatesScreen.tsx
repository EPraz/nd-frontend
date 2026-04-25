import {
  RegistrySegmentedTabs,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
} from "@/src/components/ui/registryWorkspace";
import { Text } from "@/src/components/ui/text/Text";
import { useSessionContext } from "@/src/context/SessionProvider";
import { useToast } from "@/src/context/ToastProvider";
import type {
  CertificateStatus,
  RequirementStatus,
} from "@/src/features/certificates/shared";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { canUser } from "@/src/security/rolePermissions";
import {
  ASSET_CERTIFICATES_WORKSPACE_TABS,
  normalizeAssetCertificatesWorkspaceTab,
  type AssetCertificatesWorkspaceTab,
} from "../../assetCertificatesWorkspaceTabs";
import { AssetCertificateRequirementsWorkspaceSection } from "./AssetCertificateRequirementsWorkspaceSection";
import { AssetCertificatesHeaderActions } from "./AssetCertificatesHeaderActions";
import { AssetCertificatesOverviewWorkspaceSection } from "./AssetCertificatesOverviewWorkspaceSection";
import { AssetCertificatesTableActions } from "./AssetCertificatesTableActions";
import { useAssetCertificatesWorkspace } from "./useAssetCertificatesWorkspace";

type AssetCertificatesWorkspaceConfig = {
  content: ReactNode;
};

export default function AssetCertificatesScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { session } = useSessionContext();
  const { projectId, assetId, tab } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
    tab?: string;
  }>();

  const pid = String(projectId);
  const aid = String(assetId);
  const canUploadDocuments = canUser(session, "DOCUMENT_UPLOAD");
  const canUpdateOperationalRecords = canUser(session, "OPERATIONAL_WRITE");
  const workspace = useAssetCertificatesWorkspace(pid, aid);
  const [activeTab, setActiveTab] = useState<AssetCertificatesWorkspaceTab>(
    normalizeAssetCertificatesWorkspaceTab(tab),
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [requirementFilter, setRequirementFilter] = useState<
    "ALL" | RequirementStatus
  >("ALL");
  const [recordStatusFilter, setRecordStatusFilter] = useState<
    "ALL" | CertificateStatus
  >("ALL");

  useEffect(() => {
    setActiveTab(normalizeAssetCertificatesWorkspaceTab(tab));
  }, [tab]);

  useEffect(() => {
    setShowStatusMenu(false);
  }, [activeTab, isExpanded]);

  const filteredRequirements = useMemo(
    () =>
      workspace.requirements.filter((row) => {
        return requirementFilter === "ALL" || row.status === requirementFilter;
      }),
    [requirementFilter, workspace.requirements],
  );
  const filteredCertificates = useMemo(
    () =>
      workspace.certificates.filter((row) => {
        return (
          recordStatusFilter === "ALL" || row.status === recordStatusFilter
        );
      }),
    [recordStatusFilter, workspace.certificates],
  );

  const handleGenerate = useCallback(async () => {
    try {
      const result = await workspace.generateAsset(aid);
      await workspace.refreshAll();
      show(
        `Requirements refreshed for ${result.processedAssets} vessel${result.processedAssets === 1 ? "" : "s"}.`,
        "success",
      );
    } catch {
      show("Failed to refresh certificate requirements", "error");
    }
  }, [aid, show, workspace]);

  const openRequirementUpload = useCallback(
    (requirementId: string) => {
      router.push({
        pathname: "/projects/[projectId]/certificates/upload",
        params: {
          projectId: pid,
          assetId: aid,
          requirementId,
        },
      });
    },
    [aid, pid, router],
  );

  const openExtraUpload = useCallback(() => {
    router.push({
      pathname: "/projects/[projectId]/certificates/upload",
      params: {
        projectId: pid,
        assetId: aid,
      },
    });
  }, [aid, pid, router]);

  const tableActions = (
    <AssetCertificatesTableActions
      activeTab={activeTab}
      requirementFilter={requirementFilter}
      recordStatusFilter={recordStatusFilter}
      showStatusMenu={showStatusMenu}
      onToggleStatusMenu={() => setShowStatusMenu((prev) => !prev)}
      onRequirementFilterChange={(value) => {
        setRequirementFilter(value);
        setShowStatusMenu(false);
      }}
      onRecordStatusFilterChange={(value) => {
        setRecordStatusFilter(value);
        setShowStatusMenu(false);
      }}
      isExpanded={isExpanded}
      onExpandedChange={setIsExpanded}
      onReset={() => {
        setRequirementFilter("ALL");
        setRecordStatusFilter("ALL");
      }}
    />
  );

  const tabConfigs: Record<
    AssetCertificatesWorkspaceTab,
    AssetCertificatesWorkspaceConfig
  > = {
    overview: {
      content: (
        <AssetCertificatesOverviewWorkspaceSection
          data={filteredCertificates}
          isLoading={workspace.recordsLoading}
          error={workspace.recordsError}
          onRetry={workspace.refreshRecords}
          headerActions={tableActions}
        />
      ),
    },
    requirements: {
      content: (
        <AssetCertificateRequirementsWorkspaceSection
          data={filteredRequirements}
          isLoading={workspace.requirementsLoading}
          error={workspace.requirementsError}
          onRetry={workspace.refreshRequirements}
          onUpload={(row) => openRequirementUpload(row.id)}
          canUpload={canUploadDocuments}
          headerActions={tableActions}
        />
      ),
    },
  };
  const activeTabConfig = tabConfigs[activeTab];

  return (
    <View className="gap-5">
      <View className="gap-4">
        <RegistryWorkspaceHeader
          title="Certificates"
          eyebrow="Vessel compliance registry"
          actions={
            <AssetCertificatesHeaderActions
              projectId={pid}
              assetId={aid}
              onRefresh={
                canUpdateOperationalRecords ? handleGenerate : workspace.refreshAll
              }
              onOpenUpload={openExtraUpload}
              loading={canUpdateOperationalRecords && workspace.generating}
              canUpload={canUploadDocuments}
            />
          }
        />

        <RegistrySegmentedTabs
          tabs={ASSET_CERTIFICATES_WORKSPACE_TABS}
          activeKey={activeTab}
          onChange={setActiveTab}
        />

        {workspace.generationError ? (
          <Text className="text-[12px] text-destructive">
            {workspace.generationError}
          </Text>
        ) : null}

        {!isExpanded ? (
          <RegistrySummaryStrip items={workspace.summaryItems} />
        ) : null}
      </View>

      {activeTabConfig.content}
    </View>
  );
}

import {
  RegistrySegmentedTabs,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
} from "@/src/components/ui/registryWorkspace";
import { Text } from "@/src/components/ui/text/Text";
import { useSessionContext } from "@/src/context/SessionProvider";
import { useToast } from "@/src/context/ToastProvider";
import {
  DEFAULT_PAGE_SIZE,
  type DateWindowFilter,
} from "@/src/contracts/pagination.contract";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import type {
  CertificateCategory,
  CertificateStatus,
  CertificateWorkflowStatus,
  RequirementStatus,
} from "@/src/features/certificates/shared";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
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
  const [requirementsPage, setRequirementsPage] = useState(1);
  const [requirementsPageSize, setRequirementsPageSize] =
    useState(DEFAULT_PAGE_SIZE);
  const [recordsPage, setRecordsPage] = useState(1);
  const [recordsPageSize, setRecordsPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [requirementFilter, setRequirementFilter] = useState<
    "ALL" | RequirementStatus
  >("ALL");
  const [recordStatusFilter, setRecordStatusFilter] = useState<
    "ALL" | CertificateStatus
  >("ALL");
  const [categoryFilter, setCategoryFilter] =
    useState<"ALL" | CertificateCategory>("ALL");
  const [workflowStatusFilter, setWorkflowStatusFilter] =
    useState<"ALL" | CertificateWorkflowStatus>("ALL");
  const [dateWindow, setDateWindow] =
    useState<"ALL" | DateWindowFilter>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 180);
  const workspace = useAssetCertificatesWorkspace(pid, aid, {
    requirements: {
      page: requirementsPage,
      pageSize: requirementsPageSize,
      search: debouncedSearch,
      status: requirementFilter === "ALL" ? undefined : requirementFilter,
      category: categoryFilter === "ALL" ? undefined : categoryFilter,
    },
    records: {
      page: recordsPage,
      pageSize: recordsPageSize,
      sort: "EXPIRY_ASC",
      search: debouncedSearch,
      status: recordStatusFilter === "ALL" ? undefined : recordStatusFilter,
      workflowStatus:
        workflowStatusFilter === "ALL" ? undefined : workflowStatusFilter,
      category: categoryFilter === "ALL" ? undefined : categoryFilter,
      dateWindow: dateWindow === "ALL" ? undefined : dateWindow,
      dateFrom,
      dateTo,
    },
  });
  const [activeTab, setActiveTab] = useState<AssetCertificatesWorkspaceTab>(
    normalizeAssetCertificatesWorkspaceTab(tab),
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showWorkflowMenu, setShowWorkflowMenu] = useState(false);
  const [showDateWindowMenu, setShowDateWindowMenu] = useState(false);
  const [showDateRangeMenu, setShowDateRangeMenu] = useState(false);

  useEffect(() => {
    setActiveTab(normalizeAssetCertificatesWorkspaceTab(tab));
  }, [tab]);

  useEffect(() => {
    setShowStatusMenu(false);
  }, [activeTab, isExpanded]);

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
        setRequirementsPage(1);
        setShowStatusMenu(false);
      }}
      onRecordStatusFilterChange={(value) => {
        setRecordStatusFilter(value);
        setRecordsPage(1);
        setShowStatusMenu(false);
      }}
      categoryFilter={categoryFilter}
      showCategoryMenu={showCategoryMenu}
      onToggleCategoryMenu={() => setShowCategoryMenu((prev) => !prev)}
      onCategoryFilterChange={(value) => {
        setCategoryFilter(value);
        setRequirementsPage(1);
        setRecordsPage(1);
        setShowCategoryMenu(false);
      }}
      workflowStatusFilter={workflowStatusFilter}
      showWorkflowMenu={showWorkflowMenu}
      onToggleWorkflowMenu={() => setShowWorkflowMenu((prev) => !prev)}
      onWorkflowStatusFilterChange={(value) => {
        setWorkflowStatusFilter(value);
        setRecordsPage(1);
        setShowWorkflowMenu(false);
      }}
      dateWindow={dateWindow}
      dateFrom={dateFrom}
      dateTo={dateTo}
      showDateWindowMenu={showDateWindowMenu}
      onToggleDateWindowMenu={() => setShowDateWindowMenu((prev) => !prev)}
      showDateRangeMenu={showDateRangeMenu}
      onDateRangeOpenChange={setShowDateRangeMenu}
      onDateWindowChange={(value) => {
        setDateWindow(value);
        setDateFrom("");
        setDateTo("");
        setRecordsPage(1);
        setShowDateWindowMenu(false);
      }}
      onDateFromChange={(value) => {
        setDateFrom(value);
        setDateWindow("ALL");
        setRecordsPage(1);
      }}
      onDateToChange={(value) => {
        setDateTo(value);
        setDateWindow("ALL");
        setRecordsPage(1);
      }}
      onDateRangeClear={() => {
        setDateFrom("");
        setDateTo("");
        setRecordsPage(1);
      }}
      isExpanded={isExpanded}
      onExpandedChange={setIsExpanded}
      onReset={() => {
        setRequirementFilter("ALL");
        setRecordStatusFilter("ALL");
        setCategoryFilter("ALL");
        setWorkflowStatusFilter("ALL");
        setDateWindow("ALL");
        setDateFrom("");
        setDateTo("");
        setSearch("");
        setRequirementsPage(1);
        setRecordsPage(1);
      }}
      search={search}
      onSearchChange={(value) => {
        setSearch(value);
        setRequirementsPage(1);
        setRecordsPage(1);
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
          data={workspace.certificates}
          isLoading={workspace.recordsLoading}
          error={workspace.recordsError}
          onRetry={workspace.refreshRecords}
          headerActions={tableActions}
          pagination={
            workspace.recordsPagination
              ? {
                  meta: workspace.recordsPagination,
                  onPageChange: setRecordsPage,
                  onPageSizeChange: (nextPageSize) => {
                    setRecordsPageSize(nextPageSize);
                    setRecordsPage(1);
                  },
                }
              : undefined
          }
        />
      ),
    },
    requirements: {
      content: (
        <AssetCertificateRequirementsWorkspaceSection
          data={workspace.requirements}
          isLoading={workspace.requirementsLoading}
          error={workspace.requirementsError}
          onRetry={workspace.refreshRequirements}
          onUpload={(row) => openRequirementUpload(row.id)}
          canUpload={canUploadDocuments}
          headerActions={tableActions}
          pagination={
            workspace.requirementsPagination
              ? {
                  meta: workspace.requirementsPagination,
                  onPageChange: setRequirementsPage,
                  onPageSizeChange: (nextPageSize) => {
                    setRequirementsPageSize(nextPageSize);
                    setRequirementsPage(1);
                  },
                }
              : undefined
          }
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

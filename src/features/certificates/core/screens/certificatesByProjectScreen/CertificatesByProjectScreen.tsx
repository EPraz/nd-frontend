import {
  RegistrySegmentedTabs,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
} from "@/src/components/ui/registryWorkspace";
import { Text } from "@/src/components/ui/text/Text";
import {
  DEFAULT_PAGE_SIZE,
  type DateWindowFilter,
} from "@/src/contracts/pagination.contract";
import { useSessionContext } from "@/src/context/SessionProvider";
import { useToast } from "@/src/context/ToastProvider";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { canUser } from "@/src/security/rolePermissions";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { CertificateRequirementsTable } from "@/src/features/certificates/requirements/components/certificateRequirementsTable/CertificateRequirementsTable";
import { CertificatesTable } from "@/src/features/certificates/core/components/certificateTable/CertificatesTable";
import {
  CertificateCategory,
  CertificateRequirementDto,
  CertificateStatus,
  CertificateWorkflowStatus,
  RequirementStatus,
} from "@/src/features/certificates/shared";
import { useCertificateRequirementsByProject } from "@/src/features/certificates/requirements/hooks/useCertificateRequirementsByProject";
import { useCertificatesByProject } from "@/src/features/certificates/core/hooks/useCertificatesByProject";
import { useGenerateCertificateRequirements } from "@/src/features/certificates/requirements/hooks/useGenerateCertificateRequirements";
import { useVessels } from "@/src/features/vessels/core";
import { CertificatesByProjectHeaderActions } from "./CertificatesByProjectHeaderActions";
import { CertificatesByProjectTableActions } from "./CertificatesByProjectTableActions";
import { CERTIFICATES_PROJECT_TABS } from "./certificatesByProject.constants";

export default function CertificatesByProjectScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { session } = useSessionContext();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);
  const canUploadDocuments = canUser(session, "DOCUMENT_UPLOAD");
  const canUpdateOperationalRecords = canUser(session, "OPERATIONAL_WRITE");
  const [activeTab, setActiveTab] = useState<"requirements" | "overview">(
    "overview",
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showWorkflowMenu, setShowWorkflowMenu] = useState(false);
  const [showDateWindowMenu, setShowDateWindowMenu] = useState(false);
  const [showDateRangeMenu, setShowDateRangeMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [requirementFilter, setRequirementFilter] = useState<
    "ALL" | RequirementStatus
  >("ALL");
  const [recordStatusFilter, setRecordStatusFilter] = useState<
    "ALL" | CertificateStatus
  >("ALL");
  const [categoryFilter, setCategoryFilter] =
    useState<"ALL" | CertificateCategory>("ALL");
  const [assetFilter, setAssetFilter] = useState("ALL");
  const [workflowStatusFilter, setWorkflowStatusFilter] =
    useState<"ALL" | CertificateWorkflowStatus>("ALL");
  const [dateWindow, setDateWindow] =
    useState<"ALL" | DateWindowFilter>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [vesselQuery, setVesselQuery] = useState("");
  const debouncedSearch = useDebouncedValue(vesselQuery, 180);
  const [requirementsPage, setRequirementsPage] = useState(1);
  const [requirementsPageSize, setRequirementsPageSize] =
    useState(DEFAULT_PAGE_SIZE);
  const [recordsPage, setRecordsPage] = useState(1);
  const [recordsPageSize, setRecordsPageSize] = useState(DEFAULT_PAGE_SIZE);

  const {
    requirements,
    pagination: requirementsPagination,
    stats: requirementsStats,
    loading,
    error,
    refresh,
  } = useCertificateRequirementsByProject(pid, {
    page: requirementsPage,
    pageSize: requirementsPageSize,
    search: debouncedSearch,
    status: requirementFilter === "ALL" ? undefined : requirementFilter,
    assetId: assetFilter === "ALL" ? undefined : assetFilter,
    category: categoryFilter === "ALL" ? undefined : categoryFilter,
  });
  const {
    certificates,
    pagination: recordsPagination,
    stats: recordsStats,
    loading: recordsLoading,
    error: recordsError,
    refresh: refreshRecords,
  } = useCertificatesByProject(pid, {
    page: recordsPage,
    pageSize: recordsPageSize,
    sort: "EXPIRY_ASC",
    search: debouncedSearch,
    status: recordStatusFilter === "ALL" ? undefined : recordStatusFilter,
    workflowStatus:
      workflowStatusFilter === "ALL" ? undefined : workflowStatusFilter,
    assetId: assetFilter === "ALL" ? undefined : assetFilter,
    category: categoryFilter === "ALL" ? undefined : categoryFilter,
    dateWindow: dateWindow === "ALL" ? undefined : dateWindow,
    dateFrom,
    dateTo,
  });
  const {
    generateProject,
    loading: generating,
    error: generationError,
  } = useGenerateCertificateRequirements(pid);
  const { vessels } = useVessels(pid);

  const stats = useMemo(() => {
    let missing = 0;
    let underReview = 0;
    let provided = 0;
    let expired = 0;
    let exempt = 0;

    for (const row of requirements) {
      if (row.status === "MISSING") missing += 1;
      if (row.status === "UNDER_REVIEW") underReview += 1;
      if (row.status === "PROVIDED") provided += 1;
      if (row.status === "EXPIRED") expired += 1;
      if (row.status === "EXEMPT") exempt += 1;
    }

    const baseStats = requirementsStats ?? {
      total: requirements.length,
      missing,
      underReview,
      provided,
      expired,
      exempt,
    };

    return {
      total: baseStats.total,
      missing: baseStats.missing,
      underReview: baseStats.underReview,
      provided: baseStats.provided,
      expired: baseStats.expired,
      exempt: baseStats.exempt,
      uploaded: recordsStats?.total ?? certificates.length,
    };
  }, [certificates.length, recordsStats, requirements, requirementsStats]);

  useEffect(() => {
    setShowStatusMenu(false);
  }, [activeTab, isExpanded]);

  async function refreshAll() {
    await Promise.all([refresh(), refreshRecords()]);
  }

  async function onGenerate() {
    try {
      const result = await generateProject();
      await refreshAll();
      show(
        `Requirements refreshed for ${result.processedAssets} vessel${result.processedAssets === 1 ? "" : "s"}.`,
        "success",
      );
    } catch {
      show("Failed to refresh certificate requirements", "error");
    }
  }

  function openUpload(row: CertificateRequirementDto) {
    router.push({
      pathname: "/projects/[projectId]/certificates/upload",
      params: {
        projectId: pid,
        assetId: row.assetId,
        requirementId: row.id,
      },
    });
  }

  function openExtraUpload() {
    router.push({
      pathname: "/projects/[projectId]/certificates/upload",
      params: {
        projectId: pid,
      },
    });
  }

  const summaryItems = [
    {
      label: "Requirements",
      value: String(stats.total),
      helper: "active certificate requirements",
      tone: "accent" as const,
    },
    {
      label: "Missing",
      value: String(stats.missing),
      helper: "need a document upload",
      tone: stats.missing > 0 ? ("danger" as const) : ("ok" as const),
    },
    {
      label: "Under review",
      value: String(stats.underReview),
      helper: "uploaded and awaiting confirmation",
      tone: stats.underReview > 0 ? ("warn" as const) : ("ok" as const),
    },
    {
      label: "Provided",
      value: String(stats.provided),
      helper:
        stats.expired > 0
          ? `${stats.expired} expired`
          : "currently backed by a certificate",
      tone: stats.expired > 0 ? ("danger" as const) : ("ok" as const),
    },
  ];

  return (
    <View className="gap-4 p-4 web:p-6">
      <View className="gap-5">
        <RegistryWorkspaceHeader
          title="Certificates"
          eyebrow="Project compliance registry"
          actions={
            <CertificatesByProjectHeaderActions
              projectId={pid}
              onRefresh={canUpdateOperationalRecords ? onGenerate : refreshAll}
              onOpenUpload={openExtraUpload}
              loading={canUpdateOperationalRecords && generating}
              canUpload={canUploadDocuments}
            />
          }
        />

        <View className="gap-3">
          <View className="flex-row flex-wrap items-center justify-between gap-3">
            <RegistrySegmentedTabs
              tabs={CERTIFICATES_PROJECT_TABS}
              activeKey={activeTab}
              onChange={setActiveTab}
            />
          </View>

          {generationError ? (
            <Text className="mt-3 text-[12px] text-destructive">
              {generationError}
            </Text>
          ) : null}
        </View>
      </View>
      {/* {true ? <View className="h-px bg-shellLine" /> : null} */}
      {!isExpanded ? (
        <RegistrySummaryStrip
          items={summaryItems}
          loading={loading || recordsLoading}
        />
      ) : null}

      {activeTab === "requirements" ? (
        <CertificateRequirementsTable
          title="Vessel Requirements"
          subtitleRight={
            requirementsPagination
              ? `${requirementsPagination.totalItems} requirements in scope`
              : `${requirements.length} requirements currently visible`
          }
          headerActions={
            <CertificatesByProjectTableActions
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
              assetFilter={assetFilter}
              vessels={vessels}
              showAssetMenu={showAssetMenu}
              onToggleAssetMenu={() => setShowAssetMenu((prev) => !prev)}
              onAssetFilterChange={(value) => {
                setAssetFilter(value);
                setRequirementsPage(1);
                setRecordsPage(1);
                setShowAssetMenu(false);
              }}
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
              onToggleDateWindowMenu={() =>
                setShowDateWindowMenu((prev) => !prev)
              }
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
              vesselQuery={vesselQuery}
              onVesselQueryChange={(value) => {
                setVesselQuery(value);
                setRequirementsPage(1);
                setRecordsPage(1);
              }}
              isSearchOpen={isSearchOpen}
              onSearchOpenChange={setIsSearchOpen}
              isExpanded={isExpanded}
              onExpandedChange={setIsExpanded}
              onReset={() => {
                setRequirementFilter("ALL");
                setRecordStatusFilter("ALL");
                setCategoryFilter("ALL");
                setAssetFilter("ALL");
                setWorkflowStatusFilter("ALL");
                setDateWindow("ALL");
                setDateFrom("");
                setDateTo("");
                setVesselQuery("");
                setRequirementsPage(1);
                setRecordsPage(1);
                setIsSearchOpen(false);
              }}
            />
          }
          toolbarContent={null}
          data={requirements}
          isLoading={loading}
          error={error}
          onRetry={refresh}
          onUpload={openUpload}
          canUpload={canUploadDocuments}
          pagination={
            requirementsPagination
              ? {
                  meta: requirementsPagination,
                  onPageChange: setRequirementsPage,
                  onPageSizeChange: (nextPageSize) => {
                    setRequirementsPageSize(nextPageSize);
                    setRequirementsPage(1);
                  },
                }
              : undefined
          }
        />
      ) : (
        <View className="flex-1">
          <CertificatesTable
            title="Project Records"
            subtitleRight={
              recordsPagination
                ? `${recordsPagination.totalItems} records in scope`
                : `${certificates.length} records currently visible`
            }
            headerActions={
              <CertificatesByProjectTableActions
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
              assetFilter={assetFilter}
              vessels={vessels}
              showAssetMenu={showAssetMenu}
              onToggleAssetMenu={() => setShowAssetMenu((prev) => !prev)}
              onAssetFilterChange={(value) => {
                setAssetFilter(value);
                setRequirementsPage(1);
                setRecordsPage(1);
                setShowAssetMenu(false);
              }}
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
              onToggleDateWindowMenu={() =>
                setShowDateWindowMenu((prev) => !prev)
              }
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
              vesselQuery={vesselQuery}
                onVesselQueryChange={(value) => {
                  setVesselQuery(value);
                  setRequirementsPage(1);
                  setRecordsPage(1);
                }}
                isSearchOpen={isSearchOpen}
                onSearchOpenChange={setIsSearchOpen}
                isExpanded={isExpanded}
                onExpandedChange={setIsExpanded}
                onReset={() => {
                  setRequirementFilter("ALL");
                  setRecordStatusFilter("ALL");
                  setCategoryFilter("ALL");
                  setAssetFilter("ALL");
                  setWorkflowStatusFilter("ALL");
                  setDateWindow("ALL");
                  setDateFrom("");
                  setDateTo("");
                  setVesselQuery("");
                  setRequirementsPage(1);
                  setRecordsPage(1);
                  setIsSearchOpen(false);
                }}
              />
            }
            toolbarContent={null}
            data={certificates}
            isLoading={recordsLoading}
            error={recordsError}
            onRetry={refreshRecords}
            showVesselColumn
            sortByExpiry
            pagination={
              recordsPagination
                ? {
                    meta: recordsPagination,
                    onPageChange: setRecordsPage,
                    onPageSizeChange: (nextPageSize) => {
                      setRecordsPageSize(nextPageSize);
                      setRecordsPage(1);
                    },
                  }
                : undefined
            }
          />
        </View>
      )}
    </View>
  );
}



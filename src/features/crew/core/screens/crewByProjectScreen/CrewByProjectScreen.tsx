import {
  RegistrySegmentedTabs,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
  type RegistrySummaryItem,
} from "@/src/components/ui/registryWorkspace";
import { useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { useVessels } from "@/src/features/vessels/core";
import { CrewBulkUploadTabHeaderActions } from "../../../bulk-upload/components/CrewBulkUploadTabHeaderActions";
import { CrewBulkUploadWorkspaceSection } from "../../../bulk-upload/components/CrewBulkUploadWorkspaceSection";
import { CrewCertificatesProjectTabHeaderActions } from "../../../certificates/components/CrewCertificatesProjectTabHeaderActions";
import { CrewCertificatesProjectWorkspaceSection } from "../../../certificates/components/CrewCertificatesProjectWorkspaceSection";
import {
  CREW_WORKSPACE_TABS,
  normalizeCrewWorkspaceTab,
  type CrewWorkspaceTab,
} from "../../../shared/crewWorkspaceTabs";
import type { CrewSortOption } from "../../contracts";
import { useCrewPageData } from "../../hooks/useCrewPageData";
import { CrewOverviewHeaderActions } from "./CrewOverviewHeaderActions";
import { CrewOverviewWorkspaceSection } from "./CrewOverviewWorkspaceSection";
import { getCrewWorkspaceSummaryItems } from "./crewWorkspace.helpers";

type CrewWorkspaceConfig = {
  actions: ReactNode;
  summaryItems?: RegistrySummaryItem[];
  summaryLoading?: boolean;
  content: ReactNode;
};

const DEFAULT_PAGE_SIZE = 10;

export default function CrewByProjectScreen() {
  const { projectId, tab } = useLocalSearchParams<{
    projectId: string;
    tab?: string;
  }>();
  const pid = String(projectId);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState<CrewSortOption>("ACTIVE_FIRST");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 180);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [assetFilter, setAssetFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [medicalFilter, setMedicalFilter] = useState("ALL");
  const [dateWindow, setDateWindow] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const page = useCrewPageData(pid, {
    page: pageNumber,
    pageSize,
    sort: sortBy,
    search: debouncedSearch,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    assetId: assetFilter === "ALL" ? undefined : assetFilter,
    department: departmentFilter === "ALL" ? undefined : departmentFilter,
    medicalState: medicalFilter === "ALL" ? undefined : medicalFilter,
    dateWindow: dateWindow === "ALL" ? undefined : dateWindow,
    dateFrom,
    dateTo,
  });
  const [activeTab, setActiveTab] = useState<CrewWorkspaceTab>(
    normalizeCrewWorkspaceTab(tab),
  );
  const { vessels } = useVessels(pid);

  useEffect(() => {
    setActiveTab(normalizeCrewWorkspaceTab(tab));
  }, [tab]);

  const tabConfigs = useMemo<Record<CrewWorkspaceTab, CrewWorkspaceConfig>>(
    () => ({
      overview: {
        actions: (
          <CrewOverviewHeaderActions projectId={pid} onRefresh={page.refetch} />
        ),
        summaryItems: getCrewWorkspaceSummaryItems(page.stats),
        summaryLoading: page.isLoading,
        content: (
          <CrewOverviewWorkspaceSection
            projectId={pid}
            list={page.list}
            isLoading={page.isLoading}
            error={page.error}
            onRetry={page.refetch}
            pagination={page.pagination}
            onPageChange={setPageNumber}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setPageNumber(1);
            }}
            sortBy={sortBy}
            onSortChange={(nextSort) => {
              setSortBy(nextSort);
              setPageNumber(1);
            }}
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPageNumber(1);
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={(value) => {
              setStatusFilter(value);
              setPageNumber(1);
            }}
            assetFilter={assetFilter}
            vessels={vessels}
            onAssetFilterChange={(value) => {
              setAssetFilter(value);
              setPageNumber(1);
            }}
            departmentFilter={departmentFilter}
            onDepartmentFilterChange={(value) => {
              setDepartmentFilter(value);
              setPageNumber(1);
            }}
            medicalFilter={medicalFilter}
            onMedicalFilterChange={(value) => {
              setMedicalFilter(value);
              setPageNumber(1);
            }}
            dateWindow={dateWindow}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateWindowChange={(value) => {
              setDateWindow(value);
              setDateFrom("");
              setDateTo("");
              setPageNumber(1);
            }}
            onDateFromChange={(value) => {
              setDateFrom(value);
              setDateWindow("ALL");
              setPageNumber(1);
            }}
            onDateToChange={(value) => {
              setDateTo(value);
              setDateWindow("ALL");
              setPageNumber(1);
            }}
            onDateRangeClear={() => {
              setDateFrom("");
              setDateTo("");
              setPageNumber(1);
            }}
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
    [
      page.error,
      page.isLoading,
      page.list,
      page.pagination,
      page.refetch,
      page.stats,
      pid,
      dateFrom,
      dateTo,
      dateWindow,
      departmentFilter,
      medicalFilter,
      search,
      sortBy,
      statusFilter,
      assetFilter,
      vessels,
    ],
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
          <RegistrySummaryStrip
            items={activeTabConfig.summaryItems}
            loading={activeTabConfig.summaryLoading}
          />
        ) : null}
      </View>

      {activeTabConfig.content}
    </View>
  );
}

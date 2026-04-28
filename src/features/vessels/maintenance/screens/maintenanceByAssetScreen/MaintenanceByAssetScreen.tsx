import {
  RegistrySegmentedTabs,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
} from "@/src/components/ui/registryWorkspace";
import {
  DEFAULT_PAGE_SIZE,
  type DateWindowFilter,
} from "@/src/contracts/pagination.contract";
import { useMaintenanceByAsset } from "@/src/features/maintenance/core/hooks/useMaintenanceByAsset";
import type {
  MaintenancePriority,
  MaintenanceStatus,
} from "@/src/features/maintenance/shared/contracts";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { VESSEL_MAINTENANCE_WORKSPACE_TABS } from "../../vesselMaintenanceWorkspaceTabs";
import { MaintenanceByAssetHeaderActions } from "./MaintenanceByAssetHeaderActions";
import { MaintenanceByAssetWorkspaceSection } from "./MaintenanceByAssetWorkspaceSection";
import {
  getMaintenanceByAssetSummaryItems,
  type MaintenanceSortOption,
} from "./maintenanceByAssetWorkspace.helpers";

export default function MaintenanceByAssetScreen() {
  const { projectId, assetId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
  }>();

  const pid = String(projectId);
  const aid = String(assetId);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState<MaintenanceSortOption>("DUE_ASC");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | MaintenanceStatus>("ALL");
  const [priorityFilter, setPriorityFilter] =
    useState<"ALL" | MaintenancePriority>("ALL");
  const [dateWindow, setDateWindow] =
    useState<"ALL" | DateWindowFilter>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const debouncedSearch = useDebouncedValue(search, 180);
  const page = useMaintenanceByAsset(pid, aid, {
    page: pageNumber,
    pageSize,
    sort: sortBy,
    search: debouncedSearch,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    priority: priorityFilter === "ALL" ? undefined : priorityFilter,
    dateWindow: dateWindow === "ALL" ? undefined : dateWindow,
    dateFrom,
    dateTo,
  });
  const summaryItems = useMemo(
    () => getMaintenanceByAssetSummaryItems(page.maintenance, page.stats),
    [page.maintenance, page.stats],
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
        pagination={page.pagination}
        onPageChange={setPageNumber}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPageNumber(1);
        }}
        search={search}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        dateWindow={dateWindow}
        dateFrom={dateFrom}
        dateTo={dateTo}
        sortBy={sortBy}
        onSearchChange={(value) => {
          setSearch(value);
          setPageNumber(1);
        }}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setPageNumber(1);
        }}
        onPriorityFilterChange={(value) => {
          setPriorityFilter(value);
          setPageNumber(1);
        }}
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
        onSortChange={(nextSort) => {
          setSortBy(nextSort);
          setPageNumber(1);
        }}
      />
    </View>
  );
}

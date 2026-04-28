import {
  RegistrySegmentedTabs,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
} from "@/src/components/ui/registryWorkspace";
import {
  DEFAULT_PAGE_SIZE,
  type DateWindowFilter,
} from "@/src/contracts/pagination.contract";
import { useFuelByAsset } from "@/src/features/fuel/core/hooks/useFuelByAsset";
import type {
  FuelEventType,
  FuelType,
} from "@/src/features/fuel/shared/contracts";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { VESSEL_FUEL_WORKSPACE_TABS } from "../../vesselFuelWorkspaceTabs";
import { FuelByAssetHeaderActions } from "./FuelByAssetHeaderActions";
import { FuelByAssetWorkspaceSection } from "./FuelByAssetWorkspaceSection";
import {
  getFuelByAssetSummaryItems,
  type FuelSortOption,
} from "./fuelByAssetWorkspace.helpers";

export default function FuelByAssetScreen() {
  const { projectId, assetId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
  }>();

  const pid = String(projectId);
  const aid = String(assetId);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState<FuelSortOption>("DATE_DESC");
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] =
    useState<"ALL" | FuelEventType>("ALL");
  const [fuelTypeFilter, setFuelTypeFilter] =
    useState<"ALL" | FuelType>("ALL");
  const [dateWindow, setDateWindow] =
    useState<"ALL" | DateWindowFilter>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [criticalFilter, setCriticalFilter] =
    useState<"ALL" | "true">("ALL");
  const debouncedSearch = useDebouncedValue(search, 180);
  const page = useFuelByAsset(pid, aid, {
    page: pageNumber,
    pageSize,
    sort: sortBy,
    search: debouncedSearch,
    eventType: eventFilter === "ALL" ? undefined : eventFilter,
    fuelType: fuelTypeFilter === "ALL" ? undefined : fuelTypeFilter,
    dateWindow: dateWindow === "ALL" ? undefined : dateWindow,
    dateFrom,
    dateTo,
    hasCriticalGap: criticalFilter === "ALL" ? undefined : criticalFilter,
  });
  const summaryItems = useMemo(
    () => getFuelByAssetSummaryItems(page.fuelLogs, page.stats),
    [page.fuelLogs, page.stats],
  );

  return (
    <View className="gap-5">
      <View className="gap-4">
        <RegistryWorkspaceHeader
          title="Fuel"
          eyebrow="Vessel fuel registry"
          actions={
            <FuelByAssetHeaderActions onRefresh={page.refresh} />
          }
        />

        <RegistrySegmentedTabs
          tabs={[...VESSEL_FUEL_WORKSPACE_TABS]}
          activeKey="overview"
          onChange={() => {}}
        />

        <RegistrySummaryStrip items={summaryItems} loading={page.loading} />
      </View>

      <FuelByAssetWorkspaceSection
        projectId={pid}
        list={page.fuelLogs}
        isLoading={page.loading}
        error={page.error}
        onRetry={page.refresh}
        pagination={page.pagination}
        onPageChange={setPageNumber}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPageNumber(1);
        }}
        sortBy={sortBy}
        search={search}
        eventFilter={eventFilter}
        fuelTypeFilter={fuelTypeFilter}
        dateWindow={dateWindow}
        dateFrom={dateFrom}
        dateTo={dateTo}
        criticalFilter={criticalFilter}
        onSearchChange={(value) => {
          setSearch(value);
          setPageNumber(1);
        }}
        onEventFilterChange={(value) => {
          setEventFilter(value);
          setPageNumber(1);
        }}
        onFuelTypeFilterChange={(value) => {
          setFuelTypeFilter(value);
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
        onCriticalFilterChange={(value) => {
          setCriticalFilter(value);
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

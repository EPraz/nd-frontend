import { ToolbarSelect } from "@/src/components/ui/forms/ToolbarSelect";
import {
  TableDateRangeFilter,
  TableFilterSearch,
} from "@/src/components/ui/table";
import {
  RegistryHeaderActionButton,
  RegistrySegmentedTabs,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
} from "@/src/components/ui/registryWorkspace";
import {
  DEFAULT_PAGE_SIZE,
  type DateWindowFilter,
} from "@/src/contracts/pagination.contract";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { useVessels } from "@/src/features/vessels/core";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { FuelTable } from "../../components";
import type { FuelDto, FuelEventType, FuelType } from "../../../shared/contracts";
import { useFuelPageData } from "../../hooks";
import { FuelQuickViewModal } from "../fuelQuickViewModal";

const EVENT_OPTIONS = [
  "ALL",
  "BUNKERED",
  "CONSUMED",
  "TRANSFERRED",
  "ADJUSTMENT",
] as const;

const SORT_OPTIONS = ["DATE_DESC", "DATE_ASC", "QTY_DESC"] as const;
const FUEL_TYPE_OPTIONS = ["ALL", "MGO", "VLSFO", "HSFO", "LNG", "OTHER"] as const;
const DATE_WINDOW_OPTIONS = [
  "ALL",
  "LAST_30",
  "THIS_YEAR",
  "NEXT_30",
  "NEXT_90",
] as const;
const CRITICAL_OPTIONS = ["ALL", "true"] as const;

export default function FuelByProjectScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]>(
    "DATE_DESC",
  );
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [eventFilter, setEventFilter] =
    useState<"ALL" | FuelEventType>("ALL");
  const [assetFilter, setAssetFilter] = useState("ALL");
  const [fuelTypeFilter, setFuelTypeFilter] =
    useState<"ALL" | FuelType>("ALL");
  const [dateWindow, setDateWindow] =
    useState<"ALL" | DateWindowFilter>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [criticalFilter, setCriticalFilter] =
    useState<(typeof CRITICAL_OPTIONS)[number]>("ALL");
  const debouncedSearch = useDebouncedValue(search, 180);
  const page = useFuelPageData(pid, {
    page: pageNumber,
    pageSize,
    sort: sortBy,
    search: debouncedSearch,
    eventType: eventFilter === "ALL" ? undefined : eventFilter,
    assetId: assetFilter === "ALL" ? undefined : assetFilter,
    fuelType: fuelTypeFilter === "ALL" ? undefined : fuelTypeFilter,
    dateWindow: dateWindow === "ALL" ? undefined : dateWindow,
    dateFrom,
    dateTo,
    hasCriticalGap: criticalFilter === "ALL" ? undefined : criticalFilter,
  });
  const [selectedFuel, setSelectedFuel] = useState<FuelDto | null>(null);
  const [showEventMenu, setShowEventMenu] = useState(false);
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  const [showFuelTypeMenu, setShowFuelTypeMenu] = useState(false);
  const [showDateWindowMenu, setShowDateWindowMenu] = useState(false);
  const [showDateRangeMenu, setShowDateRangeMenu] = useState(false);
  const [showCriticalMenu, setShowCriticalMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const summaryItems = [
    {
      label: "Events in scope",
      value: String(page.stats.total),
      helper: "tracked in this project",
      tone: "accent" as const,
    },
    {
      label: "Bunkered",
      value: String(page.stats.bunkered),
      helper: `${page.stats.bunkeredQty} ${page.stats.unit} total`,
      tone: "ok" as const,
    },
    {
      label: "Consumed",
      value: String(page.stats.consumed),
      helper: `${page.stats.consumedQty} ${page.stats.unit} total`,
      tone: page.stats.consumed > 0 ? ("warn" as const) : ("ok" as const),
    },
    {
      label: "Critical gaps",
      value: String(page.stats.critical),
      helper: "missing price or location",
      tone: page.stats.critical > 0 ? ("danger" as const) : ("ok" as const),
    },
  ];
  const { vessels } = useVessels(pid);

  return (
    <View className="gap-5 p-4 web:p-6">
      <View className="gap-4">
        <RegistryWorkspaceHeader
          title="Fuel"
          eyebrow="Project fuel registry"
          actions={
            <RegistryHeaderActionButton
              variant="soft"
              iconName="refresh-outline"
              onPress={page.refetch}
            >
              Refresh
            </RegistryHeaderActionButton>
          }
        />

        <RegistrySegmentedTabs
          tabs={[{ key: "overview", label: "Overview" }]}
          activeKey="overview"
          onChange={() => {}}
        />

        <RegistrySummaryStrip items={summaryItems} />
      </View>

      <FuelTable
        title="Fuel log"
        subtitleRight={`${page.pagination?.totalItems ?? page.list.length} events currently visible`}
        headerActions={
          <>
            <TableFilterSearch
              value={search}
              onChangeText={(value) => {
                setSearch(value);
                setPageNumber(1);
              }}
              placeholder="Search fuel logs..."
              open={showSearch}
              onOpenChange={setShowSearch}
            />

            <ToolbarSelect
              value={eventFilter}
              options={[...EVENT_OPTIONS]}
              open={showEventMenu}
              onToggle={() => setShowEventMenu((prev) => !prev)}
              onChange={(value) => {
                setEventFilter(value as "ALL" | FuelEventType);
                setPageNumber(1);
                setShowEventMenu(false);
              }}
              renderLabel={(value) =>
                value === "ALL"
                  ? "All events"
                  : value === "ADJUSTMENT"
                    ? "Adjustments"
                    : value.charAt(0) + value.slice(1).toLowerCase()
              }
              triggerIconName="filter-outline"
              minWidth={160}
            />

            <ToolbarSelect
              value={assetFilter}
              options={["ALL", ...vessels.map((vessel) => vessel.id)]}
              open={showAssetMenu}
              onToggle={() => setShowAssetMenu((prev) => !prev)}
              onChange={(value) => {
                setAssetFilter(value);
                setPageNumber(1);
                setShowAssetMenu(false);
              }}
              renderLabel={(value) => {
                if (value === "ALL") return "All vessels";
                return vessels.find((vessel) => vessel.id === value)?.name ?? "Vessel";
              }}
              triggerIconName="boat-outline"
              minWidth={170}
            />

            <ToolbarSelect
              value={fuelTypeFilter}
              options={[...FUEL_TYPE_OPTIONS]}
              open={showFuelTypeMenu}
              onToggle={() => setShowFuelTypeMenu((prev) => !prev)}
              onChange={(value) => {
                setFuelTypeFilter(value as "ALL" | FuelType);
                setPageNumber(1);
                setShowFuelTypeMenu(false);
              }}
              renderLabel={(value) => (value === "ALL" ? "All fuel" : value)}
              triggerIconName="water-outline"
              minWidth={132}
            />

            <ToolbarSelect
              value={dateWindow}
              options={[...DATE_WINDOW_OPTIONS]}
              open={showDateWindowMenu}
              onToggle={() => setShowDateWindowMenu((prev) => !prev)}
              onChange={(value) => {
                setDateWindow(value as "ALL" | DateWindowFilter);
                setDateFrom("");
                setDateTo("");
                setPageNumber(1);
                setShowDateWindowMenu(false);
              }}
              renderLabel={(value) =>
                value === "ALL"
                  ? "Any date"
                  : value === "LAST_30"
                    ? "Last 30 days"
                    : value === "THIS_YEAR"
                      ? "This year"
                      : value === "NEXT_30"
                        ? "Next 30 days"
                        : "Next 90 days"
              }
              triggerIconName="calendar-outline"
              minWidth={144}
            />

            <TableDateRangeFilter
              from={dateFrom}
              to={dateTo}
              open={showDateRangeMenu}
              onOpenChange={setShowDateRangeMenu}
              onFromChange={(value) => {
                setDateFrom(value);
                setDateWindow("ALL");
                setPageNumber(1);
              }}
              onToChange={(value) => {
                setDateTo(value);
                setDateWindow("ALL");
                setPageNumber(1);
              }}
              onClear={() => {
                setDateFrom("");
                setDateTo("");
                setPageNumber(1);
              }}
            />

            <ToolbarSelect
              value={criticalFilter}
              options={[...CRITICAL_OPTIONS]}
              open={showCriticalMenu}
              onToggle={() => setShowCriticalMenu((prev) => !prev)}
              onChange={(value) => {
                setCriticalFilter(value);
                setPageNumber(1);
                setShowCriticalMenu(false);
              }}
              renderLabel={(value) =>
                value === "ALL" ? "All records" : "Critical gaps"
              }
              triggerIconName="alert-circle-outline"
              minWidth={152}
            />

            <ToolbarSelect
              value={sortBy}
              options={[...SORT_OPTIONS]}
              open={showSortMenu}
              onToggle={() => setShowSortMenu((prev) => !prev)}
              onChange={(value) => {
                setSortBy(value);
                setPageNumber(1);
                setShowSortMenu(false);
              }}
              renderLabel={(value) =>
                value === "DATE_DESC"
                  ? "Latest first"
                  : value === "DATE_ASC"
                    ? "Oldest first"
                    : "Qty high-low"
              }
              triggerIconName="swap-vertical-outline"
              minWidth={152}
            />
          </>
        }
        data={page.list}
        isLoading={page.isLoading}
        error={page.error}
        onRetry={page.refetch}
        showVesselColumn
        selectedRowId={selectedFuel?.id ?? null}
        onRowPress={(row) => setSelectedFuel(row)}
        pagination={
          page.pagination
            ? {
                meta: page.pagination,
                onPageChange: setPageNumber,
                onPageSizeChange: (nextPageSize) => {
                  setPageSize(nextPageSize);
                  setPageNumber(1);
                },
              }
            : undefined
        }
      />

      {selectedFuel ? (
        <FuelQuickViewModal
          fuel={selectedFuel}
          projectId={pid}
          onClose={() => setSelectedFuel(null)}
        />
      ) : null}
    </View>
  );
}

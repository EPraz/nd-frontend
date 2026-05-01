import {
  TableFilterDateRange,
  TableFilterMenu,
  TableFilterOptionGroup,
  TableToolbarSearch,
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
  const activeFilterCount =
    (search ? 1 : 0) +
    (eventFilter !== "ALL" ? 1 : 0) +
    (assetFilter !== "ALL" ? 1 : 0) +
    (fuelTypeFilter !== "ALL" ? 1 : 0) +
    (dateWindow !== "ALL" || dateFrom || dateTo ? 1 : 0) +
    (criticalFilter !== "ALL" ? 1 : 0);

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

        <RegistrySummaryStrip items={summaryItems} loading={page.isLoading} />
      </View>

      <FuelTable
        title="Fuel log"
        subtitleRight={`${page.pagination?.totalItems ?? page.list.length} events currently visible`}
        headerActions={
          <>
            <TableToolbarSearch
              value={search}
              onChangeText={(value) => {
                setSearch(value);
                setPageNumber(1);
              }}
              placeholder="Search fuel logs..."
            />

            <TableFilterMenu
              title="Fuel logs"
              activeCount={activeFilterCount}
              onClear={() => {
                setSearch("");
                setEventFilter("ALL");
                setAssetFilter("ALL");
                setFuelTypeFilter("ALL");
                setDateWindow("ALL");
                setDateFrom("");
                setDateTo("");
                setCriticalFilter("ALL");
                setSortBy("DATE_DESC");
                setPageNumber(1);
              }}
            >
            <TableFilterOptionGroup
              label="Event type"
              value={eventFilter}
              options={[...EVENT_OPTIONS]}
              onChange={(value) => {
                setEventFilter(value as "ALL" | FuelEventType);
                setPageNumber(1);
              }}
              renderLabel={(value) =>
                value === "ALL"
                  ? "All events"
                  : value === "ADJUSTMENT"
                    ? "Adjustments"
                    : value.charAt(0) + value.slice(1).toLowerCase()
              }
            />

            <TableFilterOptionGroup
              label="Vessel"
              value={assetFilter}
              options={["ALL", ...vessels.map((vessel) => vessel.id)]}
              onChange={(value) => {
                setAssetFilter(value);
                setPageNumber(1);
              }}
              renderLabel={(value) => {
                if (value === "ALL") return "All vessels";
                return vessels.find((vessel) => vessel.id === value)?.name ?? "Vessel";
              }}
            />

            <TableFilterOptionGroup
              label="Fuel type"
              value={fuelTypeFilter}
              options={[...FUEL_TYPE_OPTIONS]}
              onChange={(value) => {
                setFuelTypeFilter(value as "ALL" | FuelType);
                setPageNumber(1);
              }}
              renderLabel={(value) => (value === "ALL" ? "All fuel" : value)}
            />

            <TableFilterOptionGroup
              label="Date preset"
              value={dateWindow}
              options={[...DATE_WINDOW_OPTIONS]}
              onChange={(value) => {
                setDateWindow(value as "ALL" | DateWindowFilter);
                setDateFrom("");
                setDateTo("");
                setPageNumber(1);
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
            />

            <TableFilterDateRange
              from={dateFrom}
              to={dateTo}
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

            <TableFilterOptionGroup
              label="Issue state"
              value={criticalFilter}
              options={[...CRITICAL_OPTIONS]}
              onChange={(value) => {
                setCriticalFilter(value);
                setPageNumber(1);
              }}
              renderLabel={(value) =>
                value === "ALL" ? "All records" : "Critical gaps"
              }
            />

            <TableFilterOptionGroup
              label="Sort"
              value={sortBy}
              options={[...SORT_OPTIONS]}
              onChange={(value) => {
                setSortBy(value as (typeof SORT_OPTIONS)[number]);
                setPageNumber(1);
              }}
              renderLabel={(value) =>
                value === "DATE_DESC"
                  ? "Latest first"
                  : value === "DATE_ASC"
                    ? "Oldest first"
                    : "Qty high-low"
              }
            />
            </TableFilterMenu>
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

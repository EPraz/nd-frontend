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
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { useVessels } from "@/src/features/vessels/core";
import { MaintenanceTable } from "../../components";
import { useMaintenancePageData } from "../../hooks";
import type {
  MaintenanceDto,
  MaintenancePriority,
  MaintenanceStatus,
} from "../../../shared/contracts";
import { MaintenanceQuickViewModal } from "../maintenanceQuickViewModal";

const STATUS_OPTIONS = ["ALL", "OPEN", "IN_PROGRESS", "DONE"] as const;
const PRIORITY_OPTIONS = ["ALL", "HIGH", "MEDIUM", "LOW"] as const;

const SORT_OPTIONS = ["DUE_ASC", "DUE_DESC", "TITLE_ASC"] as const;
const DATE_WINDOW_OPTIONS = ["ALL", "OVERDUE", "NEXT_30", "NEXT_90"] as const;

export default function MaintenanceByProjectScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]>(
    "DUE_ASC",
  );
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | MaintenanceStatus>("ALL");
  const [assetFilter, setAssetFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] =
    useState<"ALL" | MaintenancePriority>("ALL");
  const [dateWindow, setDateWindow] =
    useState<"ALL" | DateWindowFilter>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 180);
  const page = useMaintenancePageData(pid, {
    page: pageNumber,
    pageSize,
    sort: sortBy,
    search: debouncedSearch,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    assetId: assetFilter === "ALL" ? undefined : assetFilter,
    priority: priorityFilter === "ALL" ? undefined : priorityFilter,
    dateWindow: dateWindow === "ALL" ? undefined : dateWindow,
    dateFrom,
    dateTo,
  });
  const [selectedTask, setSelectedTask] = useState<MaintenanceDto | null>(null);
  const activeFilterCount =
    (search ? 1 : 0) +
    (statusFilter !== "ALL" ? 1 : 0) +
    (assetFilter !== "ALL" ? 1 : 0) +
    (priorityFilter !== "ALL" ? 1 : 0) +
    (dateWindow !== "ALL" || dateFrom || dateTo ? 1 : 0);

  const summaryItems = [
    {
      label: "Tasks in scope",
      value: String(page.stats.total),
      helper: "tracked in this project",
      tone: "accent" as const,
    },
    {
      label: "Open",
      value: String(page.stats.open),
      helper:
        page.stats.highPriorityOpen > 0
          ? `${page.stats.highPriorityOpen} high priority`
          : "pending action",
      tone: page.stats.open > 0 ? ("danger" as const) : ("ok" as const),
    },
    {
      label: "In progress",
      value: String(page.stats.inProgress),
      helper: "currently being worked",
      tone: page.stats.inProgress > 0 ? ("warn" as const) : ("ok" as const),
    },
    {
      label: "Completed",
      value: String(page.stats.done),
      helper: "finished tasks",
      tone: "ok" as const,
    },
  ];
  const { vessels } = useVessels(pid);

  return (
    <View className="gap-5 p-4 web:p-6">
      <View className="gap-4">
        <RegistryWorkspaceHeader
          title="Maintenance"
          eyebrow="Project maintenance registry"
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

      <MaintenanceTable
        title="Task queue"
        subtitleRight={
          page.pagination
            ? `${page.pagination.totalItems} tasks in scope`
            : `${page.list.length} tasks currently visible`
        }
        headerActions={
          <>
            <TableToolbarSearch
              value={search}
              onChangeText={(value) => {
                setSearch(value);
                setPageNumber(1);
              }}
              placeholder="Search task or vessel"
            />

            <TableFilterMenu
              title="Maintenance tasks"
              activeCount={activeFilterCount}
              onClear={() => {
                setSearch("");
                setStatusFilter("ALL");
                setAssetFilter("ALL");
                setPriorityFilter("ALL");
                setDateWindow("ALL");
                setDateFrom("");
                setDateTo("");
                setSortBy("DUE_ASC");
                setPageNumber(1);
              }}
            >
            <TableFilterOptionGroup
              label="Status"
              value={statusFilter}
              options={[...STATUS_OPTIONS]}
              onChange={(value) => {
                setStatusFilter(value as "ALL" | MaintenanceStatus);
                setPageNumber(1);
              }}
              renderLabel={(value) =>
                value === "ALL"
                  ? "All status"
                  : value === "IN_PROGRESS"
                    ? "In progress"
                    : value
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
              label="Priority"
              value={priorityFilter}
              options={[...PRIORITY_OPTIONS]}
              onChange={(value) => {
                setPriorityFilter(value as "ALL" | MaintenancePriority);
                setPageNumber(1);
              }}
              renderLabel={(value) =>
                value === "ALL" ? "All priority" : value
              }
            />

            <TableFilterOptionGroup
              label="Due date preset"
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
                  ? "Any due date"
                  : value === "OVERDUE"
                    ? "Overdue"
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
              label="Sort"
              value={sortBy}
              options={[...SORT_OPTIONS]}
              onChange={(value) => {
                setSortBy(value as (typeof SORT_OPTIONS)[number]);
                setPageNumber(1);
              }}
              renderLabel={(value) =>
                value === "DUE_ASC"
                  ? "Next due"
                  : value === "DUE_DESC"
                    ? "Latest due"
                    : "Title A-Z"
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
        selectedRowId={selectedTask?.id ?? null}
        onRowPress={(row) => setSelectedTask(row)}
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

      {selectedTask ? (
        <MaintenanceQuickViewModal
          task={selectedTask}
          projectId={pid}
          onClose={() => setSelectedTask(null)}
        />
      ) : null}
    </View>
  );
}

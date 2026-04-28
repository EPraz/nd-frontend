import type {
  DateWindowFilter,
  PaginationMetaDto,
} from "@/src/contracts/pagination.contract";
import { MaintenanceQuickViewModal } from "@/src/features/maintenance/core";
import { MaintenanceTable } from "@/src/features/maintenance/core/components";
import type {
  MaintenanceDto,
  MaintenancePriority,
  MaintenanceStatus,
} from "@/src/features/maintenance/shared/contracts";
import { useState } from "react";
import {
  type MaintenanceSortOption,
} from "./maintenanceByAssetWorkspace.helpers";
import { MaintenanceByAssetTableActions } from "./MaintenanceByAssetTableActions";

export function MaintenanceByAssetWorkspaceSection({
  projectId,
  list,
  isLoading,
  error,
  onRetry,
  pagination,
  onPageChange,
  onPageSizeChange,
  search,
  statusFilter,
  priorityFilter,
  dateWindow,
  dateFrom,
  dateTo,
  sortBy,
  onSearchChange,
  onStatusFilterChange,
  onPriorityFilterChange,
  onDateWindowChange,
  onDateFromChange,
  onDateToChange,
  onDateRangeClear,
  onSortChange,
}: {
  projectId: string;
  list: MaintenanceDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  pagination?: PaginationMetaDto | null;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  search: string;
  statusFilter: "ALL" | MaintenanceStatus;
  priorityFilter: "ALL" | MaintenancePriority;
  dateWindow: "ALL" | DateWindowFilter;
  dateFrom: string;
  dateTo: string;
  sortBy: MaintenanceSortOption;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: "ALL" | MaintenanceStatus) => void;
  onPriorityFilterChange: (value: "ALL" | MaintenancePriority) => void;
  onDateWindowChange: (value: "ALL" | DateWindowFilter) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onDateRangeClear: () => void;
  onSortChange: (sort: MaintenanceSortOption) => void;
}) {
  const [selectedTask, setSelectedTask] = useState<MaintenanceDto | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showDateWindowMenu, setShowDateWindowMenu] = useState(false);
  const [showDateRangeMenu, setShowDateRangeMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  return (
    <>
      <MaintenanceTable
        title="Vessel task queue"
        subtitleRight={`${pagination?.totalItems ?? list.length} tasks currently visible`}
        headerActions={
          <MaintenanceByAssetTableActions
            search={search}
            showSearch={showSearch}
            onSearchChange={onSearchChange}
            onSearchOpenChange={setShowSearch}
            filterStatus={statusFilter}
            priorityFilter={priorityFilter}
            dateWindow={dateWindow}
            dateFrom={dateFrom}
            dateTo={dateTo}
            sortBy={sortBy}
            showStatusMenu={showStatusMenu}
            showPriorityMenu={showPriorityMenu}
            showDateWindowMenu={showDateWindowMenu}
            showDateRangeMenu={showDateRangeMenu}
            showSortMenu={showSortMenu}
            onToggleStatusMenu={() => setShowStatusMenu((prev) => !prev)}
            onTogglePriorityMenu={() => setShowPriorityMenu((prev) => !prev)}
            onToggleDateWindowMenu={() => setShowDateWindowMenu((prev) => !prev)}
            onToggleDateRangeMenu={setShowDateRangeMenu}
            onToggleSortMenu={() => setShowSortMenu((prev) => !prev)}
            onFilterChange={(value) => {
              onStatusFilterChange(value);
              setShowStatusMenu(false);
            }}
            onPriorityFilterChange={(value) => {
              onPriorityFilterChange(value);
              setShowPriorityMenu(false);
            }}
            onDateWindowChange={(value) => {
              onDateWindowChange(value);
              setShowDateWindowMenu(false);
            }}
            onDateFromChange={onDateFromChange}
            onDateToChange={onDateToChange}
            onDateRangeClear={onDateRangeClear}
            onSortChange={(value) => {
              onSortChange(value);
              setShowSortMenu(false);
            }}
          />
        }
        data={list}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        showVesselColumn={false}
        selectedRowId={selectedTask?.id ?? null}
        onRowPress={(row) => setSelectedTask(row)}
        pagination={
          pagination
            ? {
                meta: pagination,
                onPageChange,
                onPageSizeChange,
              }
            : undefined
        }
      />

      {selectedTask ? (
        <MaintenanceQuickViewModal
          task={selectedTask}
          projectId={projectId}
          onClose={() => setSelectedTask(null)}
        />
      ) : null}
    </>
  );
}

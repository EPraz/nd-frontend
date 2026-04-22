import { MaintenanceQuickViewModal } from "@/src/features/maintenance/core";
import { MaintenanceTable } from "@/src/features/maintenance/core/components";
import type { MaintenanceDto } from "@/src/features/maintenance/shared/contracts";
import { useMemo, useState } from "react";
import {
  filterMaintenanceByStatus,
  type MaintenanceSortOption,
  type MaintenanceStatusFilter,
  sortMaintenance,
} from "./maintenanceByAssetWorkspace.helpers";
import { MaintenanceByAssetTableActions } from "./MaintenanceByAssetTableActions";

export function MaintenanceByAssetWorkspaceSection({
  projectId,
  list,
  isLoading,
  error,
  onRetry,
}: {
  projectId: string;
  list: MaintenanceDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const [selectedTask, setSelectedTask] = useState<MaintenanceDto | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [filterStatus, setFilterStatus] =
    useState<MaintenanceStatusFilter>("ALL");
  const [sortBy, setSortBy] = useState<MaintenanceSortOption>("DUE_ASC");

  const rows = useMemo(() => {
    return sortMaintenance(
      filterMaintenanceByStatus(list, filterStatus),
      sortBy,
    );
  }, [filterStatus, list, sortBy]);

  return (
    <>
      <MaintenanceTable
        title="Vessel task queue"
        subtitleRight={`${rows.length} tasks currently visible`}
        headerActions={
          <MaintenanceByAssetTableActions
            filterStatus={filterStatus}
            sortBy={sortBy}
            showStatusMenu={showStatusMenu}
            showSortMenu={showSortMenu}
            onToggleStatusMenu={() => setShowStatusMenu((prev) => !prev)}
            onToggleSortMenu={() => setShowSortMenu((prev) => !prev)}
            onFilterChange={(value) => {
              setFilterStatus(value);
              setShowStatusMenu(false);
            }}
            onSortChange={(value) => {
              setSortBy(value);
              setShowSortMenu(false);
            }}
          />
        }
        data={rows}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        showVesselColumn={false}
        selectedRowId={selectedTask?.id ?? null}
        onRowPress={(row) => setSelectedTask(row)}
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

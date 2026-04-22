import { ToolbarSelect } from "@/src/components/ui/forms/ToolbarSelect";
import type { MaintenanceStatus } from "@/src/features/maintenance/shared/contracts";
import type {
  MaintenanceSortOption,
  MaintenanceStatusFilter,
} from "./maintenanceByAssetWorkspace.helpers";

type Props = {
  filterStatus: MaintenanceStatusFilter;
  sortBy: MaintenanceSortOption;
  showStatusMenu: boolean;
  showSortMenu: boolean;
  onToggleStatusMenu: () => void;
  onToggleSortMenu: () => void;
  onFilterChange: (value: MaintenanceStatusFilter) => void;
  onSortChange: (value: MaintenanceSortOption) => void;
};

export function MaintenanceByAssetTableActions({
  filterStatus,
  sortBy,
  showStatusMenu,
  showSortMenu,
  onToggleStatusMenu,
  onToggleSortMenu,
  onFilterChange,
  onSortChange,
}: Props) {
  return (
    <>
      <ToolbarSelect
        value={filterStatus}
        options={["ALL", "OPEN", "IN_PROGRESS", "DONE", "OVERDUE"]}
        open={showStatusMenu}
        onToggle={onToggleStatusMenu}
        onChange={(value) => onFilterChange(value as MaintenanceStatusFilter)}
        renderLabel={(value) =>
          value === "ALL"
            ? "All status"
            : value === "IN_PROGRESS"
              ? "In progress"
              : value === "OVERDUE"
                ? "Overdue"
                : (value as MaintenanceStatus)
        }
        triggerIconName="filter-outline"
        minWidth={160}
      />

      <ToolbarSelect
        value={sortBy}
        options={["DUE_ASC", "DUE_DESC", "TITLE_ASC"]}
        open={showSortMenu}
        onToggle={onToggleSortMenu}
        onChange={(value) => onSortChange(value as MaintenanceSortOption)}
        renderLabel={(value) =>
          value === "DUE_ASC"
            ? "Next due"
            : value === "DUE_DESC"
              ? "Latest due"
              : "Title A-Z"
        }
        triggerIconName="swap-vertical-outline"
        minWidth={148}
      />
    </>
  );
}

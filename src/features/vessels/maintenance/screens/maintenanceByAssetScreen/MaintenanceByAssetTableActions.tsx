import { ToolbarSelect } from "@/src/components/ui/forms/ToolbarSelect";
import {
  TableDateRangeFilter,
  TableFilterSearch,
} from "@/src/components/ui/table";
import type { DateWindowFilter } from "@/src/contracts/pagination.contract";
import type {
  MaintenancePriority,
  MaintenanceStatus,
} from "@/src/features/maintenance/shared/contracts";
import type {
  MaintenanceSortOption,
} from "./maintenanceByAssetWorkspace.helpers";

const STATUS_OPTIONS = ["ALL", "OPEN", "IN_PROGRESS", "DONE"] as const;
const PRIORITY_OPTIONS = ["ALL", "HIGH", "MEDIUM", "LOW"] as const;
const DATE_WINDOW_OPTIONS = ["ALL", "OVERDUE", "NEXT_30", "NEXT_90"] as const;

type Props = {
  search: string;
  showSearch: boolean;
  filterStatus: "ALL" | MaintenanceStatus;
  priorityFilter: "ALL" | MaintenancePriority;
  dateWindow: "ALL" | DateWindowFilter;
  dateFrom: string;
  dateTo: string;
  sortBy: MaintenanceSortOption;
  showStatusMenu: boolean;
  showPriorityMenu: boolean;
  showDateWindowMenu: boolean;
  showDateRangeMenu: boolean;
  showSortMenu: boolean;
  onSearchChange: (value: string) => void;
  onSearchOpenChange: (open: boolean) => void;
  onToggleStatusMenu: () => void;
  onTogglePriorityMenu: () => void;
  onToggleDateWindowMenu: () => void;
  onToggleDateRangeMenu: (open: boolean) => void;
  onToggleSortMenu: () => void;
  onFilterChange: (value: "ALL" | MaintenanceStatus) => void;
  onPriorityFilterChange: (value: "ALL" | MaintenancePriority) => void;
  onDateWindowChange: (value: "ALL" | DateWindowFilter) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onDateRangeClear: () => void;
  onSortChange: (value: MaintenanceSortOption) => void;
};

export function MaintenanceByAssetTableActions({
  search,
  showSearch,
  filterStatus,
  priorityFilter,
  dateWindow,
  dateFrom,
  dateTo,
  sortBy,
  showStatusMenu,
  showPriorityMenu,
  showDateWindowMenu,
  showDateRangeMenu,
  showSortMenu,
  onSearchChange,
  onSearchOpenChange,
  onToggleStatusMenu,
  onTogglePriorityMenu,
  onToggleDateWindowMenu,
  onToggleDateRangeMenu,
  onToggleSortMenu,
  onFilterChange,
  onPriorityFilterChange,
  onDateWindowChange,
  onDateFromChange,
  onDateToChange,
  onDateRangeClear,
  onSortChange,
}: Props) {
  return (
    <>
      <TableFilterSearch
        value={search}
        onChangeText={onSearchChange}
        placeholder="Search task..."
        open={showSearch}
        onOpenChange={onSearchOpenChange}
      />

      <ToolbarSelect
        value={filterStatus}
        options={[...STATUS_OPTIONS]}
        open={showStatusMenu}
        onToggle={onToggleStatusMenu}
        onChange={(value) => onFilterChange(value as "ALL" | MaintenanceStatus)}
        renderLabel={(value) =>
          value === "ALL"
            ? "All status"
            : value === "IN_PROGRESS"
              ? "In progress"
              : value
        }
        triggerIconName="filter-outline"
        minWidth={160}
      />

      <TableDateRangeFilter
        from={dateFrom}
        to={dateTo}
        open={showDateRangeMenu}
        onOpenChange={onToggleDateRangeMenu}
        onFromChange={onDateFromChange}
        onToChange={onDateToChange}
        onClear={onDateRangeClear}
      />

      <ToolbarSelect
        value={priorityFilter}
        options={[...PRIORITY_OPTIONS]}
        open={showPriorityMenu}
        onToggle={onTogglePriorityMenu}
        onChange={(value) =>
          onPriorityFilterChange(value as "ALL" | MaintenancePriority)
        }
        renderLabel={(value) => (value === "ALL" ? "All priority" : value)}
        triggerIconName="flag-outline"
        minWidth={152}
      />

      <ToolbarSelect
        value={dateWindow}
        options={[...DATE_WINDOW_OPTIONS]}
        open={showDateWindowMenu}
        onToggle={onToggleDateWindowMenu}
        onChange={(value) =>
          onDateWindowChange(value as "ALL" | DateWindowFilter)
        }
        renderLabel={(value) =>
          value === "ALL"
            ? "Any due date"
            : value === "OVERDUE"
              ? "Overdue"
              : value === "NEXT_30"
                ? "Next 30 days"
                : "Next 90 days"
        }
        triggerIconName="calendar-outline"
        minWidth={154}
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

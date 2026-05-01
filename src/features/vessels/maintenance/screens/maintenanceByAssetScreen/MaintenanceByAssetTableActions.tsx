import {
  TableFilterDateRange,
  TableFilterMenu,
  TableFilterOptionGroup,
  TableToolbarSearch,
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
  filterStatus: "ALL" | MaintenanceStatus;
  priorityFilter: "ALL" | MaintenancePriority;
  dateWindow: "ALL" | DateWindowFilter;
  dateFrom: string;
  dateTo: string;
  sortBy: MaintenanceSortOption;
  onSearchChange: (value: string) => void;
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
  filterStatus,
  priorityFilter,
  dateWindow,
  dateFrom,
  dateTo,
  sortBy,
  onSearchChange,
  onFilterChange,
  onPriorityFilterChange,
  onDateWindowChange,
  onDateFromChange,
  onDateToChange,
  onDateRangeClear,
  onSortChange,
}: Props) {
  const activeFilterCount =
    (search ? 1 : 0) +
    (filterStatus !== "ALL" ? 1 : 0) +
    (priorityFilter !== "ALL" ? 1 : 0) +
    (dateWindow !== "ALL" || dateFrom || dateTo ? 1 : 0);

  return (
    <>
      <TableToolbarSearch
        value={search}
        onChangeText={onSearchChange}
        placeholder="Search task..."
      />

      <TableFilterMenu
        title="Maintenance work orders"
        activeCount={activeFilterCount}
        onClear={() => {
          onSearchChange("");
          onFilterChange("ALL");
          onPriorityFilterChange("ALL");
          onDateWindowChange("ALL");
          onDateRangeClear();
          onSortChange("DUE_ASC");
        }}
      >
      <TableFilterOptionGroup
        label="Status"
        value={filterStatus}
        options={[...STATUS_OPTIONS]}
        onChange={(value) => onFilterChange(value as "ALL" | MaintenanceStatus)}
        renderLabel={(value) =>
          value === "ALL"
            ? "All status"
            : value === "IN_PROGRESS"
              ? "In progress"
              : value
        }
      />

      <TableFilterOptionGroup
        label="Priority"
        value={priorityFilter}
        options={[...PRIORITY_OPTIONS]}
        onChange={(value) =>
          onPriorityFilterChange(value as "ALL" | MaintenancePriority)
        }
        renderLabel={(value) => (value === "ALL" ? "All priority" : value)}
      />

      <TableFilterOptionGroup
        label="Due date preset"
        value={dateWindow}
        options={[...DATE_WINDOW_OPTIONS]}
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
      />

      <TableFilterDateRange
        from={dateFrom}
        to={dateTo}
        onFromChange={onDateFromChange}
        onToChange={onDateToChange}
        onClear={onDateRangeClear}
      />

      <TableFilterOptionGroup
        label="Sort"
        value={sortBy}
        options={["DUE_ASC", "DUE_DESC", "TITLE_ASC"]}
        onChange={(value) => onSortChange(value as MaintenanceSortOption)}
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
  );
}

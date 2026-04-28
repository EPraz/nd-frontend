import { ToolbarSelect } from "@/src/components/ui/forms/ToolbarSelect";
import {
  TableDateRangeFilter,
  TableFilterSearch,
} from "@/src/components/ui/table";
import type { DateWindowFilter } from "@/src/contracts/pagination.contract";
import type {
  FuelEventType,
  FuelType,
} from "@/src/features/fuel/shared/contracts";
import type {
  FuelSortOption,
} from "./fuelByAssetWorkspace.helpers";

const EVENT_OPTIONS = [
  "ALL",
  "BUNKERED",
  "CONSUMED",
  "TRANSFERRED",
  "ADJUSTMENT",
] as const;
const FUEL_TYPE_OPTIONS = ["ALL", "MGO", "VLSFO", "HSFO", "LNG", "OTHER"] as const;
const DATE_WINDOW_OPTIONS = [
  "ALL",
  "LAST_30",
  "THIS_YEAR",
  "NEXT_30",
  "NEXT_90",
] as const;
const CRITICAL_OPTIONS = ["ALL", "true"] as const;

type Props = {
  search: string;
  showSearch: boolean;
  filterEventType: "ALL" | FuelEventType;
  fuelTypeFilter: "ALL" | FuelType;
  dateWindow: "ALL" | DateWindowFilter;
  dateFrom: string;
  dateTo: string;
  criticalFilter: "ALL" | "true";
  sortBy: FuelSortOption;
  showEventMenu: boolean;
  showFuelTypeMenu: boolean;
  showDateWindowMenu: boolean;
  showDateRangeMenu: boolean;
  showCriticalMenu: boolean;
  showSortMenu: boolean;
  onSearchChange: (value: string) => void;
  onSearchOpenChange: (open: boolean) => void;
  onToggleEventMenu: () => void;
  onToggleFuelTypeMenu: () => void;
  onToggleDateWindowMenu: () => void;
  onToggleDateRangeMenu: (open: boolean) => void;
  onToggleCriticalMenu: () => void;
  onToggleSortMenu: () => void;
  onFilterChange: (value: "ALL" | FuelEventType) => void;
  onFuelTypeFilterChange: (value: "ALL" | FuelType) => void;
  onDateWindowChange: (value: "ALL" | DateWindowFilter) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onDateRangeClear: () => void;
  onCriticalFilterChange: (value: "ALL" | "true") => void;
  onSortChange: (value: FuelSortOption) => void;
};

export function FuelByAssetTableActions({
  search,
  showSearch,
  filterEventType,
  fuelTypeFilter,
  dateWindow,
  dateFrom,
  dateTo,
  criticalFilter,
  sortBy,
  showEventMenu,
  showFuelTypeMenu,
  showDateWindowMenu,
  showDateRangeMenu,
  showCriticalMenu,
  showSortMenu,
  onSearchChange,
  onSearchOpenChange,
  onToggleEventMenu,
  onToggleFuelTypeMenu,
  onToggleDateWindowMenu,
  onToggleDateRangeMenu,
  onToggleCriticalMenu,
  onToggleSortMenu,
  onFilterChange,
  onFuelTypeFilterChange,
  onDateWindowChange,
  onDateFromChange,
  onDateToChange,
  onDateRangeClear,
  onCriticalFilterChange,
  onSortChange,
}: Props) {
  return (
    <>
      <TableFilterSearch
        value={search}
        onChangeText={onSearchChange}
        placeholder="Search fuel logs..."
        open={showSearch}
        onOpenChange={onSearchOpenChange}
      />

      <ToolbarSelect
        value={filterEventType}
        options={[...EVENT_OPTIONS]}
        open={showEventMenu}
        onToggle={onToggleEventMenu}
        onChange={(value) => onFilterChange(value as "ALL" | FuelEventType)}
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
        value={fuelTypeFilter}
        options={[...FUEL_TYPE_OPTIONS]}
        open={showFuelTypeMenu}
        onToggle={onToggleFuelTypeMenu}
        onChange={(value) => onFuelTypeFilterChange(value as "ALL" | FuelType)}
        renderLabel={(value) => (value === "ALL" ? "All fuel" : value)}
        triggerIconName="water-outline"
        minWidth={132}
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

      <ToolbarSelect
        value={criticalFilter}
        options={[...CRITICAL_OPTIONS]}
        open={showCriticalMenu}
        onToggle={onToggleCriticalMenu}
        onChange={(value) => onCriticalFilterChange(value)}
        renderLabel={(value) =>
          value === "ALL" ? "All records" : "Critical gaps"
        }
        triggerIconName="alert-circle-outline"
        minWidth={152}
      />

      <ToolbarSelect
        value={sortBy}
        options={["DATE_DESC", "DATE_ASC", "QTY_DESC"]}
        open={showSortMenu}
        onToggle={onToggleSortMenu}
        onChange={(value) => onSortChange(value as FuelSortOption)}
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
  );
}

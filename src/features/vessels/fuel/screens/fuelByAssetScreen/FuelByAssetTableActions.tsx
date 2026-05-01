import {
  TableFilterDateRange,
  TableFilterMenu,
  TableFilterOptionGroup,
  TableToolbarSearch,
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
  filterEventType: "ALL" | FuelEventType;
  fuelTypeFilter: "ALL" | FuelType;
  dateWindow: "ALL" | DateWindowFilter;
  dateFrom: string;
  dateTo: string;
  criticalFilter: "ALL" | "true";
  sortBy: FuelSortOption;
  onSearchChange: (value: string) => void;
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
  filterEventType,
  fuelTypeFilter,
  dateWindow,
  dateFrom,
  dateTo,
  criticalFilter,
  sortBy,
  onSearchChange,
  onFilterChange,
  onFuelTypeFilterChange,
  onDateWindowChange,
  onDateFromChange,
  onDateToChange,
  onDateRangeClear,
  onCriticalFilterChange,
  onSortChange,
}: Props) {
  const activeFilterCount =
    (search ? 1 : 0) +
    (filterEventType !== "ALL" ? 1 : 0) +
    (fuelTypeFilter !== "ALL" ? 1 : 0) +
    (dateWindow !== "ALL" || dateFrom || dateTo ? 1 : 0) +
    (criticalFilter !== "ALL" ? 1 : 0);

  return (
    <>
      <TableToolbarSearch
        value={search}
        onChangeText={onSearchChange}
        placeholder="Search fuel logs..."
      />

      <TableFilterMenu
        title="Fuel logs"
        activeCount={activeFilterCount}
        onClear={() => {
          onSearchChange("");
          onFilterChange("ALL");
          onFuelTypeFilterChange("ALL");
          onDateWindowChange("ALL");
          onDateRangeClear();
          onCriticalFilterChange("ALL");
          onSortChange("DATE_DESC");
        }}
      >
      <TableFilterOptionGroup
        label="Event type"
        value={filterEventType}
        options={[...EVENT_OPTIONS]}
        onChange={(value) => onFilterChange(value as "ALL" | FuelEventType)}
        renderLabel={(value) =>
          value === "ALL"
            ? "All events"
            : value === "ADJUSTMENT"
              ? "Adjustments"
              : value.charAt(0) + value.slice(1).toLowerCase()
        }
      />

      <TableFilterOptionGroup
        label="Fuel type"
        value={fuelTypeFilter}
        options={[...FUEL_TYPE_OPTIONS]}
        onChange={(value) => onFuelTypeFilterChange(value as "ALL" | FuelType)}
        renderLabel={(value) => (value === "ALL" ? "All fuel" : value)}
      />

      <TableFilterOptionGroup
        label="Date preset"
        value={dateWindow}
        options={[...DATE_WINDOW_OPTIONS]}
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
      />

      <TableFilterDateRange
        from={dateFrom}
        to={dateTo}
        onFromChange={onDateFromChange}
        onToChange={onDateToChange}
        onClear={onDateRangeClear}
      />

      <TableFilterOptionGroup
        label="Issue state"
        value={criticalFilter}
        options={[...CRITICAL_OPTIONS]}
        onChange={(value) => onCriticalFilterChange(value)}
        renderLabel={(value) =>
          value === "ALL" ? "All records" : "Critical gaps"
        }
      />

      <TableFilterOptionGroup
        label="Sort"
        value={sortBy}
        options={["DATE_DESC", "DATE_ASC", "QTY_DESC"]}
        onChange={(value) => onSortChange(value as FuelSortOption)}
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
  );
}

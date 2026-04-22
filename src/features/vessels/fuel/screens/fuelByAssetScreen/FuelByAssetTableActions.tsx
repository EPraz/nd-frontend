import { ToolbarSelect } from "@/src/components/ui/forms/ToolbarSelect";
import type {
  FuelEventFilter,
  FuelSortOption,
} from "./fuelByAssetWorkspace.helpers";

type Props = {
  filterEventType: FuelEventFilter;
  sortBy: FuelSortOption;
  showEventMenu: boolean;
  showSortMenu: boolean;
  onToggleEventMenu: () => void;
  onToggleSortMenu: () => void;
  onFilterChange: (value: FuelEventFilter) => void;
  onSortChange: (value: FuelSortOption) => void;
};

export function FuelByAssetTableActions({
  filterEventType,
  sortBy,
  showEventMenu,
  showSortMenu,
  onToggleEventMenu,
  onToggleSortMenu,
  onFilterChange,
  onSortChange,
}: Props) {
  return (
    <>
      <ToolbarSelect
        value={filterEventType}
        options={["ALL", "BUNKERED", "CONSUMED", "TRANSFERRED", "ADJUSTMENT"]}
        open={showEventMenu}
        onToggle={onToggleEventMenu}
        onChange={(value) => onFilterChange(value as FuelEventFilter)}
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

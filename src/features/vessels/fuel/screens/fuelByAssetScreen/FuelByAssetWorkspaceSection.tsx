import type {
  DateWindowFilter,
  PaginationMetaDto,
} from "@/src/contracts/pagination.contract";
import { FuelQuickViewModal } from "@/src/features/fuel/core";
import { FuelTable } from "@/src/features/fuel/core/components";
import type {
  FuelDto,
  FuelEventType,
  FuelType,
} from "@/src/features/fuel/shared/contracts";
import { useState } from "react";
import {
  type FuelSortOption,
} from "./fuelByAssetWorkspace.helpers";
import { FuelByAssetTableActions } from "./FuelByAssetTableActions";

export function FuelByAssetWorkspaceSection({
  projectId,
  list,
  isLoading,
  error,
  onRetry,
  pagination,
  onPageChange,
  onPageSizeChange,
  sortBy,
  search,
  eventFilter,
  fuelTypeFilter,
  dateWindow,
  dateFrom,
  dateTo,
  criticalFilter,
  onSearchChange,
  onEventFilterChange,
  onFuelTypeFilterChange,
  onDateWindowChange,
  onDateFromChange,
  onDateToChange,
  onDateRangeClear,
  onCriticalFilterChange,
  onSortChange,
}: {
  projectId: string;
  list: FuelDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  pagination?: PaginationMetaDto | null;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  sortBy: FuelSortOption;
  search: string;
  eventFilter: "ALL" | FuelEventType;
  fuelTypeFilter: "ALL" | FuelType;
  dateWindow: "ALL" | DateWindowFilter;
  dateFrom: string;
  dateTo: string;
  criticalFilter: "ALL" | "true";
  onSearchChange: (value: string) => void;
  onEventFilterChange: (value: "ALL" | FuelEventType) => void;
  onFuelTypeFilterChange: (value: "ALL" | FuelType) => void;
  onDateWindowChange: (value: "ALL" | DateWindowFilter) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onDateRangeClear: () => void;
  onCriticalFilterChange: (value: "ALL" | "true") => void;
  onSortChange: (sort: FuelSortOption) => void;
}) {
  const [selectedFuel, setSelectedFuel] = useState<FuelDto | null>(null);

  return (
    <>
      <FuelTable
        title="Vessel fuel log"
        subtitleRight={`${pagination?.totalItems ?? list.length} events currently visible`}
        headerActions={
          <FuelByAssetTableActions
            search={search}
            onSearchChange={onSearchChange}
            filterEventType={eventFilter}
            fuelTypeFilter={fuelTypeFilter}
            dateWindow={dateWindow}
            dateFrom={dateFrom}
            dateTo={dateTo}
            criticalFilter={criticalFilter}
            sortBy={sortBy}
            onFilterChange={onEventFilterChange}
            onFuelTypeFilterChange={onFuelTypeFilterChange}
            onDateWindowChange={onDateWindowChange}
            onDateFromChange={onDateFromChange}
            onDateToChange={onDateToChange}
            onDateRangeClear={onDateRangeClear}
            onCriticalFilterChange={onCriticalFilterChange}
            onSortChange={onSortChange}
          />
        }
        data={list}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        showVesselColumn={false}
        selectedRowId={selectedFuel?.id ?? null}
        onRowPress={(row) => setSelectedFuel(row)}
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

      {selectedFuel ? (
        <FuelQuickViewModal
          fuel={selectedFuel}
          projectId={projectId}
          onClose={() => setSelectedFuel(null)}
        />
      ) : null}
    </>
  );
}

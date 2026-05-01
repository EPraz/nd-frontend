import {
  TableFilterDateRange,
  TableFilterMenu,
  TableFilterOptionGroup,
  TableToolbarSearch,
} from "@/src/components/ui/table";
import type { PaginationMetaDto } from "@/src/contracts/pagination.contract";
import {
  CrewQuickViewModal,
  CrewTable,
  type CrewDto,
  type CrewSortOption,
} from "@/src/features/crew/core";
import { useState } from "react";

const SORT_OPTIONS: CrewSortOption[] = [
  "ACTIVE_FIRST",
  "NAME_ASC",
  "NAME_DESC",
];
const STATUS_FILTERS = ["ALL", "ACTIVE", "INACTIVE"] as const;
const DEPARTMENT_FILTERS = [
  "ALL",
  "DECK",
  "ENGINE",
  "ELECTRICAL",
  "CATERING",
  "OTHER",
] as const;
const MEDICAL_FILTERS = ["ALL", "VALID", "ATTENTION", "UNKNOWN"] as const;
const DATE_WINDOW_FILTERS = ["ALL", "OVERDUE", "NEXT_30", "NEXT_90"] as const;

export function CrewByAssetWorkspaceSection({
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
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  medicalFilter,
  onMedicalFilterChange,
  dateWindow,
  dateFrom,
  dateTo,
  onDateWindowChange,
  onDateFromChange,
  onDateToChange,
  onDateRangeClear,
  onSortChange,
}: {
  projectId: string;
  list: CrewDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  pagination: PaginationMetaDto | null;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  sortBy: CrewSortOption;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (value: string) => void;
  medicalFilter: string;
  onMedicalFilterChange: (value: string) => void;
  dateWindow: string;
  dateFrom: string;
  dateTo: string;
  onDateWindowChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onDateRangeClear: () => void;
  onSortChange: (sort: CrewSortOption) => void;
}) {
  const [selectedCrew, setSelectedCrew] = useState<CrewDto | null>(null);
  const activeFilterCount =
    (search ? 1 : 0) +
    (statusFilter !== "ALL" ? 1 : 0) +
    (departmentFilter !== "ALL" ? 1 : 0) +
    (medicalFilter !== "ALL" ? 1 : 0) +
    (dateWindow !== "ALL" || dateFrom || dateTo ? 1 : 0);

  return (
    <>
      <CrewTable
        projectId={projectId}
        title="Vessel roster"
        subtitleRight={
          pagination
            ? `${pagination.totalItems} crew in scope`
            : `${list.length} crew currently visible`
        }
        headerActions={
          <>
            <TableToolbarSearch
              value={search}
              onChangeText={onSearchChange}
              placeholder="Search crew, rank, email..."
            />

            <TableFilterMenu
              title="Vessel roster"
              activeCount={activeFilterCount}
              onClear={() => {
                onSearchChange("");
                onStatusFilterChange("ALL");
                onDepartmentFilterChange("ALL");
                onMedicalFilterChange("ALL");
                onDateWindowChange("ALL");
                onDateRangeClear();
                onSortChange("ACTIVE_FIRST");
              }}
            >
            <TableFilterOptionGroup
              label="Status"
              value={statusFilter}
              options={[...STATUS_FILTERS]}
              onChange={onStatusFilterChange}
              renderLabel={(value) =>
                value === "ALL" ? "All status" : value.toLowerCase()
              }
            />

            <TableFilterOptionGroup
              label="Department"
              value={departmentFilter}
              options={[...DEPARTMENT_FILTERS]}
              onChange={onDepartmentFilterChange}
              renderLabel={(value) =>
                value === "ALL" ? "All departments" : value.toLowerCase()
              }
            />

            <TableFilterOptionGroup
              label="Medical"
              value={medicalFilter}
              options={[...MEDICAL_FILTERS]}
              onChange={onMedicalFilterChange}
              renderLabel={(value) =>
                value === "ALL" ? "All medical" : value.toLowerCase()
              }
            />

            <TableFilterOptionGroup
              label="Rotation"
              value={dateWindow}
              options={[...DATE_WINDOW_FILTERS]}
              onChange={onDateWindowChange}
              renderLabel={(value) =>
                value === "ALL"
                  ? "Any rotation"
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
              label="Rotation range"
            />

            <TableFilterOptionGroup<CrewSortOption>
              label="Sort"
              value={sortBy}
              options={SORT_OPTIONS}
              onChange={onSortChange}
              renderLabel={(value) =>
                value === "ACTIVE_FIRST"
                  ? "Active first"
                  : value === "NAME_ASC"
                    ? "A-Z"
                    : "Z-A"
              }
            />
            </TableFilterMenu>
          </>
        }
        data={list}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        showVesselColumn={false}
        selectedRowId={selectedCrew?.id ?? null}
        onRowPress={(row) => setSelectedCrew(row)}
        sortBy={sortBy}
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

      {selectedCrew ? (
        <CrewQuickViewModal
          crew={selectedCrew}
          projectId={projectId}
          onClose={() => setSelectedCrew(null)}
        />
      ) : null}
    </>
  );
}

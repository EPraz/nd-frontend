import { ToolbarSelect } from "@/src/components/ui/forms/ToolbarSelect";
import {
  TableDateRangeFilter,
  TableFilterSearch,
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
  const [showSearch, setShowSearch] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showDepartmentMenu, setShowDepartmentMenu] = useState(false);
  const [showMedicalMenu, setShowMedicalMenu] = useState(false);
  const [showDateWindowMenu, setShowDateWindowMenu] = useState(false);
  const [showDateRangeMenu, setShowDateRangeMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

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
            <TableFilterSearch
              value={search}
              onChangeText={onSearchChange}
              placeholder="Search crew, rank, email..."
              open={showSearch}
              onOpenChange={setShowSearch}
              minWidth={300}
            />

            <ToolbarSelect
              value={statusFilter}
              options={[...STATUS_FILTERS]}
              open={showStatusMenu}
              onToggle={() => setShowStatusMenu((prev) => !prev)}
              onChange={(value) => {
                onStatusFilterChange(value);
                setShowStatusMenu(false);
              }}
              renderLabel={(value) =>
                value === "ALL" ? "All status" : value.toLowerCase()
              }
              triggerIconName="filter-outline"
              minWidth={150}
            />

            <ToolbarSelect
              value={departmentFilter}
              options={[...DEPARTMENT_FILTERS]}
              open={showDepartmentMenu}
              onToggle={() => setShowDepartmentMenu((prev) => !prev)}
              onChange={(value) => {
                onDepartmentFilterChange(value);
                setShowDepartmentMenu(false);
              }}
              renderLabel={(value) =>
                value === "ALL" ? "All departments" : value.toLowerCase()
              }
              triggerIconName="people-outline"
              minWidth={176}
            />

            <ToolbarSelect
              value={medicalFilter}
              options={[...MEDICAL_FILTERS]}
              open={showMedicalMenu}
              onToggle={() => setShowMedicalMenu((prev) => !prev)}
              onChange={(value) => {
                onMedicalFilterChange(value);
                setShowMedicalMenu(false);
              }}
              renderLabel={(value) =>
                value === "ALL" ? "All medical" : value.toLowerCase()
              }
              triggerIconName="medkit-outline"
              minWidth={154}
            />

            <ToolbarSelect
              value={dateWindow}
              options={[...DATE_WINDOW_FILTERS]}
              open={showDateWindowMenu}
              onToggle={() => setShowDateWindowMenu((prev) => !prev)}
              onChange={(value) => {
                onDateWindowChange(value);
                setShowDateWindowMenu(false);
              }}
              renderLabel={(value) =>
                value === "ALL"
                  ? "Any rotation"
                  : value === "OVERDUE"
                    ? "Overdue"
                    : value === "NEXT_30"
                      ? "Next 30 days"
                      : "Next 90 days"
              }
              triggerIconName="calendar-outline"
              minWidth={162}
            />

            <TableDateRangeFilter
              from={dateFrom}
              to={dateTo}
              open={showDateRangeMenu}
              onOpenChange={setShowDateRangeMenu}
              onFromChange={onDateFromChange}
              onToChange={onDateToChange}
              onClear={onDateRangeClear}
              label="Rotation range"
            />

            <ToolbarSelect
              value={sortBy}
              options={SORT_OPTIONS}
              open={showSortMenu}
              onToggle={() => setShowSortMenu((prev) => !prev)}
              onChange={(value) => {
                onSortChange(value);
                setShowSortMenu(false);
              }}
              renderLabel={(value) =>
                value === "ACTIVE_FIRST"
                  ? "Active first"
                  : value === "NAME_ASC"
                    ? "A-Z"
                    : "Z-A"
              }
              triggerIconName="swap-vertical-outline"
              minWidth={146}
            />
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

import {
  TableFilterMenu,
  TableFilterOptionGroup,
  TableToolbarSearch,
} from "@/src/components/ui/table";
import type { AssetDto } from "@/src/contracts/assets.contract";
import type { PaginationMetaDto } from "@/src/contracts/pagination.contract";
import { useState } from "react";
import { VesselsTable } from "../../components/vesselTable/VesselsTable";
import type { VesselsSortKey } from "../../hooks/useVesselsPageData";
import VesselQuickViewModal from "../vesselQuickViewModal/VesselQuickViewModal";

type Props = {
  projectId: string;
  list: AssetDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  pagination: PaginationMetaDto | null;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  sortBy: VesselsSortKey;
  onSortChange: (sort: VesselsSortKey) => void;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  profileFilter: string;
  onProfileFilterChange: (value: string) => void;
};

const STATUS_FILTERS = ["ALL", "ACTIVE", "INACTIVE", "ARCHIVED"] as const;
const PROFILE_FILTERS = ["ALL", "READY", "MISSING_PROFILE", "MISSING_FLAG"] as const;

export function VesselsOverviewWorkspaceSection({
  projectId,
  list,
  isLoading,
  error,
  onRetry,
  pagination,
  onPageChange,
  onPageSizeChange,
  sortBy,
  onSortChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  profileFilter,
  onProfileFilterChange,
}: Props) {
  const [selectedVessel, setSelectedVessel] = useState<AssetDto | null>(null);
  const activeFilterCount =
    (search ? 1 : 0) +
    (statusFilter !== "ALL" ? 1 : 0) +
    (profileFilter !== "ALL" ? 1 : 0);

  return (
    <>
      <VesselsTable
        projectId={projectId}
        title="Fleet registry"
        subtitleRight={
          pagination
            ? `${pagination.totalItems} vessels in scope`
            : `${list.length} vessels currently visible`
        }
        headerActions={
          <>
            <TableToolbarSearch
              value={search}
              onChangeText={(value) => onSearchChange(value)}
              placeholder="Search vessel, IMO, license..."
            />

            <TableFilterMenu
              title="Fleet registry"
              activeCount={activeFilterCount}
              onClear={() => {
                onSearchChange("");
                onStatusFilterChange("ALL");
                onProfileFilterChange("ALL");
                onSortChange("NAME_ASC");
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
              label="Profile"
              value={profileFilter}
              options={[...PROFILE_FILTERS]}
              onChange={onProfileFilterChange}
              renderLabel={(value) =>
                value === "ALL"
                  ? "All profiles"
                  : value === "MISSING_PROFILE"
                    ? "Missing profile"
                    : value === "MISSING_FLAG"
                      ? "Missing flag"
                      : "Ready"
              }
            />

            <TableFilterOptionGroup<VesselsSortKey>
              label="Sort"
              value={sortBy}
              options={["NAME_ASC", "NAME_DESC"]}
              onChange={onSortChange}
              renderLabel={(value) => (value === "NAME_DESC" ? "Z-A" : "A-Z")}
            />
            </TableFilterMenu>
          </>
        }
        data={list}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
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
        selectedRowId={selectedVessel?.id ?? null}
        onRowPress={(row) => setSelectedVessel(row)}
      />

      {selectedVessel ? (
        <VesselQuickViewModal
          vessel={selectedVessel}
          onClose={() => setSelectedVessel(null)}
          projectId={projectId}
        />
      ) : null}
    </>
  );
}

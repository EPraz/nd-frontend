import { ToolbarSelect } from "@/src/components/ui/forms/ToolbarSelect";
import { TableFilterSearch } from "@/src/components/ui/table";
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
  const [showSearch, setShowSearch] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

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
            <TableFilterSearch
              value={search}
              onChangeText={onSearchChange}
              placeholder="Search vessel, IMO, license..."
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
              value={profileFilter}
              options={[...PROFILE_FILTERS]}
              open={showProfileMenu}
              onToggle={() => setShowProfileMenu((prev) => !prev)}
              onChange={(value) => {
                onProfileFilterChange(value);
                setShowProfileMenu(false);
              }}
              renderLabel={(value) =>
                value === "ALL"
                  ? "All profiles"
                  : value === "MISSING_PROFILE"
                    ? "Missing profile"
                    : value === "MISSING_FLAG"
                      ? "Missing flag"
                      : "Ready"
              }
              triggerIconName="flag-outline"
              minWidth={172}
            />

            <ToolbarSelect
              value={sortBy}
              options={["NAME_ASC", "NAME_DESC"]}
              open={showSortMenu}
              onToggle={() => setShowSortMenu((prev) => !prev)}
              onChange={(value) => {
                onSortChange(value);
                setShowSortMenu(false);
              }}
              renderLabel={(value) => (value === "NAME_DESC" ? "Z-A" : "A-Z")}
              triggerIconName="swap-vertical-outline"
              minWidth={112}
            />
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

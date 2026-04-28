import { ToolbarSelect } from "@/src/components/ui/forms/ToolbarSelect";
import { TableFilterSearch } from "@/src/components/ui/table";
import type { AssetDto } from "@/src/contracts/assets.contract";
import { humanizeTechnicalLabel } from "@/src/helpers";
import type { CrewRequirementStatus } from "../contracts";
import type {
  CrewCertificateRequirementFilter,
  CrewCertificateSortOption,
} from "./crewCertificatesProject.constants";
import {
  CREW_CERTIFICATE_REQUIREMENT_FILTERS,
  CREW_CERTIFICATE_SORT_OPTIONS,
} from "./crewCertificatesProject.constants";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  showSearch: boolean;
  onSearchOpenChange: (open: boolean) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  showStatusMenu: boolean;
  onToggleStatusMenu: () => void;
  assetFilter?: string;
  vessels?: AssetDto[];
  onAssetFilterChange?: (value: string) => void;
  showAssetMenu?: boolean;
  onToggleAssetMenu?: () => void;
  crewStateFilter: string;
  onCrewStateFilterChange: (value: string) => void;
  showCrewStateMenu: boolean;
  onToggleCrewStateMenu: () => void;
  sortBy: CrewCertificateSortOption;
  onSortChange: (value: CrewCertificateSortOption) => void;
  showSortMenu: boolean;
  onToggleSortMenu: () => void;
};

function renderFilterLabel(value: "ALL" | CrewRequirementStatus) {
  if (value === "ALL") return "All status";
  return humanizeTechnicalLabel(value);
}

function renderSortLabel(value: CrewCertificateSortOption) {
  switch (value) {
    case "CREW_ASC":
      return "Crew A-Z";
    case "CREW_DESC":
      return "Crew Z-A";
    case "CERT_ASC":
      return "Certificate A-Z";
    case "PRIORITY":
    default:
      return "Priority first";
  }
}

export function CrewCertificatesProjectTableActions({
  search,
  onSearchChange,
  showSearch,
  onSearchOpenChange,
  statusFilter,
  onStatusFilterChange,
  showStatusMenu,
  onToggleStatusMenu,
  assetFilter,
  vessels,
  onAssetFilterChange,
  showAssetMenu,
  onToggleAssetMenu,
  crewStateFilter,
  onCrewStateFilterChange,
  showCrewStateMenu,
  onToggleCrewStateMenu,
  sortBy,
  onSortChange,
  showSortMenu,
  onToggleSortMenu,
}: Props) {
  return (
    <>
      <TableFilterSearch
        value={search}
        onChangeText={onSearchChange}
        placeholder="Search crew or certificate..."
        open={showSearch}
        onOpenChange={onSearchOpenChange}
        minWidth={300}
      />

      <ToolbarSelect
        value={statusFilter as CrewCertificateRequirementFilter}
        options={[...CREW_CERTIFICATE_REQUIREMENT_FILTERS]}
        open={showStatusMenu}
        onToggle={onToggleStatusMenu}
        onChange={onStatusFilterChange}
        renderLabel={renderFilterLabel}
        triggerIconName="filter-outline"
        minWidth={170}
      />

      {assetFilter && vessels && onAssetFilterChange && onToggleAssetMenu ? (
        <ToolbarSelect
          value={assetFilter}
          options={["ALL", ...vessels.map((vessel) => vessel.id)]}
          open={Boolean(showAssetMenu)}
          onToggle={onToggleAssetMenu}
          onChange={onAssetFilterChange}
          renderLabel={(value) => {
            if (value === "ALL") return "All vessels";
            return (
              vessels.find((vessel) => vessel.id === value)?.name ?? "Vessel"
            );
          }}
          triggerIconName="boat-outline"
          minWidth={170}
        />
      ) : null}

      <ToolbarSelect
        value={crewStateFilter}
        options={["ALL", "ACTIVE", "INACTIVE"]}
        open={showCrewStateMenu}
        onToggle={onToggleCrewStateMenu}
        onChange={onCrewStateFilterChange}
        renderLabel={(value) =>
          value === "ALL" ? "All crew state" : humanizeTechnicalLabel(value)
        }
        triggerIconName="people-outline"
        minWidth={166}
      />

      <ToolbarSelect
        value={sortBy}
        options={[...CREW_CERTIFICATE_SORT_OPTIONS]}
        open={showSortMenu}
        onToggle={onToggleSortMenu}
        onChange={onSortChange}
        renderLabel={renderSortLabel}
        triggerIconName="swap-vertical-outline"
        minWidth={150}
      />
    </>
  );
}

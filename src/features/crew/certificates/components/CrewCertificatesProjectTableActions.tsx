import {
  TableFilterMenu,
  TableFilterOptionGroup,
  TableToolbarSearch,
} from "@/src/components/ui/table";
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
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  assetFilter?: string;
  vessels?: AssetDto[];
  onAssetFilterChange?: (value: string) => void;
  crewStateFilter: string;
  onCrewStateFilterChange: (value: string) => void;
  sortBy: CrewCertificateSortOption;
  onSortChange: (value: CrewCertificateSortOption) => void;
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
  statusFilter,
  onStatusFilterChange,
  assetFilter,
  vessels,
  onAssetFilterChange,
  crewStateFilter,
  onCrewStateFilterChange,
  sortBy,
  onSortChange,
}: Props) {
  const activeFilterCount =
    (search ? 1 : 0) +
    (statusFilter !== "ALL" ? 1 : 0) +
    (assetFilter && assetFilter !== "ALL" ? 1 : 0) +
    (crewStateFilter !== "ALL" ? 1 : 0);

  return (
    <>
      <TableToolbarSearch
        value={search}
        onChangeText={onSearchChange}
        placeholder="Search crew or certificate..."
      />

      <TableFilterMenu
        title="Crew certificate requirements"
        activeCount={activeFilterCount}
        onClear={() => {
          onSearchChange("");
          onStatusFilterChange("ALL");
          onAssetFilterChange?.("ALL");
          onCrewStateFilterChange("ALL");
          onSortChange("PRIORITY");
        }}
      >
      <TableFilterOptionGroup
        label="Requirement status"
        value={statusFilter as CrewCertificateRequirementFilter}
        options={[...CREW_CERTIFICATE_REQUIREMENT_FILTERS]}
        onChange={onStatusFilterChange}
        renderLabel={renderFilterLabel}
      />

      {assetFilter && vessels && onAssetFilterChange ? (
        <TableFilterOptionGroup
          label="Vessel"
          value={assetFilter}
          options={["ALL", ...vessels.map((vessel) => vessel.id)]}
          onChange={onAssetFilterChange}
          renderLabel={(value) => {
            if (value === "ALL") return "All vessels";
            return (
              vessels.find((vessel) => vessel.id === value)?.name ?? "Vessel"
            );
          }}
        />
      ) : null}

      <TableFilterOptionGroup
        label="Crew state"
        value={crewStateFilter}
        options={["ALL", "ACTIVE", "INACTIVE"]}
        onChange={onCrewStateFilterChange}
        renderLabel={(value) =>
          value === "ALL" ? "All crew state" : humanizeTechnicalLabel(value)
        }
      />

      <TableFilterOptionGroup
        label="Sort"
        value={sortBy}
        options={[...CREW_CERTIFICATE_SORT_OPTIONS]}
        onChange={onSortChange}
        renderLabel={renderSortLabel}
      />
      </TableFilterMenu>
    </>
  );
}

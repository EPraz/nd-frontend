import { ToolbarSelect } from "@/src/components/ui/forms/ToolbarSelect";
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
  statusFilter: CrewCertificateRequirementFilter;
  onStatusFilterChange: (value: CrewCertificateRequirementFilter) => void;
  showStatusMenu: boolean;
  onToggleStatusMenu: () => void;
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
  statusFilter,
  onStatusFilterChange,
  showStatusMenu,
  onToggleStatusMenu,
  sortBy,
  onSortChange,
  showSortMenu,
  onToggleSortMenu,
}: Props) {
  return (
    <>
      <ToolbarSelect
        value={statusFilter}
        options={[...CREW_CERTIFICATE_REQUIREMENT_FILTERS]}
        open={showStatusMenu}
        onToggle={onToggleStatusMenu}
        onChange={onStatusFilterChange}
        renderLabel={renderFilterLabel}
        minWidth={170}
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

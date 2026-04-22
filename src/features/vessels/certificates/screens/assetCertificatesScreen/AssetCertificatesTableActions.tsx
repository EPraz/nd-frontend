import { Button } from "@/src/components/ui/button/Button";
import { ToolbarSelect } from "@/src/components/ui/forms/ToolbarSelect";
import { humanizeTechnicalLabel } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import type {
  CertificateStatus,
  RequirementStatus,
} from "@/src/features/certificates/shared";
import type { AssetCertificatesWorkspaceTab } from "../../assetCertificatesWorkspaceTabs";
import {
  ASSET_RECORD_STATUS_FILTERS,
  ASSET_REQUIREMENT_FILTERS,
} from "./assetCertificates.constants";

type Props = {
  activeTab: AssetCertificatesWorkspaceTab;
  requirementFilter: "ALL" | RequirementStatus;
  recordStatusFilter: "ALL" | CertificateStatus;
  showStatusMenu: boolean;
  onToggleStatusMenu: () => void;
  onRequirementFilterChange: (value: "ALL" | RequirementStatus) => void;
  onRecordStatusFilterChange: (value: "ALL" | CertificateStatus) => void;
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onReset: () => void;
};

export function AssetCertificatesTableActions({
  activeTab,
  requirementFilter,
  recordStatusFilter,
  showStatusMenu,
  onToggleStatusMenu,
  onRequirementFilterChange,
  onRecordStatusFilterChange,
  isExpanded,
  onExpandedChange,
  onReset,
}: Props) {
  return (
    <>
      <ToolbarSelect
        value={activeTab === "requirements" ? requirementFilter : recordStatusFilter}
        options={
          activeTab === "requirements"
            ? ASSET_REQUIREMENT_FILTERS
            : ASSET_RECORD_STATUS_FILTERS
        }
        open={showStatusMenu}
        onToggle={onToggleStatusMenu}
        onChange={(value) => {
          if (activeTab === "requirements") {
            onRequirementFilterChange(value as "ALL" | RequirementStatus);
            return;
          }

          onRecordStatusFilterChange(value as "ALL" | CertificateStatus);
        }}
        renderLabel={(value) =>
          value === "ALL"
            ? activeTab === "requirements"
              ? "All Compliance"
              : "All Status"
            : humanizeTechnicalLabel(value)
        }
        minWidth={180}
      />

      <Button
        variant="icon"
        size="iconLg"
        onPress={onReset}
        leftIcon={
          <Ionicons name="refresh-outline" size={18} className="text-textMain" />
        }
        accessibilityLabel="Clear filters"
      />

      <Button
        variant="icon"
        size="iconLg"
        onPress={() => onExpandedChange(!isExpanded)}
        leftIcon={
          <Ionicons
            name={isExpanded ? "contract-outline" : "expand-outline"}
            size={18}
            className="text-textMain"
          />
        }
        accessibilityLabel={isExpanded ? "Exit expanded view" : "Expand table"}
      />
    </>
  );
}

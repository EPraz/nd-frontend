import { Button } from "@/src/components/ui/button/Button";
import { ToolbarSelect } from "@/src/components/ui/forms/ToolbarSelect";
import {
  TableDateRangeFilter,
  TableFilterSearch,
} from "@/src/components/ui/table";
import type { AssetDto } from "@/src/contracts/assets.contract";
import type { DateWindowFilter } from "@/src/contracts/pagination.contract";
import { humanizeTechnicalLabel } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import type {
  CertificateCategory,
  CertificateStatus,
  CertificateWorkflowStatus,
  RequirementStatus,
} from "@/src/features/certificates/shared";
import {
  RECORD_STATUS_FILTERS,
  REQUIREMENT_FILTERS,
} from "./certificatesByProject.constants";

type ActiveTab = "overview" | "requirements";

type Props = {
  activeTab: ActiveTab;
  requirementFilter: "ALL" | RequirementStatus;
  recordStatusFilter: "ALL" | CertificateStatus;
  showStatusMenu: boolean;
  onToggleStatusMenu: () => void;
  onRequirementFilterChange: (value: "ALL" | RequirementStatus) => void;
  onRecordStatusFilterChange: (value: "ALL" | CertificateStatus) => void;
  assetFilter: string;
  vessels: AssetDto[];
  showAssetMenu: boolean;
  onToggleAssetMenu: () => void;
  onAssetFilterChange: (value: string) => void;
  categoryFilter: "ALL" | CertificateCategory;
  showCategoryMenu: boolean;
  onToggleCategoryMenu: () => void;
  onCategoryFilterChange: (value: "ALL" | CertificateCategory) => void;
  workflowStatusFilter: "ALL" | CertificateWorkflowStatus;
  showWorkflowMenu: boolean;
  onToggleWorkflowMenu: () => void;
  onWorkflowStatusFilterChange: (value: "ALL" | CertificateWorkflowStatus) => void;
  dateWindow: "ALL" | DateWindowFilter;
  dateFrom: string;
  dateTo: string;
  showDateWindowMenu: boolean;
  onToggleDateWindowMenu: () => void;
  showDateRangeMenu: boolean;
  onDateRangeOpenChange: (open: boolean) => void;
  onDateWindowChange: (value: "ALL" | DateWindowFilter) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onDateRangeClear: () => void;
  vesselQuery: string;
  onVesselQueryChange: (value: string) => void;
  isSearchOpen: boolean;
  onSearchOpenChange: (open: boolean) => void;
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onReset: () => void;
};

export function CertificatesByProjectTableActions({
  activeTab,
  requirementFilter,
  recordStatusFilter,
  showStatusMenu,
  onToggleStatusMenu,
  onRequirementFilterChange,
  onRecordStatusFilterChange,
  assetFilter,
  vessels,
  showAssetMenu,
  onToggleAssetMenu,
  onAssetFilterChange,
  categoryFilter,
  showCategoryMenu,
  onToggleCategoryMenu,
  onCategoryFilterChange,
  workflowStatusFilter,
  showWorkflowMenu,
  onToggleWorkflowMenu,
  onWorkflowStatusFilterChange,
  dateWindow,
  dateFrom,
  dateTo,
  showDateWindowMenu,
  onToggleDateWindowMenu,
  showDateRangeMenu,
  onDateRangeOpenChange,
  onDateWindowChange,
  onDateFromChange,
  onDateToChange,
  onDateRangeClear,
  vesselQuery,
  onVesselQueryChange,
  isSearchOpen,
  onSearchOpenChange,
  isExpanded,
  onExpandedChange,
  onReset,
}: Props) {
  return (
    <>
      <View className="flex-row items-center gap-2">
        <TableFilterSearch
          value={vesselQuery}
          onChangeText={onVesselQueryChange}
          placeholder="Search vessel or certificate"
          open={isSearchOpen}
          onOpenChange={onSearchOpenChange}
          minWidth={300}
        />

        <ToolbarSelect
          value={activeTab === "requirements" ? requirementFilter : recordStatusFilter}
          options={
            activeTab === "requirements"
              ? REQUIREMENT_FILTERS
              : RECORD_STATUS_FILTERS
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

        <ToolbarSelect
          value={assetFilter}
          options={["ALL", ...vessels.map((vessel) => vessel.id)]}
          open={showAssetMenu}
          onToggle={onToggleAssetMenu}
          onChange={onAssetFilterChange}
          renderLabel={(value) => {
            if (value === "ALL") return "All vessels";
            return vessels.find((vessel) => vessel.id === value)?.name ?? "Vessel";
          }}
          triggerIconName="boat-outline"
          minWidth={170}
        />

        <ToolbarSelect
          value={categoryFilter}
          options={["ALL", "STATUTORY", "CLASS", "FLAG", "COMPANY", "OTHER"]}
          open={showCategoryMenu}
          onToggle={onToggleCategoryMenu}
          onChange={(value) =>
            onCategoryFilterChange(value as "ALL" | CertificateCategory)
          }
          renderLabel={(value) =>
            value === "ALL" ? "All categories" : humanizeTechnicalLabel(value)
          }
          triggerIconName="layers-outline"
          minWidth={176}
        />

        {activeTab === "overview" ? (
          <>
            <ToolbarSelect
              value={workflowStatusFilter}
              options={["ALL", "DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "ARCHIVED"]}
              open={showWorkflowMenu}
              onToggle={onToggleWorkflowMenu}
              onChange={(value) =>
                onWorkflowStatusFilterChange(
                  value as "ALL" | CertificateWorkflowStatus,
                )
              }
              renderLabel={(value) =>
                value === "ALL" ? "All workflow" : humanizeTechnicalLabel(value)
              }
              triggerIconName="git-branch-outline"
              minWidth={176}
            />

            <ToolbarSelect
              value={dateWindow}
              options={["ALL", "OVERDUE", "NEXT_30", "NEXT_90", "THIS_YEAR"]}
              open={showDateWindowMenu}
              onToggle={onToggleDateWindowMenu}
              onChange={(value) =>
                onDateWindowChange(value as "ALL" | DateWindowFilter)
              }
              renderLabel={(value) =>
                value === "ALL"
                  ? "Any expiry"
                  : value === "OVERDUE"
                    ? "Overdue"
                    : value === "NEXT_30"
                      ? "Next 30 days"
                      : value === "NEXT_90"
                        ? "Next 90 days"
                        : "This year"
              }
              triggerIconName="calendar-outline"
              minWidth={154}
            />

            <TableDateRangeFilter
              from={dateFrom}
              to={dateTo}
              open={showDateRangeMenu}
              onOpenChange={onDateRangeOpenChange}
              onFromChange={onDateFromChange}
              onToChange={onDateToChange}
              onClear={onDateRangeClear}
              label="Expiry range"
            />
          </>
        ) : null}
      </View>

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



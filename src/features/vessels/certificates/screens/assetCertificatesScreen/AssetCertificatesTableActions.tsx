import { Button } from "@/src/components/ui/button/Button";
import {
  TableFilterDateRange,
  TableFilterMenu,
  TableFilterOptionGroup,
  TableToolbarSearch,
} from "@/src/components/ui/table";
import type { DateWindowFilter } from "@/src/contracts/pagination.contract";
import { humanizeTechnicalLabel } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import type {
  CertificateCategory,
  CertificateStatus,
  CertificateWorkflowStatus,
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
  onRequirementFilterChange: (value: "ALL" | RequirementStatus) => void;
  onRecordStatusFilterChange: (value: "ALL" | CertificateStatus) => void;
  categoryFilter: "ALL" | CertificateCategory;
  onCategoryFilterChange: (value: "ALL" | CertificateCategory) => void;
  workflowStatusFilter: "ALL" | CertificateWorkflowStatus;
  onWorkflowStatusFilterChange: (value: "ALL" | CertificateWorkflowStatus) => void;
  dateWindow: "ALL" | DateWindowFilter;
  dateFrom: string;
  dateTo: string;
  onDateWindowChange: (value: "ALL" | DateWindowFilter) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onDateRangeClear: () => void;
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onReset: () => void;
  search: string;
  onSearchChange: (value: string) => void;
};

export function AssetCertificatesTableActions({
  activeTab,
  requirementFilter,
  recordStatusFilter,
  onRequirementFilterChange,
  onRecordStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  workflowStatusFilter,
  onWorkflowStatusFilterChange,
  dateWindow,
  dateFrom,
  dateTo,
  onDateWindowChange,
  onDateFromChange,
  onDateToChange,
  onDateRangeClear,
  isExpanded,
  onExpandedChange,
  onReset,
  search,
  onSearchChange,
}: Props) {
  const currentStatusFilter =
    activeTab === "requirements" ? requirementFilter : recordStatusFilter;
  const activeFilterCount =
    (search ? 1 : 0) +
    (currentStatusFilter !== "ALL" ? 1 : 0) +
    (categoryFilter !== "ALL" ? 1 : 0) +
    (activeTab === "overview" && workflowStatusFilter !== "ALL" ? 1 : 0) +
    (activeTab === "overview" && (dateWindow !== "ALL" || dateFrom || dateTo)
      ? 1
      : 0);

  return (
    <>
      <TableToolbarSearch
        value={search}
        onChangeText={onSearchChange}
        placeholder="Search certificate"
      />

      <TableFilterMenu
        title={
          activeTab === "requirements"
            ? "Vessel requirements"
            : "Vessel records"
        }
        activeCount={activeFilterCount}
        onClear={onReset}
      >
        <TableFilterOptionGroup
          label={activeTab === "requirements" ? "Compliance" : "Status"}
          value={currentStatusFilter}
          options={
            activeTab === "requirements"
              ? ASSET_REQUIREMENT_FILTERS
              : ASSET_RECORD_STATUS_FILTERS
          }
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
        />

        <TableFilterOptionGroup
          label="Category"
          value={categoryFilter}
          options={["ALL", "STATUTORY", "CLASS", "FLAG", "COMPANY", "OTHER"]}
          onChange={(value) =>
            onCategoryFilterChange(value as "ALL" | CertificateCategory)
          }
          renderLabel={(value) =>
            value === "ALL" ? "All categories" : humanizeTechnicalLabel(value)
          }
        />

        {activeTab === "overview" ? (
          <>
            <TableFilterOptionGroup
              label="Workflow"
              value={workflowStatusFilter}
              options={["ALL", "DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "ARCHIVED"]}
              onChange={(value) =>
                onWorkflowStatusFilterChange(
                  value as "ALL" | CertificateWorkflowStatus,
                )
              }
              renderLabel={(value) =>
                value === "ALL" ? "All workflow" : humanizeTechnicalLabel(value)
              }
            />

            <TableFilterOptionGroup
              label="Expiry"
              value={dateWindow}
              options={["ALL", "OVERDUE", "NEXT_30", "NEXT_90", "THIS_YEAR"]}
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
            />

            <TableFilterDateRange
              from={dateFrom}
              to={dateTo}
              onFromChange={onDateFromChange}
              onToChange={onDateToChange}
              onClear={onDateRangeClear}
              label="Expiry range"
            />
          </>
        ) : null}
      </TableFilterMenu>

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

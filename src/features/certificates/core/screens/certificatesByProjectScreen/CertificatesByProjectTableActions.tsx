import { Button } from "@/src/components/ui/button/Button";
import { ToolbarSelect } from "@/src/components/ui/forms/ToolbarSelect";
import { humanizeTechnicalLabel } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, TextInput, View } from "react-native";
import type {
  CertificateStatus,
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
        <View
          className={[
            "flex-row items-center overflow-hidden rounded-full border border-shellLine bg-shellPanel",
            isSearchOpen || vesselQuery ? "min-w-[260px]" : "w-11",
          ].join(" ")}
        >
          <Pressable
            onPress={() => {
              if (isSearchOpen && !vesselQuery) {
                onSearchOpenChange(false);
                return;
              }
              onSearchOpenChange(true);
            }}
            className="h-11 w-11 items-center justify-center"
          >
            <Ionicons
              name="search-outline"
              size={18}
              color="rgba(221,230,237,0.95)"
            />
          </Pressable>

          {isSearchOpen || vesselQuery ? (
            <View className="flex-1 flex-row items-center pr-2">
              <TextInput
                value={vesselQuery}
                onChangeText={onVesselQueryChange}
                placeholder="Search vessel"
                placeholderTextColor="rgba(221,230,237,0.35)"
                className="h-11 flex-1 text-textMain"
                autoCapitalize="words"
                autoCorrect={false}
              />

              <Pressable
                onPress={() => {
                  onVesselQueryChange("");
                  onSearchOpenChange(false);
                }}
                className="h-9 w-9 items-center justify-center"
              >
                <Ionicons
                  name="close"
                  size={16}
                  color="rgba(221,230,237,0.75)"
                />
              </Pressable>
            </View>
          ) : null}
        </View>

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



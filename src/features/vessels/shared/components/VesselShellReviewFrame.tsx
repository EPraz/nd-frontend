import { Button, Text } from "@/src/components";
import type { AssetDto } from "@/src/contracts/assets.contract";
import { humanizeTechnicalLabel } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import type { VesselSummaryDto } from "../../core/contracts";
import { VesselModuleTabs } from "./VesselModuleTabs";
import {
  getVesselIdentifier,
  getVesselMetaFacts,
  type VesselShellNavItem,
} from "./vesselShellLayout.helpers";

type Props = {
  vessel: AssetDto;
  summary: VesselSummaryDto;
  projectName: string;
  pathname: string;
  navItems: VesselShellNavItem[];
  hasDedicatedActiveSection: boolean;
  refresh: () => Promise<void>;
  onNavigate: (href: string) => void;
  onOpenEdit: () => void;
};

export function VesselShellReviewFrame({
  vessel,
  summary,
  projectName,
  pathname,
  navItems,
  hasDedicatedActiveSection,
  refresh,
  onNavigate,
  onOpenEdit,
}: Props) {
  const identityLine = [
    getVesselIdentifier(vessel),
    humanizeTechnicalLabel(vessel.status),
    projectName,
  ]
    .filter(Boolean)
    .join(" • ");

  const allMetaFacts = getVesselMetaFacts(vessel, summary);
  const refreshedLabel =
    allMetaFacts.find((fact) => fact.label === "Summary refreshed")?.value ??
    "—";

  return (
    <View className="overflow-hidden">
      <View className="gap-4">
        <View className="flex-row flex-wrap items-start justify-between gap-4">
          <View className="min-w-[280px] flex-1 gap-3">
            <View className="gap-1">
              <Text className="text-[10px] font-semibold uppercase tracking-[0.24em] text-shellHighlight">
                Operational profile
              </Text>
              <Text className="text-[34px] leading-[1.05] font-semibold tracking-tight text-textMain">
                {vessel.name}
              </Text>
              <Text className="text-[13px] leading-6 text-muted">
                {identityLine}
              </Text>
            </View>
          </View>

          <View className="min-w-[220px] items-end gap-2">
            <View className="flex-row flex-wrap items-center justify-end gap-2">
              <Button
                variant="icon"
                size="icon"
                onPress={onOpenEdit}
                accessibilityLabel="Edit vessel"
                className="rounded-full"
                leftIcon={
                  <Ionicons
                    name="create-outline"
                    size={16}
                    className="text-textMain"
                  />
                }
              />
              <Button
                variant="iconAccent"
                size="icon"
                onPress={refresh}
                accessibilityLabel="Refresh vessel"
                className="rounded-full"
                leftIcon={
                  <Ionicons
                    name="refresh-outline"
                    size={16}
                    className="text-textMain"
                  />
                }
              />
            </View>

            <Text className="text-[11px] text-muted">
              Summary refreshed {refreshedLabel}
            </Text>
          </View>
        </View>
      </View>

      <View className="">
        <VesselModuleTabs
          navItems={navItems}
          pathname={pathname}
          hasDedicatedActiveSection={hasDedicatedActiveSection}
          onNavigate={onNavigate}
        />
      </View>

      <View className="h-px bg-shellLine" />
    </View>
  );
}
